
import EmployeeDetails from "@/features/hr-dashboard/employee-details/EmployeeDetails";
import { Suspense } from "react";

export const metadata = {
  title: "Employee Details | Sanzio",
  description: "View and manage employee Details.",
};

const EmployeeDetailsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeeDetails />
    </Suspense>
  );
};

export default EmployeeDetailsPage;
