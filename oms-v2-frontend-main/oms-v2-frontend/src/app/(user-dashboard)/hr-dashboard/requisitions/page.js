import HrRequisitions from "@/features/hr-dashboard/hr-requisitions/HrRequisitions";
import React, { Suspense } from "react";

export const metadata = {
  title: "Requisitions | Sanzio",
  description: "View and manage requisitions.",
};

const RequisitionsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrRequisitions />
    </Suspense>
  );
};

export default RequisitionsPage;
