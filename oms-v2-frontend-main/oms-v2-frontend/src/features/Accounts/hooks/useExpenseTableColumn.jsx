"use client";

import React, { useMemo } from "react";
import DownloadButton from "@/components/common/DownloadButton";
import EditButton from "@/components/common/EditButton";
import DeleteButton from "@/components/common/DeleteButton";
import ViewButton from "@/components/common/ViewButton";
import {
  
  
  
  
  
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Hash,
} from "lucide-react";

export const useExpenseTableColumn = ({
  selectedIds,
  handleSelectRow,
  handleSelectAll,
  expenses,
  handleEdit = () => {},
  handleDelete = () => {},
  handleView = () => {},
  handleDownloadVoucher = () => {},
  handleManageAttachments = () => {},
  canUpdate = true,
  canDelete = true,
  canView = true,
}) => {
  const formatAmount = (amount, currencyCode = "BDT") => {
    const symbol = currencyCode === "USD" ? "$" : "Tk";
    const num = Number(amount || 0);
    return `${symbol} ${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getBadgeClasses = (status) => {
    switch (String(status).toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80";
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80";
      case "cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer";
      case "mobile_payment":
        return "Mobile Payment";
      case "cash":
        return "Cash";
      case "card":
        return "Card Payment";
      case "cheque":
        return "Cheque";
      default:
        return method || "Other";
    }
  };

  return useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <div className="text-center">
            <input
              type="checkbox" className="rounded text-blue-600"
              checked={expenses.length > 0 && selectedIds.length === expenses.length}
              onChange={handleSelectAll}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <input
              type="checkbox" className="rounded text-blue-600"
              checked={selectedIds.includes(row.original.id)}
              onChange={() => handleSelectRow(row.original.id)}
            />
          </div>
        ),
        size: 40,
      },
      {
        accessorKey: "sl",
        header: "SL#",
        size: 50,
        cell: ({ row }) => (
          <div className="text-center font-mono text-gray-500 text-xs">
            {row.original.sl || row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Expense / Description",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <div className="font-bold text-gray-900 dark:text-white">
                {item.category || item.title || "Expense Record"}
              </div>
              <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <Hash className="w-3 h-3 opacity-60" />
                {item.expenseNumber || item.reference || `EXP-${item.id}`}
              </div>
              {item.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {item.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
            <Tag className="w-3 h-3 opacity-70" />
            {row.original.category || "General"}
          </span>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor / Payee",
        cell: ({ row }) => (
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {row.original.vendor || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-400">
            {formatPaymentMethod(row.original.paymentMethod)}
          </span>
        ),
      },
      {
        accessorKey: "expenseDate",
        header: "Date",
        cell: ({ row }) => {
          const dateString = row.original.expenseDate || row.original.expense_date || row.original.createdAt;
          let formattedDate = "N/A";
          if (dateString) {
            const d = new Date(dateString);
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, "0");
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const year = d.getFullYear();
              formattedDate = `${day}-${month}-${year}`;
            }
          }
          return (
            <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {formattedDate}
            </span>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
          const noteText = row.original.notes || "-";
          return (
            <div 
              className="text-gray-600 dark:text-gray-400 max-w-[150px] truncate" 
              title={noteText !== "-" ? noteText : undefined}
            >
              {noteText}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <div className="text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
            {formatAmount(row.original.amount, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const status = String(row.original.status || "paid").toLowerCase();
          return (
            <div className="text-center whitespace-nowrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getBadgeClasses(
                  status
                )}`}
              >
                {status === "paid" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : status === "pending" ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {status.toUpperCase()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        header: () => <div className="text-right">Actions</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <DownloadButton
                onClick={() => handleDownloadVoucher(item.id)}
                tooltip="Download Payment Voucher PDF"
              />


              {canView && (
                <ViewButton
                  onClick={() => handleView(item)}
                  tooltip="View Expense Details"
                />
              )}

              {canUpdate && (
                <EditButton
                  onClick={() => handleEdit(item)}
                  tooltip="Edit Expense"
                />
              )}

              {canDelete && (
                <DeleteButton
                  onClick={() => handleDelete(item.id ?? item._id ?? item)}
                  tooltip="Delete Expense"
                />
              )}
            </div>
          );
        },
      },
    ],
    [
      handleEdit,
      handleDelete,
      handleView,
      handleDownloadVoucher,
      canUpdate,
      canDelete,
      canView,
      selectedIds,
      handleSelectRow,
      handleSelectAll,
      expenses,
    ]
  );
};
