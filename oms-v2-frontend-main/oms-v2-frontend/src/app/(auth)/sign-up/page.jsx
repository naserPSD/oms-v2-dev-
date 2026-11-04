import SignUp from "@/features/auth/signup/SignUp";
import React, { Suspense } from "react";

export const metadata = {
  title: "SignUp",
  description: "Create an account to start managing your HR system.",
};

const SignUpPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div>
        <SignUp />
      </div>
    </Suspense>
  );
};

export default SignUpPage;
