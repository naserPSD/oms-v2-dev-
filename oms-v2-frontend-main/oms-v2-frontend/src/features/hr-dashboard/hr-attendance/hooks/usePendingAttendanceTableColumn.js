import Avatar from "@/components/ui/Avatar";
import helpers from "@/utils/helpers";
import Link from "next/link";
import { useMemo } from "react";
import { FaBuilding, FaCalendarAlt } from "react-icons/fa";
import { FaClock, FaHourglassHalf, FaUser } from "react-icons/fa6";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

export const usePendingAttendanceTableColumn = () => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        id: "employeeDetails",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaUser size={12} />
            <span>Employee Details</span>
          </div>
        ),
        accessorFn: (row) => row?.employee?.user?.fullName || "",
        enableGlobalFilter: true,
        cell: ({ row }) => {
          const employee = row?.original?.employee;
          const user = employee?.user;
          const userProfile = user?.profile;
          const designation = row?.original?.designation || employee?.designation;
          const employeeCode = row?.original?.employeeCode || employee?.employeeCode;

          return (
            <Link
              href={`/hr-dashboard/employee/${row?.original?.empId}`}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <Avatar
                image={userProfile?.profilePicture?.fileUrl || ""}
                text={helpers.avatarText(user?.fullName)}
                value={user?.fullName || ""}
                alt={user?.fullName || "Employee"}
                color="warning"
                size="md"
              />

              <div className="min-w-0">
                <p className="font-semibold text-sm dark-title-color truncate">
                  {user?.fullName || "N/A"}
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {employeeCode && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      ID: {employeeCode}
                    </span>
                  )}
                  {designation?.name && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      {designation.name}
                    </span>
                  )}
                </div>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>
                )}
              </div>
            </Link>
          );
        },
        size: 260,
      },
      {
        id: "department",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <HiOutlineOfficeBuilding size={14} />
            <span>Department</span>
          </div>
        ),
        cell: ({ row }) => {
          const department = row.original?.department;
          const designation = row.original?.designation;
          return (
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                {department?.name || "General"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {designation?.name || "Not assigned"}
              </p>
            </div>
          );
        },
        size: 180,
      },
      {
        id: "office",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaBuilding size={12} />
            <span>Office</span>
          </div>
        ),
        cell: ({ row }) => {
          const office = row.original?.office;
          return (
            <div>
              <p className="font-semibold text-sm dark-title-color">
                {office?.name || "Main Office"}
              </p>
              {office?.address && (
                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                  {office.address}
                </p>
              )}
            </div>
          );
        },
        size: 170,
      },
      {
        id: "shift",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaClock size={12} />
            <span>Assigned Shift</span>
          </div>
        ),
        cell: ({ row }) => {
          const shift = row.original?.shift;
          if (!shift) {
            return (
              <span className="text-xs text-gray-400 italic">
                Standard Schedule
              </span>
            );
          }
          return (
            <div>
              <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                {shift.name || "Default Shift"}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>
                  {shift.startTime ? helpers.dTime(shift.startTime) : "09:00 AM"}{" "}
                  -{" "}
                  {shift.endTime ? helpers.dTime(shift.endTime) : "05:00 PM"}
                </span>
              </div>
            </div>
          );
        },
        size: 190,
      },
      {
        accessorKey: "attendanceDate",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaCalendarAlt size={12} />
            <span>Attendance Date</span>
          </div>
        ),
        cell: ({ row }) => {
          const date = row.original?.attendanceDate;
          if (!date) return <span className="text-xs text-gray-400">N/A</span>;
          const formatted = new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return (
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {formatted}
            </span>
          );
        },
        size: 140,
      },
      {
        id: "status",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaHourglassHalf size={12} />
            <span>Attendance Status</span>
          </div>
        ),
        cell: () => {
          return (
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending / Not Checked In
              </span>
            </div>
          );
        },
        size: 180,
      },
    ],
    [],
  );
};

export default usePendingAttendanceTableColumn;
