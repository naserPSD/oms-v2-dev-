import ChooseUserApplication from "@/features/auth/user-apps/ChooseUserApplication";
import React, { Suspense } from "react";

export const metadata = {
  title: "Choose User Application - ERP",
  description: "Select your user application to proceed with Sanzio access.",
};

const ChooseUserAppPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className=" ">
        <ChooseUserApplication />
      </div>
    </Suspense>
  );
};

export default ChooseUserAppPage;
