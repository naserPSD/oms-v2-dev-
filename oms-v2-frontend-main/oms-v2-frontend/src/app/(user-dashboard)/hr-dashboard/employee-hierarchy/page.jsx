import EmployeeHierarchyComponents from "@/features/hr-dashboard/employeeHierarchy/EmployeeHierarchyComponents";
import React, { Suspense } from "react";

export const metadata = {
  title: "Employee Hierarchy | Sanzio",
  description: "View and manage Employee Hierarchy information.",
};

const DesignationPage = () => {
  return (
    <Suspense fallback={<div>Loading designations...</div>}>
      <div className="my-5 space-y-6">
        <EmployeeHierarchyComponents />
      </div>
    </Suspense>
  );
};

export default DesignationPage;
