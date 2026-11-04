import { useMemo } from "react";
import helpers from "@/utils/helpers";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import Avatar from "@/components/ui/Avatar";
import { formatNumber } from "@/utils/currencyFormat";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
export const usePendingRequestionTableColumn = ({
  handleStatusChange,
  hasPermission,
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
        header: "Employee Details",
        accessorFn: (row) =>
          [
            row.employee?.user?.fullName,
            row.employee?.employeeCode,
            row.employee?.user?.email,
          ]
            .filter(Boolean) // Remove null/undefined values
            .join(" "),
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const employee = row.original?.employee;
          const user = employee?.user;

          return (
            <Link
              href={`/hr-dashboard/employee/${row.original?.employee?.id}`}
              className="flex items-center gap-2"
            >
              <div className="relative size-10 rounded-full overflow-hidden border dark:border-slate-50 border-slate-200 cursor-pointer">
                {user?.profile?.profilePicture?.fileUrl ? (
                  <Image
                    src={user?.profile?.profilePicture?.fileUrl}
                    alt={user.name || "User Avatar"}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <Avatar
                    text={helpers.avatarText(user?.fullName)}
                    color="info"
                    size="lg"
                  />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold dark-title-color">
                  {user?.fullName}
                </p>

                <SimpleTooltip text={"Designation"}>
                  {employee?.designation?.name && (
                    <span className="badge badge-rounded badge-outline-secondary">
                      {employee?.designation?.name}
                    </span>
                  )}
                </SimpleTooltip>
                <p className="text-xs text-gray-500 mt-0.5">
                  <SimpleTooltip text="User ID">
                    User ID: {employee?.employeeCode}
                  </SimpleTooltip>
                </p>
                <p className="text-xs text-gray-500">
                  <SimpleTooltip text="User Email">
                    {employee?.user?.email}
                  </SimpleTooltip>
                </p>
              </div>
            </Link>
          );
        },
        size: 350,
      },
      {
        accessorKey: "office",
        header: "Office Info",
        cell: ({ row }) => {
          const office = row.original?.employee?.office;
          const officeShift = row.original?.employee?.officeShift;
          const department = row.original?.department;
          return (
            <div>
              <SimpleTooltip text={"Office Name"}>
                <p className="font-semibold dark-title-color text-left">
                  {office?.name}
                </p>
              </SimpleTooltip>
              <div className=" gap-2 flex items-center  text-left">
                <div className="flex items-center gap-[3px]">
                  <SimpleTooltip text={"Office Shift"}>
                    <span className="text-xs text-left text-nowrap">
                      {office?.officeType?.name}
                    </span>
                  </SimpleTooltip>
                  <i className="fa-solid fa-circle text-gray-500 text-[4px]"></i>
                  <SimpleTooltip
                    text={`Office Shift: ${helpers.dTime(
                      officeShift?.startTime,
                    )} to ${helpers.dTime(officeShift?.endTime)}`}
                  >
                    <span className="text-xs text-left text-nowrap">
                      {officeShift?.name}
                    </span>
                  </SimpleTooltip>
                </div>
              </div>
              <SimpleTooltip text={"Department"}>
                <p className="text-xs text-gray-500 text-left">
                  {department?.name}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 240,
      },
      {
        accessorKey: "requisitionNo",
        header: "Requisition No",
        cell: ({ row }) => (
          <span className="text-xs font-semibold">
            {row.original?.requisitionNo}
          </span>
        ),
        size: 300,
      },
      {
        accessorKey: "itemDescription",
        header: "Item Description",
        cell: ({ row }) => (
          <span className="text-xs dark-title-color font-semibold">
            {row.original?.itemDescription || "-"}
          </span>
        ),
        size: 200,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <span className="text-xs">{row.original?.quantity}</span>
        ),
        size: 80,
      },
      {
        accessorKey: "estimatedCost",
        header: "Est. Cost",
        cell: ({ row }) => (
          <span className="text-sm dark-title-color">
            {formatNumber(row.original?.estimatedCost)}
          </span>
        ),
        size: 140,
      },
      {
        accessorKey: "requisitionDate",
        header: "Requisition Date",
        cell: ({ row }) => (
          <span className="text-xs">
            {helpers.dDateUtc(row.original?.requisitionDate)}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Requisition Status",
        cell: ({ row }) => {
          const status = row.original?.status;
          return (
            <div className="text-center">
              <span
                className={`badge badge-pill badge-outline-${
                  status?.colorName || "secondary"
                }`}
              >
                {status?.name}
              </span>
            </div>
          );
        },
        size: 50,
      },
      // {
      //   accessorKey: "approvedDate",
      //   header: "Approved Date",
      //   cell: ({ row }) => (
      //     <span className="text-xs">
      //       {row.original?.approvedDate
      //         ? helpers.dDateUtc(row.original?.approvedDate)
      //         : "-"}
      //     </span>
      //   ),
      //   size: 120,
      // },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <p className="text-xs text-gray-500 ">
            {row.original?.remarks || "-"}
          </p>
        ),
        size: 200,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const requisition = row.original;
          return (
            <div className="gap-1 flex">
              {hasPermission("hr.pending_requisition_list_edit_status") && (
                <SimpleTooltip text="Approve">
                  <button
                    onClick={() => handleStatusChange(requisition)}
                    className="btn-action  text-cyan-500 hover:text-cyan-700 "
                  >
                    <FaCheck size={16} />
                  </button>
                </SimpleTooltip>
              )}
              {/* <SimpleTooltip text="Edit">
                <button
                  onClick={() => handleEdit(requisition)}
                  className="btn-action  text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip> */}
              {/* <SimpleTooltip text="Delete">
                <button
                  onClick={() => handleDelete(requisition.id)}
                  className="btn-action  text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </SimpleTooltip> */}
            </div>
          );
        },
      },
    ],
    [handleStatusChange],
  );
};
