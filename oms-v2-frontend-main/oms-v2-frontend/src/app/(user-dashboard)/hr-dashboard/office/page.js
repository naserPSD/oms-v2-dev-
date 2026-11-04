import HrOffice from "@/features/hr-dashboard/hr-office/HrOffice";
import React, { Suspense } from "react";

export const metadata = {
  title: "Office | Sanzio",
  description: "View and manage office information.",
};

const OfficePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrOffice />
    </Suspense>
  );
};

export default OfficePage;
