import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

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

export const useMyLeaveRequestTableColumns = ({ handleEdit, handleDelete }) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => row.index + 1,
      },
      // {
      //   accessorKey: "userProfile",
      //   header: "Employee Details",
      //   cell: ({ row }) => {
      //     const user = row?.original?.employee?.user;
      //     const userProfile = row?.original?.employee?.user?.profile;
      //     const designation = row?.original?.employee?.designation;
      //     return (
      //       <div className="flex items-center gap-2">
      //         {userProfile?.profilePicture?.fileUrl ? (
      //           <img
      //             src={userProfile?.profilePicture?.fileUrl}
      //             alt={user?.fullName}
      //             className="w-8 h-8 rounded-full object-cover"
      //           />
      //         ) : (
      //           <Avatar
      //             text={helpers.avatarText(user?.fullName)}
      //             color="info"
      //             size="md"
      //             // className="bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-100"
      //           />
      //         )}

      //         <div>
      //           <p className="font-semibold dark-title-color">
      //             {user?.fullName}
      //           </p>
      //           <SimpleTooltip text={"Designation"}>
      //             {designation?.name && (
      //               <span className="badge badge-rounded badge-outline-secondary">
      //                 {designation?.name}
      //               </span>
      //             )}
      //           </SimpleTooltip>
      //           <p className="text-xs text-gray-500">{user?.email}</p>
      //           <p className="text-xs text-gray-500">
      //             {userProfile?.phoneWithCallingCode}
      //           </p>
      //         </div>
      //       </div>
      //     );
      //   },
      //   size: 250,
      // },

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
                      officeShift?.startTime
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
              <p className="text-xs text-gray-500">
                {type?.isPaid ? "Paid" : "Unpaid"}
              </p>
            </div>
          );
        },
      },
      {
        header: "Start Date - End Date",
        size: 200,
        cell: ({ row }) => {
          const startDate = row.original?.startDate;
          const endDate = row.original?.endDate;
          return (
            <div className="flex items-center gap-2">
              <p className="text-xs">{helpers.dDate(startDate)}</p>
              <span className="text-xs"> - </span>
              <p className="text-xs">{helpers.dDate(endDate)}</p>
            </div>
          );
        },
      },

      {
        accessorKey: "reason",
        header: "Reason",
        size: 200,
        cell: ({ row }) => {
          const reason = row.original?.reason;
          return <p className="text-sm">{reason || "-"}</p>;
        },
      },
      {
        accessorKey: "approvalStatusId",
        header: "Status",
        size: 100,
        cell: ({ row }) => {
          const statusId = row.original?.approvalStatusId;
          const status = getStatusInfo(statusId);
          return (
            <div className="text-center">
              <span
                className={`badge badge-pill badge-outline-${status.color}`}
              >
                {status.name}
              </span>
            </div>
          );
        },
      },

      {
        accessorKey: "createdAt",
        header: "Applied On",
        size: 120,
        cell: ({ row }) => {
          const date = row.original?.createdAt;
          return <p className="text-xs">{helpers.dDate(date)}</p>;
        },
      },
      {
        accessorKey: "approvalDate",
        header: "Approval Date",
        size: 120,
        cell: ({ row }) => {
          const date = row.original?.approvalDate;
          return <p className="text-xs">{helpers.dDate(date) || "-"}</p>;
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
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-action text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-action text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete]
  );
};
