"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { PiWarningCircle } from "react-icons/pi";
import Image from "next/image";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import Input from "@/components/ui/Input";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";

const ForgetPassword = () => {
  const length = 6;
  const router = useRouter();

  // Logged-in users should not stay on forget-password
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("accessToken")) {
      router.replace("/main-dashboard");
    }
  }, [router]);

  // ✅ Zod schema for validation
  const schema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
  });

  const methods = useForm({
    resolver: zodResolver(schema),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const [isLoading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [resendOtpMinutes, setResendOtpMinutes] = useState(2);
  const navigationInputs = useRef([]);
  const [otpValues, setOtpValues] = useState(Array(length).fill(""));
  // Input Change Handler
  const handleInputChange = (e, index) => {
    const { value } = e.target;
    const newOtpValues = [...otpValues];

    if (/^[a-zA-Z0-9]$/.test(value)) {
      newOtpValues[index] = value;
      if (index < length - 1) {
        navigationInputs.current[index + 1]?.focus();
      }
    } else if (value === "") {
      newOtpValues[index] = "";
    } else {
      newOtpValues[index] = value.slice(0, 1).replace(/[^a-zA-Z0-9]/g, "");
    }

    setOtpValues(newOtpValues);
    setOtpError("");
  };

  // Backspace Handler
  const handleKeydown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !navigationInputs.current[index].value &&
      index > 0
    ) {
      navigationInputs.current[index - 1]?.focus();
    }
  };

  // Submit Email to Get OTP
  // const submitEmail = async (data) => {
  //   try {
  //     setLoading(true);

  //     const response = await fetch("/api/proxy/auth/forget-password", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         email: data.user_email,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.message || "Failed to send OTP");
  //     }

  //     setSessionId(result.session_id);
  //     setShowOtpField(true);
  //     toast.success(result.message || "OTP sent to your email!");
  //   } catch (error) {
  //     toast.error(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  const [otpSent, setOtpSent] = useState(false);
  const [isOtpActive, setIsOtpActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(2); // Default expiry time in minutes

  const [forgotPasswordValues, setForgotPasswordValues] = useState({
    email: "",
  });

  const submitEmail = async (values) => {
    setLoading(true);
    try {
      setForgotPasswordValues(values);
      const { data } = await RestApi.post("/api/v1/auth/forget-password", values);

      console.log('data', data)

      toaster('OTP sent to your email!', 'success');
      setSessionId(data.data?.sessionId);
      if (data.data?.resendOtpMinutes && !isNaN(data.data?.resendOtpMinutes)) {
        setResendOtpMinutes(data.data?.resendOtpMinutes); // Convert minutes to seconds
        setIsOtpActive(true);
        setTimeLeft(data.data?.resendOtpMinutes * 60);
      }
      if (data.data?.otpExpiryMinutes && !isNaN(data.data?.otpExpiryMinutes)) {
        setOtpExpiryMinutes(data.data?.otpExpiryMinutes * 60); // Convert minutes to seconds
      }
      setShowOtpField(true);
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  const resendMailForOtp = async () => {
    if (formatTime(timeLeft) !== "00:00") {
      toaster(`Please wait ${formatTime(timeLeft)} before resending OTP`, 'warning');
      return;
    }
    submitEmail(forgotPasswordValues);
  }

  // Display formatted time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
  };

  const otpExpiryTimerRef = useRef(null);
  const resendOtpTimerRef = useRef(null);

  // Start the timer when OTP is active
  useEffect(() => {
    if (isOtpActive && otpExpiryMinutes > 0) {
      otpExpiryTimerRef.current = setInterval(() => {
        setOtpExpiryMinutes((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => {
      if (otpExpiryTimerRef.current) {
        clearInterval(otpExpiryTimerRef.current);
      }
    };
  }, [isOtpActive]);

  // Handle expiry and show toaster only once
  useEffect(() => {
    if (isOtpActive && otpExpiryMinutes === 0) {
      setShowOtpField(false);
      setIsOtpActive(false);
      setTimeLeft(0);
      setOtpValues(Array(length).fill(""));
      setOtpError("");
      toaster(`OTP Expired. Please request for a new OTP.`, 'warning');
    }
  }, [otpExpiryMinutes, isOtpActive]);

  useEffect(() => {
    if (isOtpActive && timeLeft > 0) {
      resendOtpTimerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => {
      if (resendOtpTimerRef.current) clearInterval(resendOtpTimerRef.current);
    };
  }, [isOtpActive, timeLeft]);

  const verifyOtp = async (values) => {
    try {
      if (otpValues.some((value) => !value)) {
        setOtpError("Please fill all OTP fields");
        return;
      }
      setOtpError("");// Clear error message
      setLoading(true);

      const otp = otpValues.join("");
      values.otp = otp; // Add OTP to values
      values.sessionId = sessionId; // Add session ID to values
      const { data } = await RestApi.post("/api/v1/auth/verify-otp", values);

      toaster(data.message || "OTP verification successful!");
      sessionStorage.setItem("token", data.data?.token);

      router.push("/reset-password");
    } catch (error) {
      console.log('error', error)
      // helpers.handleApiValidationError(error.data.message, setError);
      toaster(error?.response?.data?.message || "OTP verification failed", 'error');
      // if (!response.ok) {
      //   throw new Error(result.message || "OTP verification failed");
      // }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Reset Password
  // const verifyOtp = async () => {
  //   try {
  //     if (otpValues.some((value) => !value)) {
  //       setOtpError("Please fill all OTP fields");
  //       return;
  //     }

  //     const otp = otpValues.join("");
  //     setLoading(true);
  //     setOtpError("");

  //     const response = await fetch("/api/proxy/auth/verify-otp", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         session_id: sessionId,
  //         otp: otp,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.message || "OTP verification failed");
  //     }

  //     toast.success(result.message || "OTP verification successful!");
  //     sessionStorage.setItem("token", result.data?.token);
  //     router.push("/reset-password");
  //     reset();
  //     setOtpValues(Array(length).fill(""));
  //     setShowOtpField(false);
  //   } catch (error) {
  //     setOtpError(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const chars = paste.replace(/[^a-zA-Z0-9]/g, '').split('');
    let newOtpValues = [...otpValues];
    for (let i = 0; i < length; i++) {
      newOtpValues[i] = chars[i] || "";
      if (navigationInputs.current[i]) {
        navigationInputs.current[i].value = chars[i] || "";
      }
    }
    setOtpValues(newOtpValues);
    setOtpError("");
    // Focus the last filled input
    const lastFilled = Math.min(chars.length, length) - 1;
    if (lastFilled >= 0 && navigationInputs.current[lastFilled]) {
      navigationInputs.current[lastFilled].focus();
    }
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center">
      <div className="flex items-center justify-center mt-10 lg:mt-0">
        <div className="max-w-[1066px] w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
          {/* Left Image */}
          <div className="lg:w-1/2 w-full flex items-center justify-center bg-gray-100 dark:bg-theme-dark p-4">
            <Image
              src="/assets/images/auth/group.png"
              alt="Login"
              width={500}
              height={500}
              className="mx-auto"
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] bg-gray-400 md:mx-4"></div>

          {/* Form Section */}
          <div className="lg:w-1/2 w-full flex items-center justify-center py-6 px-3 sm:p-6">
            <div className="w-full mx-auto max-w-[450px]">
              <h2 className="text-gray-900 dark:text-gray-300 font-bold text-xl mb-2">
                Forget Password
              </h2>
              <p className="text-gray-700 dark:text-gray-500 mb-7 text-justify w-full max-w-[320px]">
                {showOtpField
                  ? "We've sent a One-Time Password (OTP) to your email. Please check your inbox and enter the OTP below to proceed. Please check your spam folder as well."
                  : "Enter your email address to receive a password reset OTP."}
              </p>

              <FormProvider {...methods}>
              <form
                className="space-y-5"
                onSubmit={handleSubmit(showOtpField ? verifyOtp : submitEmail)}
              >
                {!showOtpField ? (
                  <Input
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                ) : (
                  <div className="max-w-xs w-full">
                    <p className="pb-2 text-red-400">OTP will expire in: {formatTime(otpExpiryMinutes)}</p>
                    <label htmlFor="otp">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Enter 6 Digit OTP
                      </span>
                    </label>
                    <div className="flex gap-2 md:gap-4 flex-wrap justify-between mt-3">
                      {Array.from({ length }).map((_, index) => (
                        <input
                          key={index}
                          type="text"
                          id={`otp-${index}`}
                          name={`otp-${index}`}
                          ref={(el) => (navigationInputs.current[index] = el)}
                          className={`w-10 h-10 text-center border ${otpError ? "border-red-500" : "border-[#bcbcbc]"
                            } rounded-md outline-none focus:border-primaryColor-400`}
                          maxLength={1}
                          value={otpValues[index]}
                          onChange={(e) => handleInputChange(e, index)}
                          onKeyDown={(e) => handleKeydown(e, index)}
                          onPaste={index === 0 ? handlePaste : undefined}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-red-500 text-xs my-2 flex items-center gap-1">
                        <PiWarningCircle className="text-lg" />
                        {otpError}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                {isSubmitting || isLoading ? (
                  <div className="bg-primaryColor hover:bg-primaryColor-700 mt-3 text-white py-2 w-full font-bold rounded-sm text-center flex items-center justify-center cursor-not-allowed">
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    type="submit"
                      className={`bg-primaryColor hover:bg-primaryColor-700 mt-3 text-white py-2 ${showOtpField ? "max-w-[320px] w-full" : "w-full"} font-bold rounded-sm cursor-pointer`}
                  >
                    {showOtpField ? "Reset Password" : "Submit"}
                  </button>
                )}
              </form>
              </FormProvider>

              {/* Link */}
              <div className="text-sm text-gray-700 dark:text-gray-500 mt-5">
                {showOtpField ? (
                  <>
                    Didn&apos;t receive OTP?{" "}
                    <button
                      type="button"
                      onClick={() => resendMailForOtp()}
                      className="text-primaryColor cursor-pointer"
                    >
                      Resend OTP
                    </button>
                    {/* <button
                      type="button"
                      onClick={() => setShowOtpField(false)}
                      className="text-primaryColor cursor-pointer"
                    >
                      Resend OTP
                    </button> */}
                  </>
                ) : (
                  <>
                    Remember your password?{" "}
                    <Link href="/sign-in" className="text-primaryColor">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
