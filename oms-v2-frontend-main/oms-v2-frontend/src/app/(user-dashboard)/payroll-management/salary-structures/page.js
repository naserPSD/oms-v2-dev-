import SalaryStructures from "@/features/payroll-management/salary-structures/SalaryStructures";
import { Suspense } from "react";

export const metadata = {
  title: "Salary Structures | Sanzio",
  description: "View and update salary structures information.",
};

const SalaryStructuresPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalaryStructures />
    </Suspense>
  );
};

export default SalaryStructuresPage;
