"use client";
import CustomPagination from "@/shared/pagination/CustomPagination";
import { attendanceData } from "@/utils/attendanceData";
import { Search } from "lucide-react";
import { useState } from "react";
import { FaCalendar } from "react-icons/fa";
import { FaAngleDown, FaClock, FaFingerprint, FaUser } from "react-icons/fa6";
import { HiOutlineDocumentText, HiOutlineSwitchVertical } from "react-icons/hi";
import HrIndividualPendingAttendanceReportModal from "./modals/hr-individual-pending-attendance-report-modal/HrIndividualPendingAttendanceReportModal";

const HrPendingAttendanceTab = () => {
  const [showModal, setShowModal] = useState(false);
  const headerData = [
    { title: "Employee Details", icon: FaUser },
    { title: "Check in & out time", icon: FaClock },
    { title: "Attendance Date", icon: FaCalendar },
    { title: "Requested Date", icon: FaCalendar },
    { title: "Notes", icon: HiOutlineDocumentText },
    { title: "Status", icon: FaFingerprint },
  ];
  return (
    <div>
      {" "}
      {/* title part */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-bold dark-title-color">
            Pending Attendance
          </h2>
          <div className="w-0.5 h-8 rounded bg-gray-200 dark:bg-gray-600  hidden md:block" />
          <div className="flex items-center  py-2 text-sm ">
            <p className="dark-title-color">All</p>
            <button className="dark:bg-theme-dark-text  ml-2 bg-theme-light rounded-full w-6 h-6 flex items-center justify-center ">
              <FaAngleDown size={16} />{" "}
            </button>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <Button
            className="flex items-center gap-2 border border-gray-600 title-color rounded-full font-bold px-4 py-2 text-sm  "
            variant={"outline"}
          >
            <IoMdCopy size={18} />
            Generate report
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm">
            <MdDashboardCustomize /> Add Attendance
          </Button>
        </div> */}
      </div>
      {/* Filter Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 mt-4">
        {/* Left: Search + Filters */}
        <div className="flex flex-col md:flex-row flex-wrap gap-3 md:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Advanced Filter */}
          <div className="relative">
            <select
              className="border rounded-md px-3 py-2 text-sm appearance-none w-full md:w-44 
                     bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Advanced Filter</option>
            </select>
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              ⚙️
            </div>
          </div>
        </div>

        {/* Right: View & Print */}
        <div className="flex items-center gap-2">
          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            📄
          </button>
          <button className="p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            🖨️
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="table-container">
        {/* Desktop Table */}
        <table className="table">
          <thead className="">
            <tr>
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
            {attendanceData?.map((item, i) => (
              <tr key={i}>
                <td>
                  <button
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setShowModal(true)}
                  >
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold dark-title-color">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.id}</p>
                    </div>
                  </button>
                </td>
                <td className=" ">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-${item.statusColor}`}>
                      {item.inTime}
                    </span>{" "}
                    <span className="text-gray-500 ">{item.totalHour}</span>
                    <span className="dark-title-color font-bold">
                      {item.outTime}
                    </span>
                  </div>
                </td>
                <td>01 Jan 2025</td>
                <td>01 Jan 2025</td>
                <td>{item.note}</td>
                <td>
                  <span
                    className={`text-white px-2.5 whitespace-nowrap py-1 rounded-full text-sm font-medium bg-${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* right side pagination button */}
      <div>
        <CustomPagination totalPages={3} />
      </div>
      <HrIndividualPendingAttendanceReportModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default HrPendingAttendanceTab;
