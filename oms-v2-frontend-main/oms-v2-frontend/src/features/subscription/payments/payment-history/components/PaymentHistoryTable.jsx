"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import DownloadButton from "@/components/common/DownloadButton";
import ViewButton from "@/components/common/ViewButton";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import CommonTable from "@/components/common/CommonTable";
import RestApi from "@/utils/RestApi";
import { toaster } from "@/utils/helpers";
import { generateReceiptPdf } from "@/utils/generateReceiptPdf";

const valueOf = (row, ...keys) => {
  for (const key of keys) {
    const value = key.includes(".")
      ? key.split(".").reduce((acc, part) => acc?.[part], row)
      : row?.[key];

    if (value !== undefined && value !== null && value !== "" && typeof value !== "object") {
      return value;
    }
  }

  return undefined;
};

const getPlanName = (row) => {
  const planName = valueOf(
    row,
    "plan.name",
    "subscriptionPlan.name",
    "subscription_name",
    "subscriptionName",
    "planName",
    "plan_name",
    "name",
  );

  if (planName) return planName;

  const nestedPlan = valueOf(row, "plan", "subscriptionPlan");
  return nestedPlan && typeof nestedPlan === "object" && nestedPlan.name ? nestedPlan.name : "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatAmount = (row) => {
  const amount = valueOf(row, "total_amount", "totalAmount", "amount");
  if (amount === undefined) return "-";
  return `${valueOf(row, "currency") || ""} ${Number(amount).toFixed(2)}`.trim();
};

const getPaymentStatus = (row) => {
  const paymentStatus = valueOf(
    row,
    "payment_status",
    "paymentStatus",
    "transaction_status",
    "transactionStatus",
  );
  if (paymentStatus) return paymentStatus;
  if (row.paid === true || valueOf(row, "paid_at", "paidAt")) return "paid";
  return "pending";
};

const statusClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (["paid", "success", "succeeded"].includes(normalized)) return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  if (["failed", "unpaid", "overdue"].includes(normalized)) return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
};

const getDownloadFilename = (contentDisposition, row) => {
  const filenameMatch = contentDisposition?.match(/filename\*?=(?:UTF-8''|"|)?([^";]+)/i);
  if (filenameMatch?.[1]) return decodeURIComponent(filenameMatch[1].trim());

  const invoiceNumber = valueOf(row, "invoiceNumber", "invoice_number");
  const invoiceId = valueOf(row, "invoiceId", "invoice_id", "id");
  return `invoice-${invoiceNumber || invoiceId}.pdf`;
};

const getDownloadErrorMessage = async (error) => {
  const responseData = error?.response?.data;
  if (responseData instanceof Blob) {
    const responseText = await responseData.text();
    try {
      return JSON.parse(responseText)?.message || responseText;
    } catch {
      return responseText;
    }
  }

  return error?.response?.data?.message || error?.message || "Unable to download invoice.";
};

const handleInvoiceDownload = async (row, setDownloadingInvoiceId) => {
  const rowId = row?.id || valueOf(row, "invoiceId", "invoice_id", "id");
  setDownloadingInvoiceId(rowId);

  try {
    const pdf = await generateReceiptPdf(row);
    const invoiceNum = valueOf(row, "invoiceNumber", "invoice_number") || rowId || "receipt";
    pdf.save(`receipt-${invoiceNum}.pdf`);
  } catch (error) {
    console.error("Invoice download error:", error);
    toaster("Unable to generate receipt PDF.", "error");
  } finally {
    setDownloadingInvoiceId(null);
  }
};

export default function PaymentHistoryTable({ data, isLoading, error, hasSearch }) {
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const safeData = Array.isArray(data) ? data : data ? [data] : [];

  const columns = useMemo(() => [
    { accessorKey: "invoice_number", header: "Invoice", cell: ({ row }) => valueOf(row.original, "invoice_number", "invoiceNumber", "number", "invoiceId") || "-" },
    { accessorKey: "subscription_name", header: "Plan", cell: ({ row }) => getPlanName(row.original) },
    { accessorKey: "total_amount", header: "Amount", cell: ({ row }) => formatAmount(row.original) },
    { accessorKey: "payment_status", header: "Payment Status", cell: ({ row }) => { const status = getPaymentStatus(row.original); return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(status)}`}>{status}</span>; } },
    { accessorKey: "activeFrom", header: "Active From", cell: ({ row }) => formatDate(valueOf(row.original, "activeFrom", "subscriptionStartDate", "active_from")) },
    { accessorKey: "activeTo", header: "Active To", cell: ({ row }) => formatDate(valueOf(row.original, "activeTo", "subscriptionEndDate", "active_to")) },
    { accessorKey: "paid_at", header: "Paid At", cell: ({ row }) => formatDate(valueOf(row.original, "paid_at", "paidAt")) },
    { accessorKey: "transaction_id", header: "Transaction ID", cell: ({ row }) => valueOf(row.original, "transactionId", "tranId", "stripe_payment_intent_id", "stripePaymentIntentId") || "-" },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const rowId = valueOf(
          row.original,
          "tranId",
          "transactionId",
          "invoiceId",
          "invoice_id",
          "id",
        );

        return (
          <div className="flex items-center justify-center gap-1.5">
            <ViewButton
              onClick={() => router.push(`/subscription/payments/payment-history/${encodeURIComponent(rowId)}`)}
              tooltip="View Payment Details"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
            />
            <DownloadButton
              onClick={() => handleInvoiceDownload(row.original, setDownloadingInvoiceId)}
              disabled={downloadingInvoiceId !== null}
              isDownloading={downloadingInvoiceId === Number(valueOf(row.original, "invoiceId", "invoice_id", "id"))}
              tooltip="Download Receipt"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-primaryColor hover:text-primaryColor dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            />
          </div>
        );
      },
    },
  ], [downloadingInvoiceId, router]);

  const table = useReactTable({ data: safeData, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel() });

  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">Unable to load payment history.</div>;

  return <div className="overflow-x-auto"><CommonTable table={table} isFetching={isLoading} itemsPerPage={Math.min(safeData.length || 5, 10)} columns={columns} hasActiveFilters={hasSearch} /></div>;
}