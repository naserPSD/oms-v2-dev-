"use client";
import { FormController as Controller } from "@/components/common/FormController";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { z } from 'zod';
import { zodResolver } from '@/utils/zodResolver';
import Input from "@/components/ui/Input";
import helpers, { toaster } from "@/utils/helpers";
import RestApi from "@/utils/RestApi";
import { useAuthQueryApi } from "@/hooks/queryApi/useAuthQueryApi";

const ResetFirstPassword = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const resetFirstPassword = searchParams.get("resetFirstPassword") || false;
  const token = searchParams.get("token");

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  
  const [isLoading, setLoading] = useState(false);

  // ✅ Zod schema for validation
  const schema = z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .refine((val) => /[A-Z]/.test(val), { message: "Must contain at least one uppercase letter" })
      .refine((val) => /[a-z]/.test(val), { message: "Must contain at least one lowercase letter" })
      .refine((val) => /[0-9]/.test(val), { message: "Must contain at least one number" })
      .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), { message: "Must contain at least one special character" }),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // set the error on confirmPassword field
  });
  
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      control,
      watch,
      setError,
      setValue,
      reset
    } = useForm({
      resolver: zodResolver(schema),
      defaultValues: initialValues,
      mode: "onChange",
    });


  useEffect(() => {
    if (email) {
      setValue("email", email);
      console.log("email===========", email);
    } else {
      toast.error("Invalid or expired token");
      router.push("/forget-password");
    }
  }, [router, email]);

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

    const {
      useResetFirstPasswordMutation,
    } = useAuthQueryApi({ reset, setError });

  // const submitForm = async (values) => {
  //   values.email = email;
  //   values.resetFirstPassword = resetFirstPassword;
  //   values.token = token;
  //   await useResetFirstPasswordMutation.mutateAsync(values);
  //   router.push("/sign-in");
  // }
  const submitForm = async (values) => {
    setLoading(true);

    try {
      values.email = email;
      values.resetFirstPassword = resetFirstPassword;
      values.token = token;
      const { data } = await RestApi.post("/api/v1/auth/reset-first-password", values);
      toaster(data.message || "Password reset successful!");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      reset();

      router.push("/sign-in");
    } catch (error) {
      helpers.handleApiValidationError(error, setError);
    } finally {
      setLoading(false);
    }
  }

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
                Set New Password
              </h2>
              <p className="text-gray-600 mb-6">
                Create a new password to login to your account
              </p>

              <form className="space-y-5" onSubmit={handleSubmit(submitForm)}>

                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Email"
                      disabled
                      placeholder="Enter Your Email..."
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter Your Password..."
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Enter Your Confirm Password"
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      {...field}
                    />
                  )}
                />

                {isSubmitting || isLoading ? (
                  <div className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm text-center flex items-center justify-center cursor-not-allowed">
                    <MiniSpinner />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2 w-full font-bold rounded-sm cursor-pointer"
                  >
                    Submit
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetFirstPassword;
