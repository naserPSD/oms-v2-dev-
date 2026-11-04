"use client";

import DatePicker from "@/components/ui/DatePicker";
import { RotateCcw, Search, X } from "lucide-react";

export default function PaymentHistoryFilters({
  search,
  sort,
  invoiceNo,
  transactionId,
  paymentStatus,
  paymentDate,
  onSearch,
  onSort,
  onInvoiceNo,
  onTransactionId,
  onPaymentStatus,
  onPaymentDate,
  onClearAll,
  hasActiveFilters,
}) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search invoice or payment..."
            className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-9 pr-9 text-sm text-gray-900 outline-none focus:border-cyan-600 dark:border-gray-600 dark:text-gray-100"
            aria-label="Search payment history"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-cyan-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          aria-label="Sort payment history"
        >
          <option value="paidAt:desc">Newest first</option>
          <option value="paidAt:asc">Oldest first</option>
        </select>
      </div>

      {/* Specific filters: Payment Date, Invoice No, Transaction ID, Payment Status, Clear all filter */}
      <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex-1 min-w-[170px]">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Invoice No
          </label>
          <input
            value={invoiceNo}
            onChange={(event) => onInvoiceNo(event.target.value)}
            placeholder="Filter by invoice no..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-cyan-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex-1 min-w-[170px]">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Transaction ID
          </label>
          <input
            value={transactionId}
            onChange={(event) => onTransactionId(event.target.value)}
            placeholder="Filter by transaction id..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-cyan-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(event) => onPaymentStatus(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-cyan-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 capitalize"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="w-56 sm:w-64">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Payment Date (Range)
          </label>
          <DatePicker
            value={paymentDate}
            onChange={(val) => onPaymentDate(val)}
            mode="range"
            placeholder="Select Payment Date"
            compact={true}
            clearable={true}
          />
        </div>

        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
          className="inline-flex h-[38px] items-center gap-1.5 rounded-md border border-gray-300 px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear all filters</span>
        </button>
      </div>
    </div>
  );
}