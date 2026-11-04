"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
// import SignUpForm from "./SignUpForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import RestApi from "@/utils/RestApi";
import helpers, { toaster } from "@/utils/helpers";
import Loading from "@/components/common/Loading";
import { useAuthStore } from "@/store/useAuthStore";
import { useDebounce } from "@/utils/useDebounce";
import { FaAnglesRight } from "react-icons/fa6";
import { useForm, useWatch } from "react-hook-form";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import Input from "@/components/ui/Input";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import ButtonTw from "@/components/ui/ButtonTw";
import ButtonTw2 from "@/components/ui/ButtonTw2";
import SocialLoginSection from "@/components/common/SocialLoginSection";

const SignUp = () => {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get("invitationCode") || "";
  const email = searchParams.get("email") || "";

  const [accessToken, setAccessToken] = useState(undefined); // undefined means "not checked yet"
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("accessToken"));
      setChecking(false);
      if (accessToken) {

        if (invitationCode) {
          router.push(`/hr-dashboard/my-invitation-requests?invitationCode=${invitationCode}`);
          return;
        }

        router.push("/main-dashboard");
      }
    }
  }, [accessToken, router]);

  // ✅ Zod schema for validation
  const schema = z.object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First Name is required')
      .min(2, 'First Name must be at least 2 characters')
      .max(30, 'First Name must not exceed 30 characters')
      .regex(/^[A-Za-z\s]+$/, 'First name can only contain letters'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last Name is required')
      .min(2, 'Last Name must be at least 2 characters')
      .max(30, 'Last Name must not exceed 30 characters')
      .regex(/^[A-Za-z\s]+$/, 'Last name can only contain letters'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Must be at least 8 characters')
      .max(50, 'Password must not exceed 50 characters')
      .refine(
        (val) => !/<\s*[^>]+>|<\s*\/\s*[^>]+>|script/i.test(val),
        'HTML tags and scripts are not allowed in password',
      ),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
    invitationCode: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // set the error on confirmPassword field
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    invitationCode: "",
  };

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    control
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState("");

  const emailValue = useWatch({
    control,
    name: "email",
    defaultValue: "",
  });

  const debouncedEmail = useDebounce(emailValue, 400);

  // Clear email exists error as soon as user types/modifies the email
  useEffect(() => {
    if (emailExistsError && emailValue !== debouncedEmail) {
      setEmailExistsError("");
    }
  }, [emailValue, debouncedEmail, emailExistsError]);

  // Check email uniqueness on change when debounce completes
  useEffect(() => {
    let isCancelled = false;

    const checkEmail = async () => {
      const trimmed = debouncedEmail ? debouncedEmail.trim() : "";
      if (!trimmed) {
        setEmailExistsError("");
        return;
      }

      // Check format first before querying backend
      const isEmailValid = z.string().email().safeParse(trimmed).success;
      if (!isEmailValid) {
        setEmailExistsError("");
        return;
      }

      setIsCheckingEmail(true);
      try {
        const { data } = await RestApi.get(
          `/api/v1/auth/check-email?email=${encodeURIComponent(trimmed)}`
        );
        if (isCancelled) return;
        const exists = data?.data?.exists ?? data?.exists;
        if (exists) {
          const errMsg = "Email already exists";
          setEmailExistsError(errMsg);
          setError("email", {
            type: "manual",
            message: errMsg,
          });
        } else {
          setEmailExistsError("");
          clearErrors("email");
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to check email availability:", err);
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingEmail(false);
        }
      }
    };

    checkEmail();

    return () => {
      isCancelled = true;
    };
  }, [debouncedEmail, setError, clearErrors]);

  useEffect(() => {
    // if (invitationCode) {
    //   console.log('Invitation Code:', invitationCode);
    //   setValue('invitationCode', invitationCode);
    // }
    // if (email) {
    //   console.log('Email:', email);
    //   setValue('email', email);
    // }
    if (email || invitationCode) {
      console.log('Setting form values...');
      reset({
        ...initialValues,
        email,
        invitationCode,
      });
    }
  }, [invitationCode, email]);

  const [isPasswordShow, setPasswordShow] = useState(false);
  const [requirements, setRequirements] = useState({
    minLength: false,
    maxLength: true,
    noHtmlScript: true,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    confirmPasswordMatch: false,
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const confirmPassword = useWatch({
    control,
    name: "confirmPassword",
    defaultValue: "",
  });

  // Watch the password field to update requirements
  useEffect(() => {
    if (password) {
      setRequirements({
        minLength: password.length >= 8,
        maxLength: password.length <= 50,
        noHtmlScript: !/<\s*[^>]+>|<\s*\/\s*[^>]+>|script/i.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        confirmPasswordMatch: password === confirmPassword,
      });
    } else {
      setRequirements({
        minLength: false,
        maxLength: true,
        noHtmlScript: true,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        confirmPasswordMatch: false,
      });
    }
  }, [password, confirmPassword]);

  // Password validation rules
  const passwordValidation = {
    required: "Password is required!",
    minLength: {
      value: 8,
      message: "Must be at least 8 characters",
    },
    validate: {
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || "Must contain at least one uppercase letter",
      hasLowerCase: (value) =>
        /[a-z]/.test(value) || "Must contain at least one lowercase letter",
      hasNumber: (value) =>
        /[0-9]/.test(value) || "Must contain at least one number",
      hasSpecialChar: (value) =>
        /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
        "Must contain at least one special character",
    },
  };

  // Form submission handler
  // const submitForm = async (values) => {
  //   setLoading(true);
  //   try {
  //     const { data } = await RestApi.post("/api/v1/auth/register", values);
  //     toaster('Registration successful! Please login.');
  //     reset();
  //     router.push("/sign-in?invitationCode=" + values.invitationCode);
  //   } catch (error) {
  //     helpers.handleApiValidationError(error, setError);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  const submitForm = async (values) => {
    if (emailExistsError) {
      setError("email", {
        type: "manual",
        message: emailExistsError,
      });
      return;
    }

    if (isCheckingEmail) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await RestApi.post("/api/v1/auth/register", values);
      const { accessToken, refreshToken, tokenType, sessionId, user } = data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("sessionId", sessionId);

      console.log('signup response:', data);
      console.log('signup user:', user);

      const { setAuth } = useAuthStore.getState();
      setAuth({ accessToken, refreshToken, tokenType, user, callLoginApi: true });
      // console.log('login user')

      localStorage.setItem("accessToken", accessToken);
      localStorage.removeItem("isLoggedOut");

      // Verification email is sent automatically upon registration by backend
      toaster('Verification link sent to your email. Please verify your email.');

      if (user.appUsers && user.appUsers.length > 1) {
        router.push("/choose-user-app");
        return;
      }

      if (invitationCode) {
        router.push(`/hr-dashboard/my-invitation-requests?invitationCode=${invitationCode}`);
        return;
      }

      // Check if email is NOT verified (emailVerifiedAt is null/undefined)
      if (user && !user.emailVerifiedAt) {
        sessionStorage.setItem("emailVerificationSent", "true");
        router.push("/email-verification");
        return;
      } else {
        router.push("/main-dashboard");
      }
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center pb-8">
      <div className="max-w-[1066px] w-full mx-auto flex flex-col lg:flex-row ">
        {/* Left: Image */}
        <div className="lg:w-1/2 w-full flex items-center justify-center bg-gray-100 dark:bg-theme-dark p-4">
          <Image
            src="/assets/images/auth/group.png"
            alt="Reset"
            width={500}
            height={500}
            className="mx-auto"
          />
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-[1px] bg-gray-400 md:mx-6"></div>

        {/* Right: Form */}
        <div className="lg:w-1/2 w-full flex items-center justify-center px-6">
          <div className="w-full max-w-[450px]">
            <h2 className="text-gray-900 dark:text-gray-300 font-bold text-xl mb-1">
              Create Your Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Sign up to manage your employees, payroll, and benefits from one platform.
            </p>

            {isSubmitting || isLoading ? (
              <Loading />
            ) : null}
            <form className="" onSubmit={handleSubmit(submitForm)}>

              <div className="flex items-center justify-between gap-4">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-1/2"
                      id="firstName"
                      label="First Name *"
                      type="text"
                      placeholder="Enter your first name"
                      autoComplete="given-name"
                      maxLength={30}
                      value={field.value}
                      onChange={(val) => {
                        const str = typeof val === "string" ? val : val?.target?.value ?? "";
                        field.onChange(str);
                      }}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <Input
                      className="w-1/2"
                      id="lastName"
                      label="Last Name *"
                      type="text"
                      placeholder="Enter your last name"
                      autoComplete="family-name"
                      maxLength={30}
                      value={field.value}
                      onChange={(val) => {
                        const str = typeof val === "string" ? val : val?.target?.value ?? "";
                        field.onChange(str);
                      }}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <Input
                    type="email"
                    label="Email *"
                    placeholder="Enter your email"
                    value={field.value}
                    onChange={(val, e) => {
                      setEmailExistsError("");
                      field.onChange(val, e);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                    error={fieldState.error?.message || emailExistsError}
                    icon={isCheckingEmail ? <MiniSpinner /> : null}
                    iconPosition="right"
                    className="col-span-12"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <Input
                    type="password"
                    label="Password *"
                    placeholder="Enter your password"
                    maxLength={50}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12"
                    {...field}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Input
                    type="password"
                    label="Confirm Password *"
                    placeholder="Enter your confirm password"
                    maxLength={50}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    className="col-span-12"
                    {...field}
                  />
                )}
              />

              {/* Password Requirements */}
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <ul className="flex flex-col gap-1">
                  <li
                    className={`flex items-center gap-2 ${requirements.minLength ? "text-green-500" : ""
                      }`}
                  >
                    {requirements.minLength ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaAnglesRight />
                    )}
                    Minimum 8 characters (maximum 50)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${requirements.noHtmlScript && password ? "text-green-500" : ""
                      }`}
                  >
                    {requirements.noHtmlScript && password ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaAnglesRight />
                    )}
                    No HTML tags or scripts allowed
                  </li>
                  <li
                    className={`flex items-center gap-2 ${requirements.hasUpperCase ? "text-green-500" : ""
                      }`}
                  >
                    {requirements.hasUpperCase ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaAnglesRight />
                    )}
                    At least one uppercase letter (A-Z)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${requirements.hasLowerCase ? "text-green-500" : ""
                      }`}
                  >
                    {requirements.hasLowerCase ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaAnglesRight />
                    )}
                    At least one lowercase letter (a-z)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${requirements.hasNumber ? "text-green-500" : ""
                      }`}
                  >
                    {requirements.hasNumber ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaAnglesRight />
                    )}
                    At least one number (0-9)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${requirements.hasSpecialChar ? "text-green-500" : ""
                      }`}
                  >
                    {requirements.hasSpecialChar ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaAnglesRight />
                    )}
                    At least one special character (e.g., !, @, #, $, etc.)
                  </li>
                  <li
                    className={`flex items-center gap-2 ${requirements.confirmPasswordMatch ? "text-green-500" : ""
                      }`}
                  >
                    {requirements.confirmPasswordMatch ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaAnglesRight />
                    )}
                    Password and confirm password match
                  </li>
                </ul>
              </div>

              {/* <ButtonTw2 variant="borderedGradient-purpleToBlue" type="submit">Sign Up</ButtonTw2> */}

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
                  Sign Up
                </button>
              )}
            </form>

            {/* OR divider */}
            {/* <div className="relative my-4 text-center">
              <span className="relative px-2 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase">
                or
              </span>
            </div> */}

            {/* Social Buttons */}
            {/* <SocialLoginSection /> */}

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-700 dark:text-gray-300 mt-3">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primaryColor ">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
