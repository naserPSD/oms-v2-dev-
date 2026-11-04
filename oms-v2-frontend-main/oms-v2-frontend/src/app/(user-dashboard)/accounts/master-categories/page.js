import { Suspense } from "react";
import MasterCategoryManagement from "@/features/Accounts/MasterCategoryManagement";

export const metadata = { title: "Master Categories | Accounts" };

export default function AccountsMasterCategoriesPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-gray-500">Loading master categories...</div>}>
      <MasterCategoryManagement />
    </Suspense>
  );
}
