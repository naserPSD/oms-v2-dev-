import Login from "@/features/auth/login/SignInForm";
import React, { Suspense } from "react";

export const metadata = {
  title: "SignIn | ERP",
  description: "Login to your ERP account to start managing your HR system.",
};

const SignInPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className=" ">
        <Login />
      </div>
    </Suspense>
  );
};

export default SignInPage;
