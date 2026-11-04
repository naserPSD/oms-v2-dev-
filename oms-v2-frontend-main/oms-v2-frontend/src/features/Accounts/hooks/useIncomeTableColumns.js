import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tag, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import EditButton from "@/components/common/EditButton";
import DeleteButton from "@/components/common/DeleteButton";
import ViewButton from "@/components/common/ViewButton";

export const useIncomeTableColumns = ({
  selectedIds,
  handleSelectRow,
  handleSelectAll,
  incomes,
  canUpdate,
  canDelete,
  handleOpenEditModal,
  handleDeleteIncome,
  handleViewIncome,
  formatPaymentMethod,
  formatDateWithDay,
  formatAmount,
  getBadgeClasses,
  leadsOptions,
}) => {
  return useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <div className="text-center">
            <input
              type="checkbox"
              className="rounded text-blue-600"
              checked={incomes.length > 0 && selectedIds.length === incomes.length}
              onChange={handleSelectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <input
              type="checkbox"
              className="rounded text-blue-600"
              checked={selectedIds.includes(row.original.id)}
              onChange={() => handleSelectRow(row.original.id)}
            />
          </div>
        ),
        size: 40,
      },
      {
        id: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "incomeNumber",
        header: "Income # / Source",
        size: 200,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">
                {item.incomeNumber || `INC-${item.id}`}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {item.source}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 150,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">
              <Tag className="w-3 h-3 text-gray-400" />
              {item.category}
            </span>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 250,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="max-w-xs">
              <div className="text-gray-900 dark:text-gray-100 font-medium truncate">
                {item.description || "-"}
              </div>
              {item.reference && (
                <div className="text-[11px] text-gray-400 truncate mt-0.5">
                  Ref: {item.reference}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "customerId",
        header: "Lead",
        size: 150,
        cell: ({ row }) => {
          const item = row.original;
          if (!item.customerId) return <span className="text-gray-400">-</span>;
          const leadLabel = leadsOptions?.find(
            (l) => String(l.value) === String(item.customerId)
          )?.label || `#${item.customerId}`;
          
          return (
            <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              {leadLabel}
            </div>
          );
        },
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        size: 150,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              {formatPaymentMethod(item.paymentMethod)}
            </div>
          );
        },
      },
      {
        accessorKey: "incomeDate",
        header: "Date",
        size: 150,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
              {formatDateWithDay(item.incomeDate)}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right font-black text-gray-900 dark:text-white whitespace-nowrap">
              {formatAmount(item.amount, item.currency)}
            </div>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Note",
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row.original.notes || "-"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          const statusStr = String(item.status).toLowerCase();
          return (
            <div className="text-center whitespace-nowrap">
              <Badge
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getBadgeClasses(
                  item.status
                )}`}
              >
                {statusStr === "received" && (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {statusStr === "pending" && <Clock className="w-3 h-3" />}
                {statusStr === "cancelled" && (
                  <AlertCircle className="w-3 h-3" />
                )}
                {item.status}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
              {canUpdate && (
                <EditButton
                  onClick={() => handleOpenEditModal(item)}
                  tooltip="Edit Income"
                />
              )}
              {canDelete && (
                <DeleteButton
                  onClick={() => handleDeleteIncome(item.id)}
                  tooltip="Delete Income"
                />
              )}
              {handleViewIncome && (
                <ViewButton
                  onClick={() => handleViewIncome(item)}
                  tooltip="View Income"
                />
              )}
            </div>
          );
        },
      },
    ],
    [
      selectedIds,
      handleSelectRow,
      handleSelectAll,
      incomes,
      canUpdate,
      canDelete,
      handleOpenEditModal,
      handleDeleteIncome,
      handleViewIncome,
      formatPaymentMethod,
      formatDateWithDay,
      formatAmount,
      getBadgeClasses,
      leadsOptions,
    ]
  );
};
