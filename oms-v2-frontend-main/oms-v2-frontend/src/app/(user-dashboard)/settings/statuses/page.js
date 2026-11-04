import AdminStatusesPage from "@/features/settings/statuses/AdminStatusesPage";
import React, { Suspense } from "react";

export const metadata = {
  title: "Statuses",
  description: "Manage status groups and statuses",
};

export default function StatusesSettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminStatusesPage />
    </Suspense>
  );
}
