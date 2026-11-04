"use client";

import { ModalTw } from "@/components/common/ModalTw";
import { LeaveOverview } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/LeaveOverview";
import { useLeavePolicyData } from "../hooks/useLeavePolicyData";

const LeaveOverviewModal = ({ show, onClose }) => {
  // Prefetch/cache with page — do not wait for modal open
  const {
    leaveOverview,
    totalData,
    leaveRows,
    isLoading,
    isPolicyError,
  } = useLeavePolicyData(true);

  return (
    <ModalTw
      show={show}
      onClose={onClose}
      title="Leave Overview"
      size="2xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visual summary of your available leave balance by leave type.
        </p>

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">
            Loading leave overview...
          </div>
        ) : leaveRows.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            {isPolicyError
              ? "Could not load leave overview. Please try again."
              : "No leave overview data found."}
          </div>
        ) : (
          <LeaveOverview
            leaveData={leaveOverview}
            totalData={totalData}
            isLoading={false}
          />
        )}
      </div>
    </ModalTw>
  );
};

export default LeaveOverviewModal;
