import React, { Suspense } from "react";
import SuperAdminDashboard from "@/features/admin/SuperAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminGuard } from "@/utils/AdminGuard";

export const metadata = {
  title: "Admin Dashboard | Sanzio",
  description:
    "Super Admin dashboard for platform revenue, subscribers, roles & permissions, master documents, and subscription plans.",
};

export default function AdminPage() {
  return (
    <AdminGuard>
      <Suspense
        fallback={
          <div className="py-8 space-y-6">
            <Skeleton className="h-14 w-80 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        }
      >
        <SuperAdminDashboard />
      </Suspense>
    </AdminGuard>
  );
}
