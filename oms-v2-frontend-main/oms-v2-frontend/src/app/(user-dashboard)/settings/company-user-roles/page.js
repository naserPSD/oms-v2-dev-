import React, { Suspense } from "react";
import CompanyUserRolesListComponent from "@/features/settings/company-user-roles/CompanyUserRolesListComponent";

export const metadata = {
  title: "Company User Roles | Sanzio",
  description: "Manage company-scoped user roles and permissions.",
};

export default async function CompanyUserRolesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyUserRolesListComponent />
    </Suspense>
  );
}
