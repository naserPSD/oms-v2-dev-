import MeetingLiveWorkspace from "@/features/hr-dashboard/meeting/MeetingLiveWorkspace";
import { Suspense } from "react";

export const metadata = {
  title: "Live Meeting | Sanzio",
  description: "Live meeting workspace with agenda, notes, and roster.",
};

const MeetingLivePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingLiveWorkspace />
    </Suspense>
  );
};

export default MeetingLivePage;
