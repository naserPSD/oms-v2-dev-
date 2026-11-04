import DesignationsComponent from "@/features/hr-dashboard/designations/DesignationsComponent";
import React, { Suspense } from "react";

export const metadata = {
  title: "Designations | Sanzio",
  description: "View and manage designations information.",
};

const DesignationPage = () => {
  return (
    <Suspense fallback={<div>Loading designations...</div>}>
      <div className="my-5 space-y-6">
        <DesignationsComponent />
      </div>
    </Suspense>
  );
};

export default DesignationPage;
