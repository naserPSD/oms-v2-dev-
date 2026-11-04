import SalaryGradeRulesComponent from "@/features/payroll-management/salary-grade-rules/SalaryGradeRulesComponent";
import React, { Suspense } from "react";

export const metadata = {
  title: "Salary Grade Rules | Sanzio",
  description: "View and update salary grade rules information.",
};

const SalaryGradeRulesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalaryGradeRulesComponent />
    </Suspense>
  );
};

export default SalaryGradeRulesPage;
