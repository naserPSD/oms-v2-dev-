// src/app/(user-dashboard)/hr-dashboard/employee/page.js
import HrEmployee from "@/features/hr-dashboard/employee/HrEmployee";
import { Suspense } from "react";

export const metadata = {
  title: "Employee List | Sanzio",
  description: "View and manage employee information.",
};

const EmployeePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrEmployee />
    </Suspense>
  );
};

export default EmployeePage;
