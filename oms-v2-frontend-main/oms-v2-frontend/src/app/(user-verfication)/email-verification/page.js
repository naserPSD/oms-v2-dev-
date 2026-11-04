"use client";

import ButtonTw from "@/components/ui/ButtonTw";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { PiWarningCircle, PiEnvelopeSimpleOpen } from "react-icons/pi";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";
import Loading from "@/components/common/Loading";
import { getAuthUserInfo } from "@/utils/commonApiFunction";
import { useAuthStore } from "@/store/useAuthStore";

const EmailVerificationInner = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSessionId = searchParams.get("sessionId");
  const urlOtp = searchParams.get("otp");

  const [isVerifyingLink, setIsVerifyingLink] = useState(
    Boolean(urlSessionId && urlOtp)
  );
  const [linkVerificationError, setLinkVerificationError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  const hasVerifiedRef = useRef(false);

  // Auto-verify when URL contains sessionId and otp (from verification link)
  useEffect(() => {
    if (!urlSessionId || !urlOtp) return;
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    let isMounted = true;

    const verifyFromUrl = async () => {
      setIsVerifyingLink(true);
      setLinkVerificationError("");

      try {
        const { data } = await RestApi.post(
          "/api/v1/auth/verify-otp-for-email-verification",
          { sessionId: urlSessionId, otp: urlOtp },
          { skipErrorToast: true }
        );

        if (!isMounted) return;

        const loginData = data?.data;
        if (loginData?.accessToken) {
          localStorage.setItem("accessToken", loginData.accessToken);
          if (loginData.refreshToken)
            localStorage.setItem("refreshToken", loginData.refreshToken);
          if (loginData.sessionId)
            localStorage.setItem("sessionId", loginData.sessionId);
          localStorage.removeItem("isLoggedOut");

          const { setAuth } = useAuthStore.getState();
          setAuth({
            accessToken: loginData.accessToken,
            refreshToken: loginData.refreshToken,
            tokenType: loginData.tokenType,
            user: loginData.user,
            callLoginApi: true,
          });
        }

        // Signal InitialSetup modal to open immediately on dashboard
        if (typeof window !== "undefined") {
          window.__initialSetupModalOpen = true;
          sessionStorage.setItem("triggerInitialSetup", "true");
          sessionStorage.removeItem("emailVerificationSent");
        }

        try {
          await getAuthUserInfo(setLoading);
        } catch (fetchErr) {
          console.error("Error fetching updated user info:", fetchErr);
        }

        router.push("/main-dashboard");
      } catch (error) {
        if (!isMounted) return;
        console.error("Email verification link failed:", error);
        const errMsg =
          error?.response?.data?.message ||
          "Verification link is invalid or has expired. Please request a new verification link.";
        setLinkVerificationError(errMsg);
        setIsVerifyingLink(false);
      }
    };

    verifyFromUrl();

    return () => {
      isMounted = false;
    };
  }, [urlSessionId, urlOtp, router]);

  // Check if arrived right after signup
  useEffect(() => {
    if (typeof window !== "undefined" && !urlSessionId) {
      const justSent =
        sessionStorage.getItem("emailVerificationSent") === "true";
      if (justSent) {
        setEmailSentNotice(true);
      }
    }
  }, [urlSessionId]);

  // Redirect if already verified and not performing link verification
  useEffect(() => {
    if (user && user.emailVerifiedAt && !urlSessionId) {
      router.push("/main-dashboard");
    }
  }, [router, user, urlSessionId]);

  const sendVerificationMail = async () => {
    setLoading(true);
    setLinkVerificationError("");
    try {
      const { data } = await RestApi.post(
        "/api/v1/auth/send-verification-otp",
        {},
        { skipErrorToast: true }
      );
      if (data?.data?.alreadyVerified) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("triggerInitialSetup", "true");
          sessionStorage.removeItem("emailVerificationSent");
        }
        await getAuthUserInfo(setLoading);
        router.push("/main-dashboard");
        return;
      }
      toaster(
        data?.message || "Verification link sent to your email!",
        "success"
      );
      const cooldownMinutes =
        data?.data?.resendOtpMinutes && !isNaN(data?.data?.resendOtpMinutes)
          ? Number(data.data.resendOtpMinutes)
          : 2;
      setIsCooldownActive(true);
      setTimeLeft(cooldownMinutes * 60);
      setEmailSentNotice(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("emailVerificationSent", "true");
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || "";
      if (
        typeof errMsg === "string" &&
        errMsg.toLowerCase().includes("already verified")
      ) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("triggerInitialSetup", "true");
          sessionStorage.removeItem("emailVerificationSent");
        }
        try {
          await getAuthUserInfo(setLoading);
        } catch {}
        router.push("/main-dashboard");
        return;
      }
      console.log("error", error);
      toaster(errMsg || "Failed to send verification link", "error");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationLink = async () => {
    if (timeLeft > 0) {
      toaster(
        `Please wait ${formatTime(timeLeft)} before requesting again`,
        "warning"
      );
      return;
    }
    sendVerificationMail();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secondsRemaining
      .toString()
      .padStart(2, "0")}`;
  };

  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    if (isCooldownActive && timeLeft > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsCooldownActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [isCooldownActive, timeLeft]);

  // If currently processing link verification
  if (isVerifyingLink) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <MiniSpinner className="w-12 h-12 text-primaryColor animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Verifying Your Email
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please wait while we verify your company account and prepare your
            initial setup...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 space-y-6">
      <div className="flex flex-col items-center gap-6">
        {/* Verification Link Error Alert */}
        {linkVerificationError && (
          <div className="w-full max-w-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-200 flex items-start gap-3">
            <PiWarningCircle className="text-2xl flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Verification Link Error</p>
              <p>{linkVerificationError}</p>
            </div>
          </div>
        )}

        {emailSentNotice ? (
          <div className="lg:w-1/2 w-full flex items-center justify-center py-6 px-3 sm:p-6">
            <div className="w-full mx-auto max-w-[480px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center space-y-5">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
                <PiEnvelopeSimpleOpen className="text-4xl text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-gray-900 dark:text-white font-bold text-2xl">
                  Verify Your Email Address
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  We have sent a verification link to{" "}
                  {user?.email ? (
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.email}
                    </span>
                  ) : (
                    "your registered email address"
                  )}
                  . Please check your inbox and click the verification link in
                  the email to verify your account and proceed to initial setup.
                </p>
              </div>

              <div className="pt-2">
                <ButtonTw
                  variant="default"
                  className="w-full"
                  disabled={isLoading || timeLeft > 0}
                  loading={isLoading}
                  onClick={resendVerificationLink}
                >
                  {timeLeft > 0
                    ? `Resend Verification Link (${formatTime(timeLeft)})`
                    : "Resend Verification Link"}
                </ButtonTw>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Didn&apos;t see the email? Check your spam or junk folder.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <p className="text-gray-800 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 p-4 rounded-lg text-center">
              Your email address is not verified. Please verify your email
              address by clicking the button below to receive a verification
              link.
            </p>
            <div>
              <ButtonTw
                variant="default"
                className="min-w-[320px] max-w-[350px] w-full"
                disabled={isLoading}
                loading={isLoading}
                onClick={sendVerificationMail}
              >
                Send Verification Link
              </ButtonTw>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserVerificationPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <EmailVerificationInner />
    </Suspense>
  );
};

export default UserVerificationPage;
