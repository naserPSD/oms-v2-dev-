import HrNotice from "@/features/hr-dashboard/hr-notice/HrNotice";
import React, { Suspense } from "react";

export const metadata = {
  title: "Notices | Sanzio",
  description: "View and manage notices.",
};

const NoticesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrNotice />
    </Suspense>
  );
};

export default NoticesPage;
