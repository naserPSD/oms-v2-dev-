import DepartmentsListComponent from "@/features/hr-dashboard/departments/DepartmentsListComponent";
import React, { Suspense } from "react";

export const metadata = {
  title: "Departments | Sanzio",
  description: "View and manage departments information.",
};

const DepartmentPage = () => {
  return (
    <Suspense fallback={<div>Loading departments...</div>}>
      <div className="my-5 space-y-6">
        <DepartmentsListComponent />
      </div>
    </Suspense>
  );
};

export default DepartmentPage;
