"use client";

import { ModalTw } from "@/components/common/ModalTw";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import Link from "next/link";
import { useState } from "react";
import { FaChartBar, FaSadTear, FaSmile } from "react-icons/fa";
import { FaClock, FaUser } from "react-icons/fa6";
import { HiOutlineDocumentText, HiOutlineSwitchVertical } from "react-icons/hi";
import { Button } from "@/components/ui/button";

// Reusable avatar renderer
const renderAvatars = (users) => {
  const displayAvatars = users.slice(0, 4);
  const extra = users.length - displayAvatars.length;

  return (
    <div className="flex items-center">
      {/* 👆 min-height fix → all cards equal height */}
      <div className="flex items-center -space-x-4">
        {displayAvatars.map((user, index) => (
          <div
            key={index}
            className="size-11 xl:size-9 2xl:size-12 rounded-full overflow-hidden border-2 border-slate-50"
          >
            <SimpleTooltip text={user.fullName}>
              <img
                src={user.imageUrl}
                alt={user.fullName}
                className="object-cover size-11"
              />
            </SimpleTooltip>
          </div>
        ))}
      </div>

      {extra > 0 && (
        <span className="ml-1 text-sm text-gray-500 font-medium">
          +{extra.toString().padStart(2, "0")}
        </span>
      )}
    </div>
  );
};

