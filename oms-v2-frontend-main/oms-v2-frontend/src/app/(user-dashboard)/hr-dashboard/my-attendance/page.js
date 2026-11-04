import MyAttendance from "@/features/hr-dashboard/my-attendance/MyAttendance";
import { Suspense } from "react";

export const metadata = {
  title: "My Attendance | Sanzio",
  description: "View daily attendance history, working hours, and request attendance reconciliation.",
};

const MyAttendancePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyAttendance />
    </Suspense>
  );
};

export default MyAttendancePage;
