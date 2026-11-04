import PayrollRuns from "@/features/payroll-management/payroll-runs/PayrollRuns";
import { Suspense } from "react";

export const metadata = {
  title: "Payroll Runs | Sanzio",
  description: "View and update payroll runs information.",
};

const PayrollRunsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayrollRuns />
    </Suspense>
  );
};

export default PayrollRunsPage;
