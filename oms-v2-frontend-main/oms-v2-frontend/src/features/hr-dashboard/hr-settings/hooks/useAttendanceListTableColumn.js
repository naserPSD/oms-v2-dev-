import Avatar from "@/components/ui/Avatar";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import Link from "next/link";
import { useMemo } from "react";
import { FaBuilding, FaDesktop } from "react-icons/fa";
import { FaClock, FaFingerprint, FaRocket, FaUser } from "react-icons/fa6";
import {
  HiOutlineDesktopComputer,
  HiOutlineDocumentText,
} from "react-icons/hi";
export const useAttendanceListTableColumn = ({ handleEdit, handleDelete }) => {
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
        filterFn: 'includesString',
        cell: ({ row }) => {
          const employee = row?.original?.employee;
          const user = employee?.user;
          const userProfile = row?.original?.employee?.user?.profile;
          const designation = employee?.designation;
          return (
            <Link
              href={`/hr-dashboard/employee/${row?.original?.empId}`}
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
                  // className="bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-100"
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
          const office = row.original?.office;
          const officeShift = row.original?.shift;
          const department = row.original?.designation?.department;
          return (
            <div className="flex items-center gap-2">
              <div>
                <p className="font-semibold dark-title-color">{office?.name}</p>
                <p className="text-xs text-start">
                  <SimpleTooltip text={"Office Shift"}>
                    <span>{office?.officeType?.name}</span>
                  </SimpleTooltip>
                  <span className="text-xs">{officeShift?.name}</span>
                </p>
                {officeShift ? (
                  <span className="text-xs text-start">
                    {officeShift?.startTime &&
                      helpers.dTime(officeShift?.startTime)}{" "}
                    to{" "}
                    {officeShift?.endTime &&
                      helpers.dTime(officeShift?.endTime)}
                  </span>
                ) : (
                  <span className="text-xs text-start">
                    {office?.startTime && helpers.dTime(office?.startTime)} to{" "}
                    {office?.endTime && helpers.dTime(office?.endTime)}
                  </span>
                )}
                {/* <SimpleTooltip text={"Department"}>
                  <p className="text-xs text-gray-500">{department?.name}</p>
                </SimpleTooltip> */}
              </div>
            </div>
          );
        },
        size: 200,
      },
      // ====================== Attendance Time ======================
      {
        accessorKey: "checkIn",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaClock size={12} />
            <span>Check In</span>
          </div>
        ),
        cell: ({ row }) => {
          const checkIn = helpers.dTime(row.original.checkIn);

          const checkInStatus = row.original.checkInStatus;

          return (
            <div className="flex items-center justify-between flex-wrap  sm:flex-nowrap gap-2 ">
              <p>
                <SimpleTooltip text={`Check-In`}>
                  <span
                    className={`sm:whitespace-nowrap text-${
                      checkInStatus?.colorName || "secondary"
                    }`}
                  >
                    {checkIn}
                  </span>
                </SimpleTooltip>
              </p>
              <p>
                <SimpleTooltip text={`${checkInStatus?.name} - Check-In`}>
                  <span
                    className={`text-xs badge badge-pill badge-outline-${
                      checkInStatus?.colorName || "secondary"
                    }  whitespace-nowrap`}
                  >
                    {checkInStatus?.name}
                  </span>
                </SimpleTooltip>
              </p>
            </div>
          );
        },
      },

      {
        accessorKey: "checkOut",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaClock size={12} />
            <span>Check Out</span>
          </div>
        ),
        size: 280,
        cell: ({ row }) => {
          const checkOut = helpers.dTime(row?.original?.checkOut);

          const checkOutStatus = row.original?.checkOutStatus;
          if (!row?.original?.checkOut) {
            return <span className="text-gray-500">-</span>;
          }
          return (
            <div className="flex items-center justify-between flex-wrap  sm:flex-nowrap gap-2 ">
              <p>
                <SimpleTooltip text={`Check-Out`}>
                  <span
                    className={`sm:whitespace-nowrap text-${
                      checkOutStatus?.colorName || "secondary"
                    }`}
                  >
                    {checkOut}
                  </span>
                </SimpleTooltip>
              </p>
              <p>
                <SimpleTooltip text={`${checkOutStatus?.name} - Check-Out`}>
                  <span
                    className={`text-xs badge badge-pill badge-outline-${
                      checkOutStatus?.colorName || "secondary"
                    }  whitespace-nowrap`}
                  >
                    {checkOutStatus?.name}
                  </span>
                </SimpleTooltip>
              </p>
            </div>
          );
        },
      },

      // ====================== Status ======================
      {
        accessorKey: "attendanceStatus",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaFingerprint size={12} />
            <span>Status</span>
          </div>
        ),
        size: 120,
        cell: ({ row }) => {
          const status = row.original.attendanceStatus;
          const color = status?.colorName || "secondary";
          return (
            <span
              className={`badge badge-pill badge-outline-${color}  whitespace-nowrap`}
            >
              {status?.name}
            </span>
          );
        },
      },

      // ====================== Overtime ======================
      {
        accessorKey: "workedHour",
        header: () => (
            <SimpleTooltip text={"Working Hour"}>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <FaClock size={12} />
                <span>W HOUR</span>
              </div>
            </SimpleTooltip>
        ),
        size: 200,
        cell: ({ row }) => {
          const workedHour = row.original.workedHour
            ? `${row.original.workedHour}h`
            : "-";

          return (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <SimpleTooltip text={"Working Hour"}>
                <span className="text-gray-500">{workedHour}</span>
              </SimpleTooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "overTime",

        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <FaRocket size={12} />
            <span>Overtime</span>
          </div>
        ),
        size: 180,
        cell: ({ row }) => {
          const overTime = row.original.overtimeHour
            ? `${row.original.overtimeHour}h`
            : "-";

          return (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <SimpleTooltip text={"OverTime Hour"}>
                <span className="text-gray-500">{overTime}</span>
              </SimpleTooltip>
            </div>
          );
        },
      },

      // ====================== Device & IP ======================
      {
        accessorKey: "ipAddress",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <HiOutlineDesktopComputer size={12} />
            <span>Device / IP</span>
          </div>
        ),
        size: 160,
        cell: ({ row }) => {
          let parsedJson = null;
          try {
            parsedJson = row.original.jsonData
              ? JSON.parse(row.original.jsonData)
              : null;
          } catch (e) {
            parsedJson = null;
          }

          const os = parsedJson?.os?.name;
          const browser = parsedJson?.browser?.name;
          return (
            <div className="px-3 py-2">
              <p className="inline-flex items-center gap-2 dark-title-color text-sm">
                <FaDesktop /> {browser || os || "N/A"}
              </p>
              <p className="dark-title-color text-xs">
                <span className="font-bold">IP:</span> {row.original.ipAddress}
              </p>
            </div>
          );
        },
      },

      // ====================== Remarks ======================
      {
        accessorKey: "remarks",
        header: () => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <HiOutlineDocumentText size={12} />
            <span>Remarks</span>
          </div>
        ),
        cell: ({ row }) => (
          <p className="text-xs text-gray-500">{row.original.remarks || "-"}</p>
        ),
      },

      // ====================== Actions ======================
      // {
      //   accessorKey: "actions",
      //   header: () => (
      //     <div className="flex items-center gap-2 whitespace-nowrap">
      //       <HiOutlineCog size={12} />
      //       <span>Action</span>
      //     </div>
      //   ),
      //   enableSorting: false,
      //   size: 80,
      //   cell: ({ row }) => {
      //     const employee = row.original;
      //     return (
      //       <div className="action flex gap-2">
      //         <button
      //           onClick={() => handleEdit(employee)}
      //           className="btn-action text-blue-500 hover:text-blue-700"
      //         >
      //           <Pencil size={16} />
      //         </button>
      //         <button
      //           onClick={() => handleDelete(employee.id)}
      //           className="btn-action text-red-500 hover:text-red-700"
      //         >
      //           <Trash2 size={16} />
      //         </button>
      //       </div>
      //     );
      //   },
      // },
    ],
    [handleEdit, handleDelete]
  );
};
