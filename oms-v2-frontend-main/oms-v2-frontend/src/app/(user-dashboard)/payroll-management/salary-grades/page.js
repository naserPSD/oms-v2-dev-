import SalaryGradesComponent from "@/features/payroll-management/salary-grades/SalaryGradesComponent";
import React, { Suspense } from "react";

export const metadata = {
  title: "Salary Grades | Sanzio",
  description: "View and update salary grades information.",
};

const SalaryGradesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalaryGradesComponent />
    </Suspense>
  );
};

export default SalaryGradesPage;
