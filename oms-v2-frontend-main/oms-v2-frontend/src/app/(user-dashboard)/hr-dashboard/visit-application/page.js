
import HrVisits from "@/features/hr-dashboard/visit-applications/HrVisits";
import React, { Suspense } from "react";

export const metadata = {
  title: "Visit Application | Sanzio",
  description: "View and manage visit applications.",
};

const VisitApplicationPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrVisits/>
    </Suspense>
  );
};

export default VisitApplicationPage;
