"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaBirthdayCake } from "react-icons/fa";
import CardWithAvatars from "@/components/ui/CardWithAvatars";
const peopleAvatars = [
  "/assets/images/avatar/1.png",
  "/assets/images/avatar/2.png",
  "/assets/images/avatar/3.png",
  "/assets/images/avatar/4.png",
  "/assets/images/avatar/4.png",
  "/assets/images/avatar/4.png",
  "/assets/images/avatar/4.png",
  "/assets/images/avatar/4.png",
  "/assets/images/avatar/4.png",
  "/assets/images/avatar/4.png",
];


const TokenDashboardSection = () => {
  const [showLeaveTodayModal, setShowLeaveTodayModal] = useState(false);
  const [showLeaveTomorrowModal, setShowLeaveTomorrowModal] = useState(false);
  const [showAttendanceApprovalModal, setShowAttendanceApprovalModal] =
    useState(false);
  const [showAttendanceReconsModal, setShowAttendanceReconsModal] =
    useState(false);
  const [showOnVisitTodayModal, setShowOnVisitTodayModal] = useState(false);
  const [showLeaveApplicationsModal, setShowLeaveApplicationsModal] =
    useState(false);

  return (
      <div className="grid grid-cols-1 md:grid-cols-2  2xl:grid-cols-5 gap-4 2xl:col-span-9">
   
        <CardWithAvatars
          title="Total Tokens"
          avatars={peopleAvatars}
          borderColor="border-l-gray-500"
          onClick={() => setShowLeaveTodayModal(true)}
        />

        <CardWithAvatars
          title="Open Token"
          avatars={peopleAvatars}
          borderColor="border-l-green-500"
          onClick={() => setShowLeaveApplicationsModal(true)}
        />

        <CardWithAvatars
          title="In Progress"
          avatars={peopleAvatars}
          borderColor="border-l-purple-500"
          onClick={() => setShowOnVisitTodayModal(true)}
        />

        <CardWithAvatars
          title="Closed"
          avatars={peopleAvatars}
          borderColor="border-l-red-500"
          onClick={() => setShowAttendanceApprovalModal(true)}
        />

        <CardWithAvatars
          title="Resolved"
          avatars={peopleAvatars}
          borderColor="border-l-yellow-500"
          onClick={() => setShowAttendanceReconsModal(true)}
        />
      </div>
  );
};

export default TokenDashboardSection;
