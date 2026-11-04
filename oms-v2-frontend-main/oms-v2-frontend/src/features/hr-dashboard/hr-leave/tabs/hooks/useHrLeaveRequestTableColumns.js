import Avatar from "@/components/ui/Avatar";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { FaCheck } from "react-icons/fa";
import {
  LeaveDurationCell,
  LeaveStatusCell,
} from "../modals/LeaveDecisionModal";

/**
 * approvalStatusId mapping (example)
 * 51 = Pending
 * 52 = Approved
 * 53 = Rejected
 */
const getStatusInfo = (id) => {
  switch (id) {
    case 51:
      return { name: "Pending", color: "warning" };
    case 52:
      return { name: "Approved", color: "success" };
    case 53:
      return { name: "Rejected", color: "danger" };
    default:
      return { name: "Unknown", color: "secondary" };
  }
};
export const useHrLeaveRequestTableColumns = ({
  handleStatusChange,
  handleEdit,
  onViewBalance,
  onViewDecision,
  // handleDelete,
  hasPermission,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      // {
      //   accessorKey: "employeeDetails",
      //   header: "Employee Details",
      //   cell: ({ row }) => {
      //     const employee = row.original?.employee;
      //     const user = employee?.user;
      //     return (
      //       <div className="flex items-center gap-2">
      //         <Avatar
      //           text={helpers.avatarText(user?.fullName)}
      //           color="info"
      //           size="md"
      //         />
      //         <div className="text-left">
      //           <p className="font-semibold dark-title-color">
      //             {user?.fullName}
      //           </p>
      //           <p className="text-xs text-gray-500">
      //             <SimpleTooltip text="User ID">
      //               User ID: {employee?.userId}
      //             </SimpleTooltip>
      //           </p>
      //           <p className="text-xs text-gray-500">
      //             <SimpleTooltip text="User Email">
      //               {employee?.user?.email}
      //             </SimpleTooltip>
      //           </p>
      //         </div>
      //       </div>
      //     );
      //   },
      //   size: 220,
      // },

      {
        accessorKey: "userProfile",
        header: "Employee Details",
        accessorFn: (row) => row?.employee?.user?.fullName,
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const user = row?.original?.employee?.user;
          const userProfile = row?.original?.employee?.user?.profile;
          const designation = row?.original?.employee?.designation;
          return (
            <Link
              className="flex items-center gap-2"
              href={`/hr-dashboard/employee/${row?.original?.empId}`}
            >
              <Avatar
                image={userProfile?.profilePicture?.fileUrl || ""}
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
                  {designation?.name && (
                    <span className="badge badge-rounded badge-outline-secondary">
                      {designation?.name}
                    </span>
                  )}
                </SimpleTooltip>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {userProfile?.phoneWithCallingCode}
                </p>
              </div>
            </Link>
          );
        },
        size: 250,
        meta: { ignoreRowClick: true },
      },
      {
        accessorKey: "office",
        header: "Office Info",
        cell: ({ row }) => {
          const employee = row.original?.employee;
          const office = employee?.office;
          const officeShift = employee?.officeShift;
          const department = employee?.designation?.department;
          return (
            <div className="flex items-center gap-2">
              <div>
                <p className="font-semibold dark-title-color">{office?.name}</p>
                <div className="flex items-center gap-[2px]">
                  <SimpleTooltip text={"Office Shift"}>
                    <span className="text-xs">{office?.officeType?.name}</span>
                  </SimpleTooltip>
                  <i className="fa-solid fa-circle text-gray-500 text-[4px]"></i>
                  <SimpleTooltip
                    text={`Office Shift: ${helpers.dTime(
                      officeShift?.startTime,
                    )} to ${helpers.dTime(officeShift?.endTime)}`}
                  >
                    <span className="text-xs">{officeShift?.name}</span>
                  </SimpleTooltip>
                </div>
                <SimpleTooltip text={"Department"}>
                  <p className="text-xs text-gray-500">{department?.name}</p>
                </SimpleTooltip>
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "empLeaveType",
        header: "Leave Type",
        size: 150,
        cell: ({ row }) => {
          const type = row.original?.empLeaveType;
          return (
            <div>
              <p className="font-semibold dark-title-color">{type?.name}</p>
              {/* <p className="text-xs text-gray-500">
                {type?.isPaid ? "Paid" : "Unpaid"}
              </p> */}
            </div>
          );
        },
      },
      {
        header: "Duration",
        size: 220,
        cell: ({ row }) => (
          <LeaveDurationCell
            startDate={row.original?.startDate}
            endDate={row.original?.endDate}
          />
        ),
      },

      {
        accessorKey: "reason",
        header: "Reason",
        size: 200,
        cell: ({ row }) => {
          const reason = row.original?.reason;
          return (
            <button
              type="button"
              className="text-left text-sm"
              onClick={() => onViewDecision?.(row.original)}
            >
              {reason || "-"}
            </button>
          );
        },
      },
      {
        accessorKey: "approvalStatusId",
        header: "Status",
        size: 140,
        cell: ({ row }) => (
          <LeaveStatusCell
            row={row.original}
            status={getStatusInfo(row.original?.approvalStatusId)}
            onView={onViewDecision}
          />
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Applied On",
        size: 120,
        cell: ({ row }) => {
          const date = row.original?.createdAt;
          return <p className="text-[14px]">{helpers.dDate(date)}</p>;
        },
      },

      {
        accessorKey: "attachmentMedia",
        header: "Attachment",
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const attachment = row.original?.attachmentMedia;

          if (!attachment || !attachment.fileUrl) {
            return <span className="text-xs text-gray-400">No attachment</span>;
          }

          const isImage = attachment?.mimeType?.startsWith("image/");
          const isPdf = attachment?.mimeType === "application/pdf";

          return (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => window.open(attachment.fileUrl, "_blank")}
                className="text-blue-500 hover:text-blue-700 text-xs underline"
              >
                View Attachment
              </button>

              {/* Optional: show a small icon preview */}
              {isImage && (
                <img
                  src={attachment.fileUrl}
                  alt="attachment preview"
                  className="w-6 h-6 ml-2 object-cover rounded border"
                />
              )}
              {isPdf && (
                <i className="fa-regular fa-file-pdf text-red-600 ml-2 text-lg"></i>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "leaveBalance",
        header: () => <div className="w-full text-center">Leave Available</div>,
        size: 140,
        enableSorting: false,
        meta: { className: "text-center" },
        cell: ({ row }) => (
          <div className="flex w-full justify-center">
            <SimpleTooltip text="Leave available">
              <button
                type="button"
                onClick={() => onViewBalance?.(row.original)}
                className="btn-action text-violet-500 hover:text-violet-700"
              >
                <Eye size={16} />
              </button>
            </SimpleTooltip>
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "Action",
        size: 80,
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original;
          const status = item?.approvalStatus?.code;

          const isShowButton =
            status !== "leave_request_approval_approved" &&
            status !== "leave_request_approval_rejected";

          return (
            <div className="action flex gap-2">
              {isShowButton && (
                <>
                  {hasPermission("hr.leave_statistics_list_status_update") && (
                    <SimpleTooltip text="Approve">
                      <button
                        onClick={() => handleStatusChange(item)}
                        className="btn-action  text-cyan-500 hover:text-cyan-700 "
                      >
                        <FaCheck size={16} />
                      </button>
                    </SimpleTooltip>
                  )}

                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-action text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-action text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button> */}
                </>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleStatusChange, onViewBalance, onViewDecision],
  );
};
