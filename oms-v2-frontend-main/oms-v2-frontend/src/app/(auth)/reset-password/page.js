import ResetPassword from "@/features/auth/reset-password/ResetPassword";
import React, { Suspense } from "react";

export const metadata = {
  title: "Reset Password",
  description: "Enter a new password to regain access to your account.",
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;
