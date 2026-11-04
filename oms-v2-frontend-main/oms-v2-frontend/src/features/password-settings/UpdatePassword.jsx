"use client";

import { FormController as Controller } from "@/components/common/FormController";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import Input from "@/components/ui/Input";
import z from "zod";
import { useAuthStore } from "@/store/useAuthStore";
import ButtonTw from "@/components/ui/ButtonTw";
import { useMyProfileQueryApi } from "@/hooks/queryApi/useMyProfileQueryApi";

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const schema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const UpdatePassword = () => {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const { useUpdatePasswordMutation } = useMyProfileQueryApi({
    reset,
    setError,
  });

  const user = useAuthStore((state) => state.user);

  // Fill disabled fields for display
  useEffect(() => {
    if (user) {
      reset({
        ...initialValues,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      });
    }
  }, [reset, user]);

  const onSubmit = async (data) => {
    // Only send password fields
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };

    console.log("Payload to send 👉", payload);
    await useUpdatePasswordMutation.mutateAsync(payload);
  };

  return (
    <div
      className="h-[600] flex items-center justify-center"
    >
      <div
        className="w-full max-w-xl p-6 rounded-lg
    bg-white dark:bg-slate-900"
      >
        <h2
          className="text-xl font-semibold mb-6
      text-gray-800 dark:text-slate-100"
        >
          Update Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name"
                disabled
                className="opacity-70 cursor-not-allowed"
                {...field}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                type="email"
                label="Email"
                disabled
                className="opacity-70 cursor-not-allowed"
                {...field}
              />
            )}
          /> */}

          {/* Divider */}
          {/* <div className="pt-2">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
              Change Password
            </p>
            <div className="mt-2 h-px bg-gray-200 dark:bg-slate-700" />
          </div> */}

          {/* Current Password */}
          <Controller
            control={control}
            name="currentPassword"
            render={({ field, fieldState }) => (
              <Input
                type="password"
                label="Current Password"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* New Password */}
          <Controller
            control={control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Input
                type="password"
                label="New Password"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Input
                type="password"
                label="Confirm Password"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <ButtonTw type="submit" disabled={isSubmitting}>
              Update Password
            </ButtonTw>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
