"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FormProvider, useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import Input from "@/components/ui/Input";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";

const ResetPassword = () => {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    // Get token from sessionStorage when component mounts
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      toast.error("Invalid or expired token");
      router.push("/forget-password");
    }
  }, [router]);

  // ✅ Zod schema for validation
  const schema = z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .refine((val) => /[A-Z]/.test(val), { message: "Must contain at least one uppercase letter" })
      .refine((val) => /[a-z]/.test(val), { message: "Must contain at least one lowercase letter" })
      .refine((val) => /[0-9]/.test(val), { message: "Must contain at least one number" })
      .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), { message: "Must contain at least one special character" }),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // set the error on confirmPassword field
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
  const [isPasswordShow, setPasswordShow] = useState(false);
  // const password = watch("password", "");

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

  const submitForm = async (values) => {
    setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000);
    try {
      values.token = token; // Add token to the values
      const { data } = await RestApi.post("/api/v1/auth/reset-password", values);
      toaster(data.message || "Password updated successfully!");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      reset();

      // Clean up and redirect
      sessionStorage.removeItem("token");
      router.push("/sign-in");
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  }

  // Form submission handler
  // const submitForm = async (data) => {
  //   try {
  //     setLoading(true);

  //     const response = await fetch("/api/proxy/auth/reset-password", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         token: token,
  //         password: data.password,
  //         confirmPassword: data.confirm_password,
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       toast.error(result.message || "Password reset failed");
  //       return;
  //     }
  //     // Clear existing auth tokens
  //     localStorage.removeItem("access_token");
  //     localStorage.removeItem("user");
  //     toast.success(result.message || "Password updated successfully!");
  //     reset();

  //     // Clean up and redirect
  //     sessionStorage.removeItem("token");
  //     router.push("/sign-in");
  //   } catch (error) {
  //     toast.error(error.message || "Something went wrong!");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
            <div className="w-full max-w-[450px]">
              <h2 className="text-gray-900 dark:text-theme-light-text font-bold text-xl mb-1">
                Reset Password
              </h2>
              <p className="text-gray-600 mb-6">
                Create a new password. Ensure it differs from previous ones for
                security.
              </p>

              <FormProvider {...methods}>
              <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>


                <Input
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Enter your confirm Password"
                  autoComplete="current-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword", passwordValidation)}
                />
                {/* New Password Input */}
                {/* <div>
                  <label className="font-bold text-sm text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={isPasswordShow ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password", passwordValidation)}
                      className={`bg-white placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <span
                      onClick={() => setPasswordShow(!isPasswordShow)}
                      className="absolute end-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                    >
                      {isPasswordShow ? (
                        <FaEye size={20} />
                      ) : (
                        <FaEyeSlash size={20} />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <div className="text-xs text-red-500 mt-1 space-y-1">
                      <p>{errors.password.message}</p>
                    </div>
                  )}
                </div> */}

                {/* Retype Password Input */}
                {/* <div>
                  <label className="font-bold text-sm text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">

                    
                    <input
                      type={isPasswordShow ? "text" : "password"}
                      placeholder="Retype password"
                      {...register("confirm_password", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      className={`bg-white placeholder:text-gray-400 border rounded-sm outline-none px-4 w-full mt-1 py-2 focus:border-primary transition-colors duration-300 ${
                        errors.confirm_password
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <span
                      onClick={() => setPasswordShow(!isPasswordShow)}
                      className="absolute end-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                    >
                      {isPasswordShow ? (
                        <FaEye size={20} />
                      ) : (
                        <FaEyeSlash size={20} />
                      )}
                    </span>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div> */}

                {isSubmitting || isLoading ? (
                  <div className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm text-center flex items-center justify-center cursor-not-allowed">
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm cursor-pointer"
                  >
                    Update Password
                  </button>
                )}
              </form>
              </FormProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
