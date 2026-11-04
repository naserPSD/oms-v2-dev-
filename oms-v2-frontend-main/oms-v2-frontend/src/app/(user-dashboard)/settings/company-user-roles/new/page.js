import React, { Suspense } from "react";
import CompanyUserRoleFormComponent from "@/features/settings/company-user-roles/CompanyUserRoleFormComponent";

export const metadata = {
  title: "Add Company User Role | Sanzio",
  description: "Create a company-scoped user role.",
};

export default async function NewCompanyUserRolePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyUserRoleFormComponent />
    </Suspense>
  );
}
