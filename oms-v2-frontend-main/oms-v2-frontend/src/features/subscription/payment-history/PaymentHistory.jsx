"use client";

import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import helpers from "@/utils/helpers";
import { useSubscriptionQueryApi } from "@/hooks/queryApi/useSubscriptionQueryApi";

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
};

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

const formatAmount = (invoice) => {
  const amount = valueOf(invoice, "totalAmount", "total_amount", "amount");
  if (amount === undefined || amount === null) return "-";
  return `${valueOf(invoice, "currency") || ""} ${Number(amount).toFixed(2)}`.trim();
};

const getInvoiceNumber = (invoice) =>
  valueOf(invoice, "invoiceNumber", "invoice_number", "number", "invoiceId") || "-";

const getPlanName = (invoice) => {
  const planName = valueOf(
    invoice,
    "plan.name",
    "subscriptionPlan.name",
    "subscriptionName",
    "subscription_name",
    "planName",
    "plan_name",
    "name",
  );

  if (planName) return planName;

  const nestedPlan = valueOf(invoice, "plan", "subscriptionPlan");
  return nestedPlan && typeof nestedPlan === "object" && nestedPlan.name ? nestedPlan.name : "-";
};

const getStatusClass = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();
  if (["paid", "success", "succeeded"].includes(normalizedStatus)) {
    return "text-green-600 dark:text-green-400";
  }
  if (["failed", "unpaid", "overdue"].includes(normalizedStatus)) {
    return "text-red-600 dark:text-red-400";
  }
  return "text-amber-600 dark:text-amber-400";
};

const PaymentHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(helpers.perPageListItems());
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [showFilter, setShowFilter] = useState(true);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      ...(search ? { search } : {}),
    }),
    [currentPage, itemsPerPage, search],
  );

  const { usePaymentHistoryQuery } = useSubscriptionQueryApi();
  const { data: responseData, isLoading } = usePaymentHistoryQuery(queryParams);
  const invoices = responseData?.data || [];
  const pagination = responseData?.pagination || {
    page: currentPage,
    total: 0,
    limit: itemsPerPage,
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
        cell: ({ row }) =>
          (pagination.page - 1) * pagination.limit + row.index + 1,
      },
      {
        accessorKey: "invoiceNumber",
        header: "Invoice",
        cell: ({ row }) => getInvoiceNumber(row.original),
      },
      {
        accessorKey: "subscription",
        header: "Subscription",
        cell: ({ row }) => getPlanName(row.original),
      },
      {
        accessorKey: "paidAt",
        header: "Paid At",
        cell: ({ row }) =>
          formatDate(row.original.paidAt || row.original.paid_at || row.original.createdAt),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatAmount(row.original),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.paymentStatus || row.original.payment_status || row.original.status;
          return <span className={getStatusClass(status)}>{status || "Pending"}</span>;
        },
      },
    ],
    [pagination],
  );

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hasActiveFilters = Boolean(search);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 my-5">
        <div>
          <h1 className="title-color font-bold text-lg">Payment History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review subscription payments and invoices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilter((value) => !value)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Search size={16} />
          Filter
        </button>
      </div>

      <DataFilter
        showFilter={showFilter}
        filters={{ search }}
        onFilterChange={(name, value) => {
          if (name === "search") {
            setSearch(value);
            setCurrentPage(1);
          }
        }}
        onClearFilters={() => {
          setSearch("");
          setCurrentPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        filterConfig={[
          {
            component: "input",
            name: "search",
            label: "Search",
            placeholder: "Search invoice number...",
          },
          { component: "clear" },
        ]}
      />

      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />
      <Pagination
        currentPage={currentPage}
        totalItems={pagination.total || 0}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
      />
    </section>
  );
};

export default PaymentHistory;