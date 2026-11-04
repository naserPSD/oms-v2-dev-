import React, { Suspense } from "react";
import SubscriberCompaniesList from "@/features/admin/components/SubscriberCompaniesList";
import { AdminGuard } from "@/utils/AdminGuard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Subscribers Companies | Admin Portal",
  description: "Manage registered tenant companies, subscription plans, and activation status.",
};

export default function AdminSubscriptionSubscriberCompaniesPage() {
  return (
    <AdminGuard>
      <div className="py-6 space-y-6">
        <Suspense
          fallback={
            <div className="py-8 space-y-6">
              <Skeleton className="h-10 w-72 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          }
        >
          <SubscriberCompaniesList />
        </Suspense>
      </div>
    </AdminGuard>
  );
}
