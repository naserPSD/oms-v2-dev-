"use client";

import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import { useLeavePolicyData } from "../hooks/useLeavePolicyData";

const LeavePolicyModal = ({ show, onClose, onOpenOverview }) => {
  // Prefetch/cache with page — do not wait for modal open
  const {
    leaveRows,
    totalData,
    isLoading,
  } = useLeavePolicyData(true);

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Leave Policy"
      size="2xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your yearly leave allowance, used days, and remaining balance by
            leave type.
          </p>
          {onOpenOverview && leaveRows.length > 0 && (
            <ButtonTw
              type="button"
              variant="alternative"
              className="shrink-0"
              onClick={() => {
                onClose?.();
                onOpenOverview();
              }}
            >
              Leave Overview
            </ButtonTw>
          )}
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">
            Loading leave policy...
          </div>
        ) : leaveRows.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No leave policy data found. Ensure leave types exist for your app,
            then refresh the page.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
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
              <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold">
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
    </ModalTw>
  );
};

export default LeavePolicyModal;
