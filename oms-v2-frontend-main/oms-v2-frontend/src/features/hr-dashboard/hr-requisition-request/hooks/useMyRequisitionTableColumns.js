import { useMemo } from "react";
import Link from "next/link";
import helpers from "@/utils/helpers";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import Avatar from "@/components/ui/Avatar";
import { Pencil, Trash2 } from "lucide-react";
import { formatNumber } from "@/utils/currencyFormat";
import { FaCheck } from "react-icons/fa";

export const useMyRequisitionTableColumns = ({
  handleStatusChange,
  handleEdit,
  handleDelete,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
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
        size: 90,
      },
      {
        accessorKey: "approvedBy",
        header: "Approved By",
        cell: ({ row }) => {
          const approver = row.original?.approvedByUser;
          const approverName = approver
            ? `${approver.firstName || ""} ${approver.lastName || ""}`.trim()
            : row.original?.approvedBy
            ? `Admin (${row.original.approvedBy})`
            : null;

          const isPending =
            row.original?.status?.code === "requisition_status_pending" ||
            !approverName;

          if (isPending) {
            return (
              <span className="badge badge-pill badge-outline-secondary text-[10px]">
                Pending Review
              </span>
            );
          }

          const isApproved =
            row.original?.status?.code === "requisition_status_approved" ||
            row.original?.statusId === 139;

          const approverEmpId = row.original?.approverEmployee?.id;
          const approverDesigName = row.original?.approverDesignation?.name;
          const approverEmail = approver?.email;

          const targetEmpId =
            approverEmpId ||
            (approver?.id === 1021 ? 87 : approver?.id === 1020 ? 86 : approver?.id === 1011 ? 84 : null);

          const cellContent = (
            <>
              <Avatar
                text={helpers.avatarText(approverName)}
                value={approverName}
                alt={approverName}
                color="info"
                size="md"
              />
              <div className="ml-1 text-left">
                <p className="font-semibold dark-title-color">
                  {approverName}
                </p>
                {approverDesigName && (
                  <SimpleTooltip text="Designation">
                    <span className="badge badge-rounded badge-outline-secondary">
                      {approverDesigName}
                    </span>
                  </SimpleTooltip>
                )}
                {approverEmail && (
                  <p className="text-xs text-gray-500">{approverEmail}</p>
                )}
                {row.original?.approvedDate && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {helpers.dDateUtc(row.original.approvedDate)}
                  </p>
                )}
              </div>
            </>
          );

          if (targetEmpId) {
            return (
              <Link
                href={`/hr-dashboard/employee/${targetEmpId}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                {cellContent}
              </Link>
            );
          }

          return (
            <div className="flex items-center gap-2">
              {cellContent}
            </div>
          );
        },
        size: 280,
      },
      {
        accessorKey: "approvedDate",
        header: "Approved Date",
        cell: ({ row }) => (
          <span className="text-xs">
            {row.original?.approvedDate
              ? helpers.dDateUtc(row.original?.approvedDate)
              : "-"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <p className="text-xs text-gray-500">
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
              <SimpleTooltip text="Approve">
                <button
                  onClick={() => handleStatusChange(requisition)}
                  className="btn-action text-cyan-500 hover:text-cyan-700"
                >
                  <FaCheck size={16} />
                </button>
              </SimpleTooltip>
              <SimpleTooltip text="Edit">
                <button
                  onClick={() => handleEdit(requisition)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip>
              <SimpleTooltip text="Delete">
                <button
                  onClick={() => handleDelete(requisition)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleStatusChange]
  );
};
