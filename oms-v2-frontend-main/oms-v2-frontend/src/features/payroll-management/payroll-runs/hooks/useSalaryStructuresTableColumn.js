// src/features/payroll/salary-structures/hooks/useSalaryStructuresTableColumn.js
import Avatar from "@/components/ui/Avatar";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { formatTime } from "@/utils/formatTime";
import helpers from "@/utils/helpers";
import { BadgeDollarSign, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export const useSalaryStructuresTableColumn = ({
  handleEdit,
  handleDelete,
  handleViewDetails,
  hasPermission,
}) => {
  return useMemo(
    () => [
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
        accessorKey: "payPeriodYear",
        header: "Year",
        cell: ({ row }) => {
          return (
            <div className="text-center">{row.original?.payPeriodYear}</div>
          );
        },
        size: 40,
      },
      {
        accessorKey: "payPeriodMonth",
        header: "Month",
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {/* number to month */}
              {helpers.monthNumberToName(row.original?.payPeriodMonth)}
            </div>
          );
        },
        size: 40,
      },
      {
        accessorKey: "payable",
        header: "Payable",
        cell: ({ row }) => {
          return <div className="text-center">{row.original?.payable}</div>;
        },
        size: 40,
      },
      {
        accessorKey: "paid",
        header: "Paid",
        cell: ({ row }) => {
          return <div className="text-center">{row.original?.paid}</div>;
        },
        size: 40,
      },
      {
        accessorKey: "due",
        header: "Due",
        cell: ({ row }) => {
          return <div className="text-center">{row.original?.due}</div>;
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
              <span
                className={`badge badge-rounded badge-outline-${paymentStatus?.colorName}`}
              >
                {paymentStatus?.name}
              </span>
              {paymentDate && (
                <div className="text-[12px] flex flex-row gap-1 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <SimpleTooltip text="Payment Status Date">
                    <span>{helpers.dDate(paymentDate)}</span>
                  </SimpleTooltip>
                </div>
              )}
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "remarks",
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
          return (
            <div className="flex items-center justify-center gap-2">
              {hasPermission(
                "payroll_management.employee_payroll_runs_view",
              ) && (
                <SimpleTooltip text="View Details">
                  <Link
                    href={`/payroll-management/payroll-runs/employee-salary-list/${item.id}`}
                    className="icon-btn icon-btn-outlined-primary icon-btn-sm"
                  >
                    <Eye size={16} />
                  </Link>
                </SimpleTooltip>
              )}
              {/* <SimpleTooltip text="Edit Payroll Run">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="icon-btn icon-btn-outlined-primary icon-btn-sm"
                >
                  <Eye size={16} />
                </button>
              </SimpleTooltip> */}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleViewDetails],
  );
};
