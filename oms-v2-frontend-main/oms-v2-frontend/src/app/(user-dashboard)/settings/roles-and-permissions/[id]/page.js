import React, { Suspense } from "react";
import AddOrUpdateComponent from "@/features/settings/role-permission/AddOrUpdateComponent";

export const metadata = {
  title: "Roles and Permissions | Sanzio",
  description: "View and update role and permission information.",
};

export default async function AddOrUpdateComponentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddOrUpdateComponent />
    </Suspense>
  );
}