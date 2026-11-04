import MeetingTeamDirectory from "@/features/hr-dashboard/meeting/MeetingTeamDirectory";
import { Suspense } from "react";

export const metadata = {
  title: "Team Directory | Meetings | Sanzio",
  description: "Browse team members and schedule meetings.",
};

const MeetingDirectoryPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingTeamDirectory />
    </Suspense>
  );
};

export default MeetingDirectoryPage;
