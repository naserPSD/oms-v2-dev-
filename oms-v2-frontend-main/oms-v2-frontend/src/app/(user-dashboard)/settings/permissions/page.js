// src/app/(user-dashboard)/settings/permissions/page.js
import React, { Suspense } from "react";
import CompanySettingDashboard from "@/features/company-settings";
import PermissionListComponent from "@/features/settings/permissions/PermissionListComponent";

export const metadata = {
  title: "Permissions | Sanzio",
  description: "View and update permission information.",
};

export default async function PermissionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionListComponent />
    </Suspense>
  );
}