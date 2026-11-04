import { Suspense } from "react";
import CategoryManagement from "@/features/Accounts/CategoryManagement";

export const metadata = { title: "Manage Categories | Accounts" };

export default function AccountsCategoriesPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-gray-500">Loading categories...</div>}>
      <CategoryManagement />
    </Suspense>
  );
}
