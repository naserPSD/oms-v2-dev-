import MeetingLobby from "@/features/hr-dashboard/meeting/MeetingLobby";
import { Suspense } from "react";

export const metadata = {
  title: "Meeting Lobby | Sanzio",
  description: "Prepare and join a meeting.",
};

const MeetingLobbyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingLobby />
    </Suspense>
  );
};

export default MeetingLobbyPage;
