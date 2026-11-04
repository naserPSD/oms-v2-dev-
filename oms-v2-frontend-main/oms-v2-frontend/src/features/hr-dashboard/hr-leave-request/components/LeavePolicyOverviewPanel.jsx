"use client";

import { LeaveOverview } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/LeaveOverview";
import { useLeavePolicyData } from "../hooks/useLeavePolicyData";

const LeavePolicyOverviewPanel = () => {
  const { leaveRows, totalData, leaveOverview, isLoading, isPolicyError } =
    useLeavePolicyData(true);
  const year = new Date().getFullYear();

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Leave Policy
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Allowance, used days, and what is still left.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {year}
          </span>
        </div>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            Loading leave policy...
          </div>
        ) : leaveRows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            {isPolicyError
              ? "Could not load leave policy. Please try again."
              : `No leave policy found for ${year}. Add leave types for this year in Leave Setup.`}
          </div>
        ) : (
          <div className="max-h-64 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Allowed
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">Used</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Remaining
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaveRows.map((row) => (
                  <tr
                    key={row.name}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-center">{row.total ?? 0}</td>
                    <td className="px-4 py-3 text-center text-blue-600">
                      {row.used ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-green-600">
                      {row.remaining ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold dark:bg-gray-800">
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-center">
                    {totalData.totalLeave ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {totalData.totalUsed ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center text-green-600">
                    {totalData.totalRemaining ?? 0}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {leaveRows.length > 0 && (
        <LeaveOverview
          leaveData={leaveOverview}
          totalData={totalData}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default LeavePolicyOverviewPanel;
