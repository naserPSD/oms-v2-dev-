import HrLeave from "@/features/hr-dashboard/hr-leave/HrLeave";
import { Suspense } from "react";

export const metadata = {
  title: "Leave | Sanzio",
  description: "View and manage leave.",
};

const LeavePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrLeave />
    </Suspense>
  )
};

export default LeavePage;
