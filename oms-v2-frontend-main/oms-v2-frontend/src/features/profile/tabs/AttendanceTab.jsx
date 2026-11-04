// /tabs/AttendanceTab.jsx
"use client";
import { useState } from "react";
import { MdCalendarToday } from "react-icons/md";

// import { fetchAttendance } from '@/services/attendanceApi';
import MiniSpinner from "@/shared/loader/MiniSpinner";
import { useAuthStore } from "@/store/useAuthStore";
import { attendanceData } from "@/utils/attendanceData";
import { FaClock, FaFingerprint } from "react-icons/fa";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import AttendanceSummaryChart from "./AttendanceSummaryChart";
``;

const AttendanceTab = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       setLoading(true);
  //       const result = await fetchAttendance(user.id);
  //       setAttendance(result);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadData();
  // }, [user.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <MiniSpinner />
      </div>
    );
  }

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Attendance summery Chart */}
      <AttendanceSummaryChart />

      {/* Attendance details table */}
      <h4 className="font-bold text-lg title-color">Attendance summery</h4>

      {/* <div className="overflow-x-auto  max-h-[75vh] overflow-y-auto table-scroll  rounded-sm shadow-sm">
        <table className="min-w-full text-sm border  "> */}
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
            {attendanceData?.map((item, i) => (
              <tr key={i} className=" divide-gray-200 dark:divide-gray-400">
                <td className=" px-3 py-3.5 flex items-center gap-2">
                  <span className="text-gray-800 dark:text-theme-light-text">
                    {item?.date || "01 Jan 2025"}
                  </span>
                </td>
                <td className="px-3 py-2 ">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-${item.statusColor}`}>
                      {item.inTime}
                    </span>{" "}
                    <span className="text-gray-500 ">{item.totalHour}</span>
                    <span className="text-gray-900 dark:text-theme-light-text font-bold">
                      {item.outTime}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 ">
                  <span
                    className={` px-3 text-white dark:text-gray-700 py-1 rounded-full text-sm font-medium bg-${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="font-bold text-lg title-color">Employee History</h4>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">Sl.</th>
                <th>Designation</th>
                <th>Effective Date</th>
                <th className="text-center">Status</th>
                <th>Salary</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">01</td>
                <td>UI/UX Designer</td>
                <td>05 February 2025</td>
                <td className="text-center">Intern</td>
                <td>25,000 BDT</td>
                <td className="td-action">
                  <button type="button" className="btn-action"><i className="fa-regular fa-pen-to-square"></i></button>
                  <button type="button" className="btn-action hover:text-red-600"><i className="fa-regular fa-trash-can"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
};

export default AttendanceTab;
