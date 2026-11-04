import LeaveRequest from "@/features/hr-dashboard/hr-leave-request/MyLeaveRequest";
import React, { Suspense } from "react";

export const metadata = {
  title: "Leave | Sanzio",
  description: "View and manage leave.",
};

const LeaveRequestPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeaveRequest />
    </Suspense>
  );
};

export default LeaveRequestPage;
