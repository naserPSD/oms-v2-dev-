"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import Input from "@/components/ui/Input";
import RestApi, { baseURL } from "@/utils/RestApi";
import helpers, { toaster, socialPopupLogin } from "@/utils/helpers";
import Loading from "@/components/common/Loading";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthUserInfo, getCommonDropdownList } from "@/utils/commonApiFunction";
import { useTranslation } from 'next-i18next'
import SocialLoginSection from "@/components/common/SocialLoginSection";
import { useCommonStore } from "@/store/useCommonStore";
import Cookies from 'js-cookie';
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useMenuStore } from "@/store/useMenuStore";

function loginRedirectPath(user, invitationCode = "") {
  if (user?.appUseCase === "Admin") return "/admin";
  if (invitationCode) {
    return `/hr-dashboard/my-invitation-requests?invitationCode=${invitationCode}`;
  }
  return "/main-dashboard";
}

const Login = () => {

  const { t } = useTranslation();
    const { useResetTanstackCache } = useCommonQueryApi({});

  const searchParams = useSearchParams();
  const invitationCode = searchParams.get("invitationCode") || "";

  const callLoginApi = useAuthStore((state) => state.callLoginApi);
  const isDropdownLoaded = useCommonStore((state) => state.isDropdownLoaded);

  // ✅ Zod schema for validation
  const schema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
    // rememberMe: z.literal(true, { errorMap: () => ({ message: "You must agree to remember me" }) }),
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [accessToken, setAccessToken] = useState(undefined); // undefined means "not checked yet"
  const [checking, setChecking] = useState(true);

  const authUser = useAuthStore((state) => state.user);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     setAccessToken(localStorage.getItem("accessToken"));
  //     setChecking(false);
  //     if (accessToken) {

  //       if (invitationCode) {
  //         router.push(`/hr-dashboard/my-invitation-requests?invitationCode=${invitationCode}`);
  //         return;
  //       }

  //       router.push("/main-dashboard");
  //     }

  //     if (!accessToken) {
  //       useResetTanstackCache();
  //     }
  //   }
  // }, [accessToken, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");

    if (token) {
      const authUser = useAuthStore.getState().user;
      const permissions = useAuthStore.getState().permissions;
      const target = loginRedirectPath(authUser, invitationCode);
      localStorage.removeItem("lastVisitedUrl");
      router.replace(target);
    } else {
      useResetTanstackCache();
    }
  }, [router, invitationCode]);

  useEffect(() => {
    if (!callLoginApi && accessToken) {
      console.log('getAuthUserInfo form login', getAuthUserInfo)
      getAuthUserInfo(setLoading)
    }
  }, [callLoginApi]);

  useEffect(() => {
    if (!isDropdownLoaded && accessToken) {
      getCommonDropdownList(setLoading)
    }
  }, [accessToken, isDropdownLoaded, setLoading]);

  const [geoLoading, setGeoLoading] = useState(false);

  const submitForm = async (values) => {
      if (!navigator.geolocation) {
        toaster("Geolocation not supported by your browser.", "danger");
        return;
      }
  
      if (geoLoading) {
        return;
      }
  
      setGeoLoading(true);
      const getPosition = (opts) =>
        new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, opts)
        );

      // Device name helper — prefer User-Agent Client Hints when available
      const getDeviceName = () => {
        try {
          if (navigator.userAgentData) {
            const platform = navigator.userAgentData.platform || "";
            const brands = (navigator.userAgentData.brands || navigator.userAgentData.uaList || [])
              .map((b) => (b && (b.brand || b.model)) || b)
              .filter(Boolean)
              .join(" ");
            return `${platform}${brands ? ' - ' + brands : ''}`.trim();
          }
        } catch (e) {
          // ignore
        }
        return navigator.platform || navigator.userAgent || "";
      };

      const deviceName = getDeviceName();


      // If permission is explicitly denied, bail out with a friendly message
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: "geolocation" });
          if (perm.state === "denied") {
            toaster("Location access denied. Enable location permission in browser settings.", "danger");
            setGeoLoading(false);
            return;
          }
        } catch (e) {
          // ignore permission query failures and continue to try getting position
        }
      }

      let position = null;
      // Try a faster, low-accuracy attempt first (usually quicker on some devices/browsers)
      try {
        position = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
      } catch (err) {
        // If it timed out, retry with high accuracy and longer timeout
        if (err?.code === 3) {
          try {
            position = await getPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
          } catch (err2) {
            // leave position null to trigger fallback
            position = null;
          }
        } else {
          // other errors (permission denied, position unavailable) -> rethrow to outer catch
          throw err;
        }
      }


      // If we still don't have a position, try an IP-based coarse fallback (best-effort)
      if (!position) {
        try {
          const res = await fetch("https://ipapi.co/json/"); // free IP geolocation service
          if (res.ok) {
            const ipData = await res.json();
            console.log('ipData', ipData)
            const latitude = parseFloat(ipData.latitude);
            const longitude = parseFloat(ipData.longitude);
            const cityFromIp = ipData.city || '';
            const countryFromIp = ipData.country_name || ipData.country || '';
            const timezoneFromIp = ipData.timezone || ipData.utc_offset || '';
            const locationFromIp = (ipData.city || ipData.region || ipData.country_name)
              ? `${ipData.city ? ipData.city + ', ' : ''}${ipData.region ? ipData.region + ', ' : ''}${ipData.country_name || ''}`
              : `${ipData.latitude},${ipData.longitude}`;

            if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
              toaster("Using approximate location (IP-based).", "warning");
              await handleUserLogin({ ...values, location: locationFromIp, city: cityFromIp, countryName: countryFromIp, lastTimezone: timezoneFromIp, device: deviceName });
              setGeoLoading(false);
              return;
            }
          }
        } catch (ipErr) {
          // ignore IP fallback errors
        }

        toaster("Unable to retrieve location. Please allow location access.", "danger");
        setGeoLoading(false);
        return;
      }

      const { latitude, longitude } = position.coords;

      console.log('Got position', { latitude, longitude });

      // Try reverse-geocoding to get human-readable location, city, country and timezone
      let locationStr = `${latitude},${longitude}`;
      let city = "";
      let countryName = "";
      // Prefer provider timezone; fallback to browser timezone
      let timezone = (Intl && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions && Intl.DateTimeFormat().resolvedOptions().timeZone) ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

      try {
        // Primary: Nominatim (OpenStreetMap) reverse geocoding
        const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        if (nominatimRes.ok) {
          const nData = await nominatimRes.json();
          locationStr = nData.display_name || locationStr;
          const addr = nData.address || {};
          city = addr.city || addr.town || addr.village || addr.hamlet || addr.county || "";
          countryName = addr.country || "";
        }
      } catch (e) {
        // ignore primary reverse-geocode failures and try a fallback
        try {
          const bdRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          if (bdRes.ok) {
            const bd = await bdRes.json();
            city = bd.city || bd.locality || bd.principalSubdivision || city;
            countryName = bd.countryName || countryName;
            const bdTimezone = bd.timezone || bd.timeZone || bd.timezoneName || (bd.localityInfo && bd.localityInfo.timezones && bd.localityInfo.timezones[0] && bd.localityInfo.timezones[0].name) || '';
            if (bdTimezone) {
              timezone = bdTimezone;
            }
            if (!locationStr || locationStr === `${latitude},${longitude}`) {
              locationStr = bd.locality || locationStr;
            }
          }
        } catch (e2) {
          // ignore fallback errors
        }
      }

    await handleUserLogin({ ...values, location: locationStr, city, countryName, lastTimezone: timezone, device: deviceName });
      setGeoLoading(false);
      return;
    }

  const handleUserLogin = async (values) => {
      // console.log('values', values)
      // return;
      setLoading(true);
    const { setAuth, clearAuth, setPermissions } = useAuthStore.getState();
    const { setLeftSidebarMenu } = useMenuStore.getState();
      try {
        const { data } = await RestApi.post("/api/v1/auth/login", values);

        // console.log('data', data)

        const { accessToken, refreshToken, tokenType, sessionId, user, permissions, leftSidebarMenu } = data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("sessionId", sessionId);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        let resolvedAppId = user?.activeAppId || user?.activeApp?.id;
        if (!resolvedAppId && accessToken && typeof accessToken === "string" && accessToken.includes(".")) {
          try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            resolvedAppId = payload?.activeAppId || payload?.appId;
          } catch (e) {}
        }
        if (resolvedAppId) {
          localStorage.setItem("activeAppId", String(resolvedAppId));
        }

        setAuth({ accessToken, refreshToken, tokenType, user, callLoginApi: true });
        setPermissions(permissions);
        setLeftSidebarMenu(leftSidebarMenu);
        // console.log('login user')

        localStorage.removeItem("isLoggedOut");

        toaster('You are logged in successfully');

        if (user && !user.emailVerifiedAt) {
          router.replace("/email-verification");
          return;
        }

        localStorage.removeItem("lastVisitedUrl");
        router.replace(loginRedirectPath(user, invitationCode));
      } catch (error) {
        helpers.handleApiValidationError(error, setError);
      } finally {
        setLoading(false);
      }

    }
  


  const handleGoogleLogin = async () => {
    try {
      const { data } = await googlePopupLogin(baseURL);
      const { accessToken, tokenType, user } = data;

      const { setAuth } = useAuthStore.getState();
      setAuth({ accessToken, tokenType, user, callLoginApi: true });
      localStorage.setItem("accessToken", accessToken);
      localStorage.removeItem("isLoggedOut");

      toaster('You are logged in successfully');
      reset();
      if (user && !user.emailVerifiedAt) {
        router.replace("/email-verification");
      } else {
        localStorage.removeItem("lastVisitedUrl");
        router.replace(loginRedirectPath(user));
      }
    } catch (err) {
      console.error('Google login failed:', err);
      helpers.handleApiValidationError(error, setError);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const { data } = await socialPopupLogin(provider, baseURL);
      const { accessToken, tokenType, user } = data;

      const { setAuth } = useAuthStore.getState();
      setAuth({ accessToken, tokenType, user, callLoginApi: true });
      localStorage.setItem("accessToken", accessToken);
      localStorage.removeItem("isLoggedOut");
      await getAuthUserInfo(setLoading)

      toaster('You are logged in successfully');
      reset();
      if (user && !user.emailVerifiedAt) {
        router.replace("/email-verification");
      } else {
        localStorage.removeItem("lastVisitedUrl");
        router.replace(loginRedirectPath(user));
      }
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  // const loginWithGoogle = async () => {
  //   console.log('loginWithGoogle called');
  //   try {
  //     setLoading(true);
  //     const { data } = await RestApi.get("/auth/google/login");
  //     console.log('Google login data', data);
  //     // Redirect to Google login URL
  //     if (data?.url) {
  //       window.location.href = data.url;
  //     }
  //   } catch (error) {
  //     helpers.handleApiValidationError(error, setError);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  return (
    // <div className=" min-h-[92vh] flex items-center justify-center">
    <div className=" flex items-center justify-center">
      <div className="flex items-center justify-center">
        <div className="max-w-[1066px] w-full mx-auto flex flex-col lg:flex-row  overflow-hidden ">
          {/* Left: login Image Section */}
          <div className="hidden lg:flex lg:w-1/2 w-full items-center justify-center bg-background-light dark:bg-theme-dark p-4">
            <Image
              src="/assets/images/auth/group.png"
              alt="Login"
              width={500}
              height={500}
              className="mx-auto"
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] bg-gray-400 md:mx-6"></div>

          {/* Right: Form Section */}

          <div className="lg:w-1/2 w-full flex items-center justify-center p-6">

            <div className="w-full max-w-[450px]">
              {/* {t('description')} */}
              <h2 className="text-gray-900 dark:text-gray-300 font-bold text-xl mb-1">
                Welcome to Sanzio!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please sign-in to your account and start the adventure
              </p>

              {/* {isSubmitting || isLoading ? (
                <Loading />
              ) : null} */}

              <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>

                {/* <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                /> */}
                {/* <Input
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  showPasswordToggle={false}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  onChange={(e) => setValue('password')}
                  error={errors.password?.message}
                  {...register("password")}
                /> */}

                          <Controller
                            control={control}
                            name="email"
                            render={({ field, fieldState }) => (
                              <Input
                                type="email"
                                label="Email"
                                placeholder="Enter your email"
                                value={field.value}
                                onChange={(val) => field.onChange(val)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    passwordRef.current?.focus();
                                  }
                                }}
                                ref={emailRef}
                                error={fieldState.error?.message}
                              />
                            )}
                          />

                          <Controller
                            control={control}
                            name="password"
                            render={({ field, fieldState }) => (
                              <Input
                                type="password"
                                label="Password"
                                showPasswordToggle
                                placeholder="Enter your password"
                                value={field.value}
                                onChange={(val) => field.onChange(val)}
                                ref={passwordRef}
                                error={fieldState.error?.message}
                              />
                            )}
                          />

                {/* Checkbox Row */}
                <div className="flex flex-row items-center justify-end gap-3">
                  {/* <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="forgot-password"
                      className="accent-primary w-4 h-4"
                    />
                    <label
                      htmlFor="forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      <span className=" text-sm">
                        Remember me
                      </span>
                    </label>
                  </div> */}


                  {/* <Input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checkboxLabel="Remember me"
                    error={errors.rememberMe?.message}
                    {...register("rememberMe")}
                  /> */}
                  <Link
                    href="/forget-password"
                    className="text-primary hover:underline underline-offset-4 text-sm"
                  >
                    Forget password
                  </Link>
                </div>

                {/* Sign In Button */}
                {isSubmitting || isLoading ? (
                  <div
                    type="submit"
                    className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm text-center flex items-center justify-center cursor-not-allowed"
                  >
                    <MiniSpinner />

                  </div>
                ) : (
                  <button
                    type="submit"
                    className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </form>

              {/* OR divider */}
              {/* <div className="relative my-6 text-center">
                <span className="relative px-2 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase">
                  or
                </span>
              </div> */}

              {/* Social Buttons */}


              {/* <SocialLoginSection /> */}

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-700 dark:text-gray-300 mt-3">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-primaryColor ">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
