import UpdatePassword from "@/features/password-settings/UpdatePassword";
import React, { Suspense } from "react";

export const metadata = {
  title: "Password Change | Sanzio",
  description: "Update Password .",
};

const WorkSpacePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePassword />{" "}
    </Suspense>
  );
};

export default WorkSpacePage;
