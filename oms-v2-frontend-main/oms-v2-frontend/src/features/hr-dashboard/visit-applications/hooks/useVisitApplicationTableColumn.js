import SimpleTooltip from "@/components/ui/SimpleTooltip";
import Avatar from "@/components/ui/Avatar";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export const useVisitApplicationTableColumn = ({
  setShowStatusModal,
  setSelectedStatus,
  setRemarks,
  setSelectedRow,
  setEditingField,
  setShowTimeModal,
  hasPermission,
  setCheckInTime,
  setCheckOutTime,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => row.index + 1,
      },
      // {
      //   accessorKey: "visitor",
      //   header: "Visitor",
      //   cell: ({ row }) => {
      //     const visitor = row.original?.visitor;
      //     const user = visitor?.user;
      //     const profile = user?.profile;

      //     return (
      //       <div className="flex items-center gap-3">
      //         {profile?.profilePicture ? (
      //           <img
      //             src={profile?.profilePicture?.fileUrl}
      //             alt={user.fullName}
      //             className="w-10 h-10 rounded-full object-cover"
      //             onError={(e) => {
      //               e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      //                 user.fullName
      //               )}&background=random`;
      //             }}
      //           />
      //         ) : (
      //           <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      //             <User className="w-5 h-5 text-gray-500" />
      //           </div>
      //         )}
      //         <div>
      //           <p className="font-semibold dark-title-color">
      //             {user?.fullName || "Unknown"}
      //           </p>
      //           <SimpleTooltip text="Phone Number">
      //             <p className="text-xs text-gray-500">
      //               {profile?.phone || "No phone"}
      //             </p>
      //           </SimpleTooltip>
      //         </div>
      //       </div>
      //     );
      //   },
      //   size: 250,
      // },
      {
        accessorKey: "employeeDetails",
        header: "Employee Details",
        cell: ({ row }) => {
          const visitor = row.original?.visitor;
          const user = visitor?.user;
          const profile = user?.profile;
          const office = row.original?.visitor?.office;

          return (
            <Link
              href={`/hr-dashboard/employee/${row.original.visitorEmpId}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                image={profile?.profilePicture?.fileUrl || ""}
                text={helpers.avatarText(user?.fullName)}
                value={user?.fullName || ""}
                alt={user?.fullName || "Employee"}
                color="info"
                size="md"
              />
              <div>
                <p className="font-semibold dark-title-color">
                  {user?.fullName}
                </p>
                <SimpleTooltip text={"Designation"}>
                  {visitor?.designation?.name && (
                    <span className="badge badge-rounded badge-outline-secondary">
                      {visitor?.designation?.name}
                    </span>
                  )}
                </SimpleTooltip>
                <div>
                  {" "}
                  <SimpleTooltip text={"Office"}>
                    <p className="font-semibold dark-title-color my-0.5">
                      {office?.name || "-"}
                    </p>
                  </SimpleTooltip>
                </div>

                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {profile?.phone || "No phone"}
                </p>
              </div>
            </Link>
          );
        },
        size: 250,
      },

      {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => {
          const purpose = row.original?.purpose;

          return (
            <div>
              <p className="font-semibold dark-title-color">{purpose || "-"}</p>
            </div>
          );
        },
        size: 200,
      },

      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => {
          const remarks = row.original?.remarks;

          return (
            <div>
              <p className="font-semibold dark-title-color">{remarks || "-"}</p>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "visitDateTime",
        header: "Visit Date & Time",
        cell: ({ row }) => {
          const visitDate = row.original?.visitDate;
          const visitTime = row.original?.visitTime;

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="font-semibold dark-title-color">
                  {visitDate ? helpers.dDate(visitDate) : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  {visitTime ? formatTime(visitTime) : "-"}
                </span>
              </div>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "checkInOut",
        header: "Check In/Out",
        cell: ({ row }) => {
          const isDisabled = !!row.original?.checkOutTime;

          return (
            <div className="space-y-1">
              <div
                className={`space-y-1 ${
                  isDisabled
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  if (isDisabled) return; // 🚫 stop click

                  setSelectedRow(row.original);
                  setCheckInTime(row.original?.checkInTime || "");
                  setCheckOutTime(row.original?.checkOutTime || "");
                  setShowTimeModal(true);
                }}
              >
                {/* Check-in */}
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`w-3 h-3 ${
                      row.original?.checkInTime
                        ? "text-green-500"
                        : "text-gray-300"
                    }`}
                  />
                  <span className="text-xs">
                    {row.original?.checkInTime
                      ? formatTime(row.original.checkInTime)
                      : "Not checked in"}
                  </span>
                </div>

                {/* Check-out */}
                <div className="flex items-center gap-2">
                  <XCircle
                    className={`w-3 h-3 ${
                      row.original?.checkOutTime
                        ? "text-red-500"
                        : "text-gray-300"
                    }`}
                  />
                  <span className="text-xs">
                    {row.original?.checkOutTime
                      ? formatTime(row.original.checkOutTime)
                      : "Not checked out"}
                  </span>
                </div>
              </div>
            </div>
          );
        },
        size: 150,
      },
      // {
      //   accessorKey: "visitStatus",
      //   header: "Visit Status",
      //   cell: ({ row }) => {
      //     const status = row.original?.visitStatus;

      //     return (
      //       <div className="text-center">
      //         <span
      //           className={`badge badge-pill badge-outline-${
      //             status?.colorName || "secondary"
      //           }`}
      //         >
      //           {status?.name}
      //         </span>
      //       </div>
      //     );
      //   },
      //   size: 120,
      // },
      {
        accessorKey: "visitStatus",
        header: "Visit Status",
        cell: ({ row }) => {
          const status = row.original?.visitStatus;

          return (
            <div className="text-center">
              {hasPermission("hr.visit_application_list_visit_status_edit") && (
                <button
                  onClick={() => {
                    setSelectedRow(row.original);
                    setSelectedStatus(row.original?.visitStatus?.id || "");
                    setRemarks(row.original?.remarks || "");
                    setEditingField("visitStatus"); // track which field
                    setShowStatusModal(true);
                  }}
                  className={`badge badge-pill badge-outline-${
                    status?.colorName || "secondary"
                  } cursor-pointer`}
                >
                  {status?.name}
                </button>
              )}
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "applicationStatus",
        header: "App Status",
        cell: ({ row }) => {
          const status = row.original?.applicationStatus;
          const createdAt = row.original?.createdAt;

          return (
            <div className="text-center">
              <button
                onClick={() => {
                  setSelectedRow(row.original);
                  setSelectedStatus(row.original?.applicationStatus?.id || "");
                  setRemarks(row.original?.remarks || "");
                  setEditingField("applicationStatus"); // track field
                  setShowStatusModal(true);
                }}
                className={`badge badge-pill badge-outline-${
                  status?.colorName || "secondary"
                } cursor-pointer`}
              >
                {status?.name}
              </button>

              <p className="text-xs text-gray-500 mt-1">
                {createdAt ? helpers.dDate(createdAt) : "-"}
              </p>
            </div>
          );
        },
        size: 120,
      },

      // {
      //   accessorKey: "actions",
      //   header: "Actions",
      //   enableSorting: false,
      //   size: 100,
      //   cell: ({ row }) => {
      //     const item = row.original;
      //     const canEdit =
      //       item.status?.code !== "visit_application_status_approved" ||
      //       (!item.checkInTime && !item.checkOutTime);

      //     return (
      //       <div className="action">
      //         {canEdit && (
      //           <SimpleTooltip text="Edit Application">
      //             <button
      //               onClick={() => handleEdit(item)}
      //               className="btn-action text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
      //             >
      //               <Pencil size={16} />
      //             </button>
      //           </SimpleTooltip>
      //         )}
      //         <SimpleTooltip text="Delete Application">
      //           <button
      //             onClick={() => handleDelete(item.id)}
      //             className="btn-action text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
      //           >
      //             <Trash2 size={16} />
      //           </button>
      //         </SimpleTooltip>
      //       </div>
      //     );
      //   },
      // },
    ],
    [
      setShowStatusModal,
      setSelectedStatus,
      setRemarks,
      setSelectedRow,
      setEditingField,
      setShowTimeModal,

      setCheckInTime,
      setCheckOutTime,
    ],
  );
};
