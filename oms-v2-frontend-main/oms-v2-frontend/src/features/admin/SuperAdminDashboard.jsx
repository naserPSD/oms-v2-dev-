"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import AdminOverview from "./components/AdminOverview";
import SubscriberCompaniesList from "./components/SubscriberCompaniesList";
import PermissionListComponent from "@/features/settings/permissions/PermissionListComponent";
import RoleListComponent from "@/features/settings/role-permission/RoleListComponent";
import MasterDocuments from "@/features/Documents/Master-Documents/MasterDocuments";
import SubscriptionList from "@/features/subscription/subscription-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Sync tab with URL parameter
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tabId);
    }
    const query = params.toString();
    router.replace(query ? `/admin?${query}` : `/admin`, { scroll: false });
  };

  return (
    <div className="py-6 space-y-6">
      {/* If viewing a sub-module directly, show a clean Back button */}
      {activeTab !== "overview" && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => handleTabChange("overview")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Main Dashboard / Module View */}
      {activeTab === "overview" && (
        <AdminOverview setActiveTab={handleTabChange} />
      )}

      {activeTab === "roles" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200">
            <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
              Global Roles & Permissions Management
            </h3>
            <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
              Define user roles and customize permission matrices for modules, pages, actions, and features.
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <RoleListComponent />
          </Suspense>
        </div>
      )}

      {activeTab === "master-docs" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200">
            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200">
              Master Document Templates
            </h3>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-0.5">
              Master Documents act as centralized templates. Tenant companies can import these standardized documents.
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <MasterDocuments />
          </Suspense>
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200">
            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
              Subscription Plan Management
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
              Manage global subscription plans, feature limits, pricing tiers, and billing duration packages.
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <SubscriptionList />
          </Suspense>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200">
            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200">
              System Permissions & Dynamic Access Panels
            </h3>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-0.5">
              Manage system permissions, paths, and allocate modules/pages to either the <strong>Admin</strong> portal or <strong>Company</strong> dashboard.
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <PermissionListComponent />
          </Suspense>
        </div>
      )}

      {(activeTab === "subscriber-companies" ||
        activeTab === "companies" ||
        activeTab === "subscribers") && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <SubscriberCompaniesList />
          </Suspense>
        </div>
      )}
    </div>
  );
}