const AttendanceStatistics = ({ attendanceStatistics, loading = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { onTimeCheckIn = {}, lateCheckIn = {}, earlyTiming = {}, absent = {}, totalEmployees = 0, totalPresent = 0, totalAbsent = 0 } = attendanceStatistics || {};

  const headerData = [
    { title: "Employee Info", icon: FaUser },
    { title: "Email", icon: HiOutlineDocumentText },
    { title: "Check-In Time", icon: FaClock },
  ];

  // Function to open modal dynamically
  const openModal = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const modalData =
    selectedCategory === "onTimeCheckIn"
      ? onTimeCheckIn
      : selectedCategory === "lateCheckIn"
      ? lateCheckIn
      : selectedCategory === "earlyTiming"
      ? earlyTiming
      : null;

  const modalTitle =
    selectedCategory === "onTimeCheckIn"
      ? "On-Time Check-In Details"
      : selectedCategory === "lateCheckIn"
      ? "Late Check-In Details"
      : selectedCategory === "earlyTiming"
      ? "Early Timing Details"
      : "Attendance Details";

  // console.log("responseData", responseData);
  return (
    <>

            <div className=" flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6">
              {" "}
              <p className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Attendance statistics{" "}
              </p>{" "}
              <hr className="w-full hidden sm:flex" />{" "}
              <Link href="/hr-dashboard/attendance?tab=attendance-list">
                <Button className="bg-primaryColor hover:bg-primaryColor-700 text-white py-2  font-bold">
                  Attendance details
                </Button>
              </Link>
            </div>


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-9 gap-4">
        {/* On-Time Check-in */}
        <div
          className="xl:col-span-2 cursor-pointer"
          onClick={() => openModal("onTimeCheckIn")}
        >
          <div className="flex items-center gap-2 mb-1 ml-1 text-gray-500 font-bold text-sm">
            <FaSmile className="text-secondaryColor" />
            On-Time Check-in
          </div>
          <Card className="relative border-l-4 border-l-secondaryColor dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text">
            <CardContent className="px-4 flex items-center justify-between h-12">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-12" />
                  <div className="border-l mx-2 h-8" />
                  <div className="flex items-center -space-x-4">
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900 dark:text-theme-light-text">
                    {onTimeCheckIn?.count?.toString().padStart(2, "0") || "00"}
                  </div>
                  <div className="border-l mx-2 h-8" />
                  {renderAvatars(onTimeCheckIn?.users || [])}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Late Check-in */}
        <div
          className="xl:col-span-2 cursor-pointer"
          onClick={() => openModal("lateCheckIn")}
        >
          <div className="flex items-center gap-2 mb-1 ml-1 text-gray-500 font-bold text-sm">
            <FaSadTear className="text-yellow-500" />
            Late Check-in
          </div>
          <Card className="relative border-l-4 border-l-yellow-500 dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text">
            <CardContent className="px-4 flex items-center justify-between h-12">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-12" />
                  <div className="border-l mx-2 h-8" />
                  <div className="flex items-center -space-x-4">
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900 dark:text-theme-light-text">
                    {lateCheckIn?.count?.toString().padStart(2, "0") || "00"}
                  </div>
                  <div className="border-l mx-2 h-8" />
                  {renderAvatars(lateCheckIn?.users || [])}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Early Timing */}
        <div
          className="xl:col-span-2 cursor-pointer"
          onClick={() => openModal("earlyTiming")}
        >
          <div className="flex items-center gap-2 mb-1 ml-1 text-gray-500 font-bold text-sm">
            <FaSmile className="text-green-500" />
            Early Timing
          </div>
          <Card className="relative border-l-4 border-l-green-500 dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text">
            <CardContent className="px-4 flex items-center justify-between h-12">
              {loading ? (
                <>
                  <Skeleton className="h-8 w-12" />
                  <div className="border-l mx-2 h-8" />
                  <div className="flex items-center -space-x-4">
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900 dark:text-theme-light-text">
                    {earlyTiming?.count?.toString().padStart(2, "0") || "00"}
                  </div>
                  <div className="border-l mx-2 h-8" />
                  {renderAvatars(earlyTiming?.users || [])}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Absent */}
        {/* <div
        className="xl:col-span-3 cursor-pointer"
        onClick={() => openModal("earlyTiming")}
      >
        <div className="flex items-center gap-2 mb-1 ml-1 text-gray-500 font-bold text-sm">
          <FaSadTear className="text-red-500" />
          Absent
        </div>
        <Card className="relative border-l-4 border-l-green-500 dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text">
          <CardContent className="px-4 flex items-center justify-between h-12">
            {loading ? (
              <>
                <Skeleton className="h-8 w-12" />
                <div className="border-l mx-2 h-8" />
                <div className="flex items-center -space-x-4">
                  <Skeleton className="size-11 rounded-full" />
                  <Skeleton className="size-11 rounded-full" />
                  <Skeleton className="size-11 rounded-full" />
                  <Skeleton className="size-11 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-theme-light-text">
                  {absent?.count?.toString().padStart(2, "0") || "00"}
                </div>
                <div className="border-l mx-2 h-8" />
                {renderAvatars(absent?.users || [])}
              </>
            )}
          </CardContent>
        </Card>
      </div> */}

        {/* Overview */}
        <div className="xl:col-span-3">
          <div className="flex items-center gap-2 mb-1 ml-1 text-gray-500 font-bold text-sm">
            <FaChartBar className="text-[#3B9DF8]" />
            Overview
          </div>
          <Card className="relative border-l-4 border-l-sky-500 dark:bg-theme-dark bg-theme-light dark:text-theme-light-text text-theme-dark-text">
            <CardContent className="px-4 flex items-center justify-between h-12">
              <div className="w-full flex items-center justify-between text-center divide-x divide-[#E0E5ED]">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Present</p>
                  {loading ? (
                    <Skeleton className="h-6 w-8 mx-auto" />
                  ) : (
                    <p className="text-xl font-bold text-gray-900 dark:text-theme-light-text">
                      {totalPresent === 0 ? "0" : totalPresent.toString().padStart(2, "0")}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Absent</p>
                  {loading ? (
                    <Skeleton className="h-6 w-8 mx-auto" />
                  ) : (
                    <p className="text-xl font-bold text-gray-900 dark:text-theme-light-text">
                      {totalAbsent === 0 ? "0" : totalAbsent.toString().padStart(2, "0")}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-primaryColor-500 font-bold">Total</p>
                  {loading ? (
                    <Skeleton className="h-6 w-8 mx-auto" />
                  ) : (
                    <p className="text-xl font-bold text-gray-900 dark:text-theme-light-text">
                      {totalEmployees === 0 ? "0" : totalEmployees.toString().padStart(2, "0")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Modal */}
        <ModalTw
          show={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
          size="4xl"
          dismissible={true}
          showHeader={true}
          showFooter={false}
          type="default"
          position="center"
        >
          {modalData && (
            <div className="table-container max-h-[70vh] overflow-y-auto sidebar-scroll ">
              <table className="table">
                <thead>
                  <tr>
                    <th>SL</th>
                    {headerData.map(({ title, icon: IconComponent }) => (
                      <th key={title}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-3 h-3 text-gray-400 " />
                            <span className="whitespace-nowrap">{title}</span>
                          </div>
                          <HiOutlineSwitchVertical className="text-gray-500 w-4 h-4" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modalData?.users?.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <Link
                          href={`/hr-dashboard/employee/${item.empId}`}
                          className="flex items-center gap-2 whitespace-nowrap cursor-pointer hover:bg-gray-50 p-1 dark:hover:bg-gray-700"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.fullName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-semibold dark-title-color">
                              {item.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              EmpID: {item.empId}
                            </p>
                            {item.department && (
                              <p className="text-xs text-gray-500">
                                {item.department}
                              </p>
                            )}
                            {item.designation && (
                              <p className="text-xs text-gray-500">
                                {item.designation}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">{item.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td>{item?.email || "----"}</td>
                      <td>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-${item?.colorName || "secondary"}`}
                          >
                            {helpers.dTime(item?.checkIn)}
                          </span>
                          <span
                            className={`text-xs badge badge-pill badge-outline-${item?.colorName || "secondary"
                              }`}
                          >
                            {item?.checkInStatus}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModalTw>
      </div>
    </>
  );
};

export default AttendanceStatistics;
