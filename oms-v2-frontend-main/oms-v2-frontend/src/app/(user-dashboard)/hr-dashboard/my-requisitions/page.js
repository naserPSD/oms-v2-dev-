import HrRequisitions from "@/features/hr-dashboard/hr-requisition-request/MyRequisitions";
import React, { Suspense } from "react";

export const metadata = {
  title: "My Requisitions | Sanzio",
  description: "View and manage my requisitions.",
};

const MyRequisitionsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrRequisitions />
    </Suspense>
  );
};

export default MyRequisitionsPage;

