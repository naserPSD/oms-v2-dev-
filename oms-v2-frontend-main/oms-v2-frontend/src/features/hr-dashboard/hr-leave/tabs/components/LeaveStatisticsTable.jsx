"use client";
import { attendanceData } from "@/utils/attendanceData";
import { FaDesktop } from "react-icons/fa";
import {
  FaClock,
  FaFingerprint,
  FaLocationArrow,
  FaRocket,
  FaUser,
} from "react-icons/fa6";
import { HiOutlineDocumentText, HiOutlineSwitchVertical } from "react-icons/hi";
import { useState } from "react";
import HrIndividualLeaveReportModal from "../modals/HrIndividualLeaveReportModal";
const LeaveStatisticsTable = () => {
  const [showModal, setShowModal] = useState(false);
  const headerData = [
    { title: "Employee", icon: FaUser },
    { title: "Location", icon: FaLocationArrow },
    { title: "Date & Duration", icon: FaClock },
    { title: "Leave Type", icon: FaRocket },
    { title: "Status", icon: FaFingerprint },
    { title: "Notes/Reasons", icon: HiOutlineDocumentText },
    { title: "Action", icon: HiOutlineDocumentText },
  ];
  return (
    <div>
      {" "}
      <div className="table-container my-8">
        <table className="table">
          <thead>
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
                    className=" flex items-center gap-2 whitespace-nowrap cursor-pointer"
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
                <td>
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
                <td className="text-center">
                  <span
                    className={` badge badge-pill text-white bg-${item.statusColor}`}
                  >
                    {" "}
                    {item.status}
                  </span>
                </td>
                <td>{item.overTime || "-----"}</td>
                <td>
                  <p className="inline-flex items-center gap-2 dark-title-color">
                    <FaDesktop /> {item.desktopName}
                  </p>
                  <p className="dark-title-color">
                    <span className="font-bold">IP:</span>
                    {item.ip}
                  </p>
                </td>
                <td>{item.note}</td>
                <td>
                  <div className="action">
                    <button type="button" className="btn-action">
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button
                      type="button"
                      className="btn-action hover:text-red-600"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HrIndividualLeaveReportModal
        showModal={showModal}
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default LeaveStatisticsTable;
