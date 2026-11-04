import EmployeePromotionsComponent from "@/features/payroll-management/employee-promotions/EmployeePromotionsComponent";
import React, { Suspense } from "react";

export const metadata = {
  title: "Employee Promotions | Sanzio",
  description: "View and update employee promotions information.",
};

const EmployeePromotionsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeePromotionsComponent />
    </Suspense>
  );
};

export default EmployeePromotionsPage;
