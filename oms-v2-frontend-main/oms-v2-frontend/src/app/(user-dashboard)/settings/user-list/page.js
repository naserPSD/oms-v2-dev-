// src/app/(user-dashboard)/settings/user-list/page.js
import React, { Suspense } from "react";
import UserListComponent from "@/features/settings/user-list/UserListComponent";

export const metadata = {
  title: "User List | Sanzio",
  description: "View and update user information.",
};

export default async function UserListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserListComponent />
    </Suspense>
  );
}