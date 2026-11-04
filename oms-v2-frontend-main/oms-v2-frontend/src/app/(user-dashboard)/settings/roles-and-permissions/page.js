// src/app/(user-dashboard)/settings/roles-and-permissions/page.js
import React, { Suspense } from "react";
import RoleListComponent from "@/features/settings/role-permission/RoleListComponent";

export const metadata = {
  title: "Roles and Permissions | Sanzio",
  description: "View and update role and permission information.",
};

export default async function RoleAndPermissionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoleListComponent />
    </Suspense>
  );
}