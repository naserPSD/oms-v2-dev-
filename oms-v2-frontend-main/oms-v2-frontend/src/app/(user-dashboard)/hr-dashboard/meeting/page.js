import MeetingHome from "@/features/hr-dashboard/meeting/MeetingHome";
import { Suspense } from "react";

export const metadata = {
  title: "Meetings | Sanzio",
  description: "View and manage meetings.",
};

const MeetingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingHome />
    </Suspense>
  );
};

export default MeetingPage;
