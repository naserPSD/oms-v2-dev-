"use client";
import { useState } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import {
  FaUser,
  FaCalendarAlt,
  FaEnvelope,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import helpers from "@/utils/helpers";
import LeaveTableExportMenu from "../../components/LeaveTableExportMenu";
import LeaveDecisionModal from "./LeaveDecisionModal";
import Link from "next/link";
import { BiPlus } from "react-icons/bi";

const SUMMARY_TABS = [
  { key: "approved", label: "Approved Leave" },
  { key: "pending", label: "Pending Leave" },
  { key: "rejected", label: "Rejected Leave" },
  { key: "total", label: "Total Leave" },
];

const CardLeaveModal = ({
  showModal,
  handleClose,
  title,
  leaveData,
  summaries,
  activeTab,
  isLoading = false,
}) => {
  const current =
    summaries && activeTab ? summaries[activeTab] : leaveData;
  const currentTitle =
    SUMMARY_TABS.find((tab) => tab.key === activeTab)?.label || title;
  const [detailUser, setDetailUser] = useState(null);
  const getStatusInfo = (status) => {
    switch (status?.code) {
      case "leave_request_approval_approved":
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          color: "text-green-600 bg-green-100 dark:bg-green-900/30",
          text: "Approved",
        };
      case "leave_request_approval_pending":
        return {
          icon: <FaClock className="text-yellow-500" />,
          color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
          text: "Pending",
        };
      case "leave_request_approval_rejected":
        return {
          icon: <FaTimesCircle className="text-red-500" />,
          color: "text-red-600 bg-red-100 dark:bg-red-900/30",
          text: "Rejected",
        };
      default:
        return {
          icon: <FaClock className="text-gray-500" />,
          color: "text-gray-600 bg-gray-100 dark:bg-gray-700",
          text: "Unknown",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return helpers.dDate(dateString);
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays + 1} day${diffDays + 1 > 1 ? "s" : ""}`;
  };

  const headerData = [
    { title: "Employee", icon: FaUser },
    { title: "Leave Type", icon: FaFileAlt },
    { title: "Duration", icon: FaCalendarAlt },
    { title: "Status", icon: FaCheckCircle },
    { title: "Applied On", icon: FaCalendarAlt },
    { title: "Approval Date", icon: FaCalendarAlt },
  ];

  const leaveUsers = current?.users || [];
  const leaveCount = current?.count ?? leaveUsers.length;

  const employeeProfileHref = (user) => {
    const empId = user?.empId || user?.employeeId;
    return empId ? `/hr-dashboard/employee/${empId}` : null;
  };

  return (
    <>
    <ModalTw
      show={showModal}
      onClose={() => {
        setDetailUser(null);
        handleClose?.();
      }}
      title={`${currentTitle} - ${leaveCount} leave requests`}
      size="6xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div>
        <div className="relative z-20 flex items-center justify-end gap-2 mb-4 overflow-visible">
          <Link
            href="/hr-dashboard/employee?tab=employee-list"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <BiPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </Link>
          <LeaveTableExportMenu
            title={currentTitle}
            data={leaveUsers}
            variant="cardLeaveSummary"
            disabled={isLoading || !leaveUsers.length}
            inModal
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {leaveCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Requests
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {
                leaveUsers.filter(
                  (user) =>
                    user.approveStatus?.code ===
                    "leave_request_approval_approved",
                ).length
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Approved
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {
                leaveUsers.filter(
                  (user) =>
                    user.approveStatus?.code ===
                    "leave_request_approval_pending",
                ).length
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pending
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {
                leaveUsers.filter(
                  (user) =>
                    user.approveStatus?.code ===
                    "leave_request_approval_rejected",
                ).length
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Rejected
            </div>
          </div>
        </div>

        <div className="table-container max-h-[60vh] overflow-y-auto sidebar-scroll">
          <table className="table w-full">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr>
                {headerData.map(({ title: colTitle, icon: IconComponent }) => (
                  <th key={colTitle} className="px-4 py-3 border-b">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-gray-400" />
                        <span className="whitespace-nowrap font-medium">
                          {colTitle}
                        </span>
                      </div>
                      <HiOutlineSwitchVertical className="text-gray-500 w-4 h-4" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      Loading leave requests...
                    </div>
                  </td>
                </tr>
              ) : leaveUsers.length > 0 ? (
                leaveUsers.map((user, index) => {
                  const statusInfo = getStatusInfo(user.approveStatus);
                  const profileHref = employeeProfileHref(user);
                  const avatarSrc =
                    user.profilePictureUrl ||
                    (user.profilePicture
                      ? `http://oms.studypress.org/api/static/tmp_aws_media/${user.profilePicture}`
                      : null);

                  const employeeCell = (
                    <>
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={user.employeeName}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.employeeName || "User",
                            )}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FaUser className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            profileHref
                              ? "text-blue-600 dark:text-blue-400 hover:underline"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {user.employeeName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FaEnvelope className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </>
                  );

                  return (
                    <tr
                      key={user.id || `${user.email}-${user.startDate}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 border-b">
                        {profileHref ? (
                          <Link
                            href={profileHref}
                            className="flex items-center gap-3"
                            onClick={handleClose}
                          >
                            {employeeCell}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3">
                            {employeeCell}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.leaveType}
                          </p>
                          <button
                            type="button"
                            className="mt-1 text-left text-sm text-gray-600 dark:text-gray-400"
                            onClick={() => setDetailUser(user)}
                          >
                            Reason: {user.reason || "Not recorded"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b whitespace-nowrap">
                        <div>
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(user.startDate)} – {formatDate(user.endDate)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {calculateDuration(user.startDate, user.endDate)}
                          </p>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 border-b cursor-pointer"
                        onClick={() => setDetailUser(user)}
                      >
                        <div className="flex items-center gap-2">
                          {statusInfo.icon}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                          >
                            {user.approveStatus?.name || statusInfo.text}
                          </span>
                        </div>
                        {user.actionByName && (
                          <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                            {user.actionByName}
                          </p>
                        )}
                        {user.actionByDesignation && (
                          <p className="text-[11px] text-gray-500">
                            {user.actionByDesignation}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(user.appliedOn)}
                        </p>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <p className="text-gray-900 dark:text-white">
                          {user.approvalDate &&
                          user.approvalDate !== "2023-01-01T00:00:00.000Z"
                            ? formatDate(user.approvalDate)
                            : "Not Yet"}
                        </p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      No leave requests found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {leaveUsers.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
              Leave Type Distribution
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(
                leaveUsers.reduce((acc, user) => {
                  const type = user.leaveType || "Unknown";
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {}),
              ).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {type}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-sm">
                    {count} request{count > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalTw>
    <LeaveDecisionModal
      show={Boolean(detailUser)}
      onClose={() => setDetailUser(null)}
      row={detailUser}
    />
    </>
  );
};

export default CardLeaveModal;
