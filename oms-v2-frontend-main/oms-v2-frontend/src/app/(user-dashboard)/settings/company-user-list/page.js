import React, { Suspense } from "react";
import UserListComponent from "@/features/settings/user-list/UserListComponent";

export const metadata = {
  title: "Company Users | Sanzio",
  description: "View and update users in this company.",
};

export default async function CompanyUsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserListComponent scope="company" />
    </Suspense>
  );
}
