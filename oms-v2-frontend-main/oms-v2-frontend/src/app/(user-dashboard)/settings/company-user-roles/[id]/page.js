import React, { Suspense } from "react";
import CompanyUserRoleFormComponent from "@/features/settings/company-user-roles/CompanyUserRoleFormComponent";

export const metadata = {
  title: "Edit Company User Role | Sanzio",
  description: "Update a company-scoped user role.",
};

export default async function EditCompanyUserRolePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyUserRoleFormComponent />
    </Suspense>
  );
}
