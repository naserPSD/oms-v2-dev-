import Avatar from "@/components/ui/Avatar";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { FileCheck2, Info } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { FaBuilding } from "react-icons/fa";
import { FaClock, FaFingerprint, FaUser } from "react-icons/fa6";

export const useAttendanceReconciliationsTableColumn = ({
  setShowCheckInStatusModal,
  setShowCheckOutStatusModal,
  setReconData,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "employeeDetails",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaUser size={12} />
            <span>Employee</span>
          </div>
        ),
        accessorFn: (row) => row.employee?.user?.fullName,
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const employee = row?.original?.employee;
          const user = employee?.user;
          const userProfile = user?.profile;
          const designation = employee?.designation;
          return (
            <Link
              href={`/hr-dashboard/employee/${employee?.userId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {userProfile?.profilePicture?.fileUrl ? (
                  <img
                    src={userProfile?.profilePicture?.fileUrl}
                    alt={user?.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <Avatar
                    text={helpers.avatarText(user?.fullName)}
                    color="info"
                    size="md"
                  />
                )}

                <div>
                  <p className="font-semibold dark-title-color">
                    {user?.fullName}
                  </p>
                  {designation?.name && (
                    <SimpleTooltip text={"Designation"}>
                      <span className="badge badge-rounded badge-outline-secondary">
                        {designation?.name}
                      </span>
                    </SimpleTooltip>
                  )}
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-500">
                    {userProfile?.phoneWithCallingCode}
                  </p>
                </div>
              </div>
            </Link>
          );
        },
        size: 250,
      },
      {
        accessorKey: "office",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaBuilding size={12} />
            <span>Office Info</span>
          </div>
        ),
        cell: ({ row }) => {
          const attendance = row.original?.attendance;
          const office = attendance?.office;
          const shift = attendance?.shift;
          return (
            <div className="flex items-center gap-2">
              {office ? (
                <div>
                  <p className="font-semibold dark-title-color">
                    {office?.name}
                  </p>
                  <p className="text-xs text-start">
                    <SimpleTooltip text={"Shift"}>
                      <span className="text-xs">{shift?.name}</span>
                    </SimpleTooltip>
                  </p>
                  {shift ? (
                    <SimpleTooltip
                      text={`Shift: ${formatTime(
                        shift?.startTime
                      )} to ${formatTime(shift?.endTime)}`}
                    >
                      <p className="text-xs text-start">
                        {shift?.startTime && formatTime(shift?.startTime)} to{" "}
                        {shift?.endTime && formatTime(shift?.endTime)}
                      </p>
                    </SimpleTooltip>
                  ) : (
                    <SimpleTooltip
                      text={`Office: ${formatTime(
                        office?.startTime
                      )} to ${formatTime(office?.endTime)}`}
                    >
                      <p className="text-xs text-start">
                        {office?.startTime && formatTime(office?.startTime)} to{" "}
                        {office?.endTime && formatTime(office?.endTime)}
                      </p>
                    </SimpleTooltip>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-semibold dark-title-color">N/A</p>
                  <p className="text-xs text-start">N/A</p>
                  <p className="text-xs text-start">N/A</p>
                </div>
              )}
            </div>
          );
        },
        size: 200,
      },
      // ====================== Attendance Date ======================
      {
        accessorKey: "attendanceDate",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaClock size={12} />
            <span>Date</span>
          </div>
        ),
        cell: ({ row }) => {
          const date = row.original.attendanceDate;

          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{helpers.dDate(date)}</span>
            </div>
          );
        },
        size: 120,
      },
      // ====================== Check In Time & Status ======================

      {
        accessorKey: "checkInTime",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaClock size={12} />
            <span>Check In Time</span>
          </div>
        ),
        cell: ({ row }) => {
          const attendance = row.original?.attendance;
          const checkIn = helpers.dTime(attendance?.checkIn);
          const checkInStatus = attendance?.checkInStatus;

          return (
            <div className="flex flex-wrap items-center gap-1 min-w-[120px]">
              <span
                className={`text-sm font-medium ${
                  checkInStatus?.colorName
                    ? `text-${checkInStatus.colorName}`
                    : "title-color"
                }`}
              >
                <SimpleTooltip text={`Check-In Time`}>
                  {checkIn || "N/A"}
                </SimpleTooltip>
              </span>
              {checkInStatus?.name && (
                <span
                  className={`text-xs badge badge-pill badge-outline-${
                    checkInStatus?.colorName || "secondary"
                  } whitespace-nowrap`}
                >
                  <SimpleTooltip text={`${checkInStatus?.name} - Check-In`}>
                    {checkInStatus?.name}
                  </SimpleTooltip>
                </span>
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "checkInReconciliation",
        header: () => (
          <SimpleTooltip text={`Check In Reconciliation`}>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <FileCheck2 size={12} />
              <span>Check In Recon</span>
            </div>
          </SimpleTooltip>
        ),
        cell: ({ row }) => {
          const inTimeStatus = row.original?.inTimeStatus;
          const inTimeRemarks = row.original?.inTimeRemarks;

          if (!inTimeStatus?.name) {
            return <span className="text-gray-400 text-sm">-</span>;
          }

          return (
            <button
              className="flex items-center flex-wrap gap-2 min-w-[120px]"
              onClick={() => {
                setShowCheckInStatusModal(true);
                setReconData(row.original);
              }}
            >
              <SimpleTooltip text={`Reconciliation Status`}>
                <span
                  className={`text-xs badge badge-pill badge-${inTimeStatus?.colorName} whitespace-nowrap`}
                >
                  {inTimeStatus?.name}
                </span>
              </SimpleTooltip>
              {inTimeRemarks && (
                <SimpleTooltip text={`Remarks: ${inTimeRemarks}`}>
                  <span className="text-blue-500 cursor-help hover:text-blue-700 transition-colors">
                    <Info size={14} />
                  </span>
                </SimpleTooltip>
              )}
            </button>
          );
        },
        size: 150,
      },
      {
        accessorKey: "approvedBy",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaUser size={12} />
            <span>Approved by</span>
          </div>
        ),
        cell: ({ row }) => {
          const user = row.original?.attendance?.lateApprovalUser;
          const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
          if (!name) return <span className="text-gray-400 text-sm">—</span>;
          return <span className="text-sm title-color whitespace-nowrap">{name}</span>;
        },
        size: 140,
      },
      {
        accessorKey: "checkOutTime",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaClock size={12} />
            <span>Check Out Time</span>
          </div>
        ),
        cell: ({ row }) => {
          const attendance = row.original?.attendance;
          const checkOut = helpers.dTime(attendance?.checkOut);
          const checkOutStatus = attendance?.checkOutStatus;

          if (!attendance?.checkOut) {
            return <span className="text-gray-400 text-sm">N/A</span>;
          }

          return (
            <div className="flex flex-wrap items-center gap-2 min-w-[150px]">
              <span
                className={`text-sm font-medium ${
                  checkOutStatus?.colorName
                    ? `text-${checkOutStatus.colorName}`
                    : "title-color"
                }`}
              >
                <SimpleTooltip text={`Check-Out Time`}>
                  {checkOut || "N/A"}
                </SimpleTooltip>
              </span>
              {checkOutStatus?.name && (
                <span
                  className={`text-xs badge badge-pill badge-outline-${
                    checkOutStatus?.colorName || "secondary"
                  } whitespace-nowrap`}
                >
                  <SimpleTooltip text={`${checkOutStatus?.name} - Check-Out`}>
                    {checkOutStatus?.name}
                  </SimpleTooltip>
                </span>
              )}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "checkOutReconciliation",
        header: () => (
          <SimpleTooltip text="Check Out Reconciliation">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <FileCheck2 size={12} />
              <span>Check Out Recon</span>
            </div>
          </SimpleTooltip>
        ),
        cell: ({ row }) => {
          const outTimeStatus = row.original?.outTimeStatus;
          const outTimeRemarks = row.original?.outTimeRemarks;

          if (!outTimeStatus?.name) {
            return <span className="text-gray-400 text-sm">-</span>;
          }

          return (
            <button
              className="flex items-center gap-2 min-w-[120px]"
              onClick={() => {
                setReconData(row.original);
                setShowCheckOutStatusModal(true);
              }}
            >
              <SimpleTooltip text={`Reconciliation Status`}>
                <span
                  className={`text-xs badge badge-pill badge-${outTimeStatus?.colorName} whitespace-nowrap`}
                >
                  {outTimeStatus?.name}
                </span>
              </SimpleTooltip>
              {outTimeRemarks && (
                <SimpleTooltip text={`Remarks: ${outTimeRemarks}`}>
                  <span className="text-blue-500 cursor-help hover:text-blue-700 transition-colors">
                    <Info size={14} />
                  </span>
                </SimpleTooltip>
              )}
            </button>
          );
        },
        size: 150,
      },
      // ====================== Attendance Status ======================
      {
        accessorKey: "attendanceStatus",
        header: () => (
          <SimpleTooltip text={"Attendance Status"}>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <FaFingerprint size={12} />
              <span>Att. Status</span>
            </div>
          </SimpleTooltip>
        ),
        size: 120,
        cell: ({ row }) => {
          const attendance = row.original?.attendance;
          const status = attendance?.attendanceStatus;
          const color = status?.colorName || "secondary";
          return (
            <div>
              <SimpleTooltip text={`AttendanceStatus ${status?.name || ""}`}>
                {status ? (
                  <span
                    className={`badge badge-pill badge-outline-${color} whitespace-nowrap`}
                  >
                    {status?.name}
                  </span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </SimpleTooltip>
            </div>
          );
        },
      },
    ],
    [setShowCheckInStatusModal, setShowCheckOutStatusModal, setReconData]
  );
};
