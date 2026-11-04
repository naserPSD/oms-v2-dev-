"use client";

import useCommonFunctions from "@/hooks/common/useCommonFunctions";

export default function AccountsPageShell({
  title,
  permission,
  children,
}) {
  const { hasPermission } = useCommonFunctions();

  if (!hasPermission("accounts") || (permission && !hasPermission(permission))) {
    return (
      <div className="my-6 text-center text-gray-500">
        You do not have permission to view {title}.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] py-6">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Accounts Management</p>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
