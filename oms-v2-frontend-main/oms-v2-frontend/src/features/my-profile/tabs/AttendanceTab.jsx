// /tabs/AttendanceTab.jsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MdCalendarToday } from "react-icons/md";

// import { fetchAttendance } from '@/services/attendanceApi';
import { useAuthStore } from "@/store/useAuthStore";
``;
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { FaAngleDown } from "react-icons/fa6";
import { FaClock, FaFingerprint } from "react-icons/fa";
import { attendanceData } from "@/utils/attendanceData";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import AttendanceSummaryChart from "./AttendanceSummaryChart";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";
import { useParams } from "next/navigation";
import helpers from "@/utils/helpers";

const AttendanceTab = () => {
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);
  const headerData = [
    { title: "Date", icon: MdCalendarToday },
    { title: "Check in & out time", icon: FaClock },
    { title: "Status", icon: FaFingerprint },
  ];

  const ss = [
    ["Present", "Absent"],
    ["Absent", "Weekend"],
    ["Present", "Delay", "Holiday"],
    ["Extreme delay", "Delay", "Present"],
    ["Delay", "Delay", "Absent", "Present"],
    ["Present", "Present", "Present"],
    ["Present", "Absent", "On leave"],
    ["On leave", "Weekend", "Holiday"],
    ["Weekend"],
    ["Holiday", "Present"],
  ];

  // Status colors
  const statusColors = {
    Present: "bg-green-500",
    Absent: "bg-red-500",
    "Extreme delay": "bg-orange-500",
    Delay: "bg-yellow-400",
    "On leave": "bg-gray-800",
    Weekend: "bg-gray-400",
    Holiday: "bg-slate-300",
  };

  const { id } = useParams();

  const [selectedMonth, setSelectedMonth] = useState(null);

  const {
    useAttendanceSummeryForEmployeeQuery,
  } = useEmployeeProfileQueryApi({});

  const employeeId =
    id || user?.employee?.id || user?.employeeId || user?.empId;

  const {
    data: attendanceSummeryResponseData,
    refetch,
    isFetching,
  } = useAttendanceSummeryForEmployeeQuery({
    ...(employeeId ? { employeeId } : {}),
    attendanceDate: selectedMonth, // NEW PARAM
  });

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    refetch(); // 🔥 API call triggered
  };

  const responseData = {
    attendanceSummery: attendanceSummeryResponseData?.data,
  };

  const loading = isFetching;

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center">
  //       <MiniSpinner />
  //     </div>
  //   );
  // }

  if (error) return <div className="text-red-500">{error}</div>;

  const dateWiseSummery = useMemo(() => {
      const d = attendanceSummeryResponseData?.data?.dateWiseSummery;
      return d || [];
  }, [attendanceSummeryResponseData?.data?.dateWiseSummery]);

  return (
    <div className="space-y-6">
      {/* Attendance summery Chart */}
      <AttendanceSummaryChart
        isLoading={isFetching}
        attSummery={attendanceSummeryResponseData?.data}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      {/* Attendance details table */}
      <h4 className="font-bold text-lg title-color">Monthly Attendance Summary Table</h4>

      <div className="card-gradient rounded-lg p-4 ">
        <div className="table-container overflow-x-auto  max-h-[75vh] overflow-y-auto table-scroll">
          <table className="table">
            <thead className="sticky top-0  z-10">
              <tr className="">
                {headerData.map(({ title, icon: IconComponent }) => (
                  <th key={title} className="p-3 ">
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
              {loading ? (
                // 🔥 Skeleton Loader
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {/* Date */}
                    <td className="px-3 py-3.5">
                      <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </td>

                    {/* Check-in & out */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5">
                      <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    </td>
                  </tr>
                ))
              ) : (
                // 💡 Real Data
                dateWiseSummery?.map((item, i) => (
                  <tr key={i} className="divide-gray-200 dark:divide-gray-400">
                    <td className="px-3 py-3.5 flex items-center gap-2">
                      <span className="text-gray-800 dark:text-theme-light-text">
                        {item.date && helpers.dDate(item.date)}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-${item.colorName}`}>
                          {item.checkIn && helpers.dTime(item.checkIn)}
                        </span>
                        <span className="text-gray-500 ">
                          {item.workedHour ? item.workedHour : '-'}
                        </span>
                        <span className="text-gray-900 dark:text-theme-light-text font-bold">
                          {item.checkOut && helpers.dTime(item.checkOut)}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <span className={`badge badge-pill badge-outline-${item.colorName}`}>
                        {item.statusName}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;
