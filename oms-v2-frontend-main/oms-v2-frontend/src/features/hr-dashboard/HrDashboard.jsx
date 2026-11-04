import React from "react";
import HrLeaveDashboardSection from "./HrDashboardSummarySection";
import HrAttendanceOverview from "./HrDashboardOverview";

const HrDashboard = () => {
  return (
    <div className="container mx-auto my-4 space-y-4">
      <h2 className="text-xl font-bold dark-title-color ">HR Dashboard</h2>

      <HrLeaveDashboardSection />
      <HrAttendanceOverview />
    </div>
  );
};

export default HrDashboard;
