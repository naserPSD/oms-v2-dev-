import HrAttendance from "@/features/hr-dashboard/hr-attendance/HrAttendance";
import { Suspense } from "react";

export const metadata = {
  title: "Employee Attendance | Sanzio",
  description: "View and manage employee attendance records.",
};

const AttendancePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HrAttendance />
    </Suspense>
  );
};

export default AttendancePage;
