// src/features/payroll/salary-structures/hooks/useSalaryListTableColumn.js
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { BadgeDollarSign, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { FaEraser } from "react-icons/fa";

export const useSalaryListTableColumn = ({
  handleEdit,
  handleDelete,
  handleViewDetails,
  showPenaltyDetails,
}) => {
  return useMemo(
    () => [
      {
        id: "select",
        enableSorting: false,
        accessorKey: "select",
        header: ({ table }) => {
          return (
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected() ? "indeterminate" : undefined}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="h-4 w-4"
            />
          )
        },
        cell: ({ row }) => {
          const paymentStatusCode = row.original?.paymentStatus?.code;

          const isDisabled = paymentStatusCode === "payment_status_paid";

          return (
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              className="h-4 w-4"
            />
          );
        },
        size: 20,
      },
      {
        accessorKey: "sl",
        header: "SL",
        size: 60,
        cell: ({ row }) => (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "userProfile",
        header: "Employee Details",
        accessorFn: (row) => row.employee?.user?.fullName,
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => {
          const user = row?.original?.employee?.user;
          const userProfile = row?.original?.employee?.user?.profile;
          const designation = row?.original?.employee?.designation;
          return (
            <Link
              href={`/hr-dashboard/employee/${row?.original?.employee?.id}`}
              className="flex items-center gap-2 cursor-pointer"
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
      },
      {
        accessorKey: "year",
        header: "Month/Year",
        accessorFn: (row) =>
          [row.month, row.year]
            .filter(Boolean) // Remove null/undefined values
            .join(' '), // Join remaining values with a space
        // --- END OF MODIFICATION ---
        enableGlobalFilter: true,
        filterFn: 'includesString',
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {helpers.monthNumberToName(row.original?.month)}/{row.original?.year}
            </div>
          );
        },
        size: 40,
      },
      {
        accessorKey: "basicSalary",
        header: "Basic Salary",
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {row.original?.basicSalary}
            </div>
          );
        },
        size: 40,
      },
      {
        accessorKey: "payable",
        header: "Payable",
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {row.original?.payable}
            </div>
          );
        },
        size: 40,
      },
      {
        accessorKey: "paid",
        header: "Paid",
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {row.original?.paid}
            </div>
          );
        },
        size: 40,
      },
      {
        accessorKey: "due",
        header: "Due",
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {row.original?.due}
            </div>
          );
        },
        size: 40,
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
          const paymentStatus = row.original?.paymentStatus;
          const paymentDate = row.original?.paymentDate;
          return (
            <div className="flex flex-col items-start gap-2">
              <span className={`badge badge-rounded badge-outline-${paymentStatus?.colorName}`}>{paymentStatus?.name}</span>
            </div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "remarks",
        enableSorting: false,
        header: "Remarks",
        cell: ({ row }) => {
          const remarks = row.original?.remarks;
          return (
            <div className="max-w-[200px]">
              <SimpleTooltip text={remarks || "No remarks"}>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                  {remarks || "-"}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        size: 100,
        cell: ({ row }) => {
          const item = row.original;
          const paymentStatusCode = row.original?.paymentStatus?.code;
          return (
            <div className="flex items-center justify-center gap-1">
              <SimpleTooltip text="View Details">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="icon-btn icon-btn-outlined-primary icon-btn-sm"
                >
                  <Eye size={16} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Penalty Details">
                <button
                  onClick={() => showPenaltyDetails(item)}
                  className="icon-btn icon-btn-outlined-warning icon-btn-sm"
                >
                  <FaEraser size={16} />
                </button>
              </SimpleTooltip>

              {/* <SimpleTooltip text="Edit Salary">
                <button
                  onClick={() => handleEdit(item)}
                  className="icon-btn icon-btn-outlined-info icon-btn-sm"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip> */}

              {paymentStatusCode !== "payment_status_paid" && paymentStatusCode !== "payment_status_partially_paid" && (
                <SimpleTooltip text="Delete Salary">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="icon-btn icon-btn-outlined-danger icon-btn-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleViewDetails, showPenaltyDetails]
  );
};
