"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaBirthdayCake } from "react-icons/fa";
import HrOnLeaveTodayModal from "./modals/HrOnLeaveTodayModal";
import HrOnLeaveTomorrowModal from "./modals/HrOnLeaveTomorrowModal";
import HrPendingAttendanceApprovalModal from "./modals/HrPendingAttendanceApprovalModal";
import HrPendingAttendanceReconsModal from "./modals/HrPendingAttendanceReconsModal";
import HrOnVisitTodayModal from "./modals/HrOnVisitTodayModal";
import HrLeaveApplicationsModal from "./modals/HrLeaveApplicationsModal";
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


const HrLeaveDashboardSection = () => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-12 gap-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2  2xl:grid-cols-3 gap-4 2xl:col-span-9">
        {/* On leave today */}
   
        <CardWithAvatars
          title="On Leave Today"
          avatars={peopleAvatars}
          borderColor="border-l-red-500"
          onClick={() => setShowLeaveTodayModal(true)}
        />
        {/* On leave tomorrow */}
        <CardWithAvatars
          title="On Leave Tomorrow"
          avatars={peopleAvatars}
          borderColor="border-l-cyan-500"
          onClick={() => setShowLeaveTomorrowModal(true)}
        />

        {/* Leave applications */}
        <CardWithAvatars
          title="Leave applications"
          avatars={peopleAvatars}
          borderColor="border-l-green-500"
          onClick={() => setShowLeaveApplicationsModal(true)}
        />

        {/* Pending attendance approval */}
        <CardWithAvatars
          title="Pending attendance approval"
          avatars={peopleAvatars}
          borderColor="border-l-blue-500"
          onClick={() => setShowAttendanceApprovalModal(true)}
        />

        {/* Pending attendance recons */}
        <CardWithAvatars
          title="Pending attendance recons"
          avatars={peopleAvatars}
          borderColor="border-l-yellow-500"
          onClick={() => setShowAttendanceReconsModal(true)}
        />

        {/* On visit today */}
        <CardWithAvatars
          title="On visit today"
          avatars={peopleAvatars}
          borderColor="border-l-purple-500"
          onClick={() => setShowOnVisitTodayModal(true)}
        />
      </div>

      {/* This month birthdays */}
      <div className="col-span-1 2xl:col-span-3 gap-4 ">
        <div className="dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text border rounded-md p-5 shadow-md">
          <div className="flex items-center justify-between gap-2  border-b text-sm font-bold pb-2 title-color">
            {" "}
            <span className="flex items-center gap-2">
              {" "}
              <FaBirthdayCake
                className="text-primaryColor-500"
                size={16}
              />{" "}
              This month birthdays
            </span>
            <span className="text-gray-900 text-lg">21</span>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">Birthday today</p>
              <p className="text-gray-900 font-bold">05</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">Birthdays upcoming</p>
              <p className="text-gray-900 font-bold">12</p>
            </div>
            <Button
              className={
                "bg-primaryColor hover:bg-primaryColor-700 text-white py-2 my-1  font-bold w-full rounded-full "
              }
              size={"sm"}
            >
              View All
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <HrOnLeaveTodayModal
        showModal={showLeaveTodayModal}
        handleClose={() => {
          setShowLeaveTodayModal(false);
        }}
      />
      <HrOnLeaveTomorrowModal
        showModal={showLeaveTomorrowModal}
        handleClose={() => {
          setShowLeaveTomorrowModal(false);
        }}
      />
      <HrPendingAttendanceApprovalModal
        showModal={showAttendanceApprovalModal}
        handleClose={() => {
          setShowAttendanceApprovalModal(false);
        }}
      />
      <HrPendingAttendanceReconsModal
        showModal={showAttendanceReconsModal}
        handleClose={() => {
          setShowAttendanceReconsModal(false);
        }}
      />
      <HrOnVisitTodayModal
        showModal={showOnVisitTodayModal}
        handleClose={() => {
          setShowOnVisitTodayModal(false);
        }}
      />
      <HrLeaveApplicationsModal
        showModal={showLeaveApplicationsModal}
        handleClose={() => {
          setShowLeaveApplicationsModal(false);
        }}
      />
    </div>
  );
};

export default HrLeaveDashboardSection;
