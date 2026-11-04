// src/app/(user-dashboard)/hr-dashboard/employee-invitation/page.js

import HrEmployeeInvitation from "@/features/hr-dashboard/employee-invitation/HrEmployeeInvitation";
import { Suspense } from "react";

export const metadata = {
  title: "Employee Invitation | Sanzio",
  description: "View and manage employee invitation information.",
};

const EmployeeInvitationPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrEmployeeInvitation />
    </Suspense>
  );
};

export default EmployeeInvitationPage;
