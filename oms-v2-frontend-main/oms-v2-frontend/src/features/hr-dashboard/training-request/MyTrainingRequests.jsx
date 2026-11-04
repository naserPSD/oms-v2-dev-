"use client";

import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import { formatNumber } from "@/utils/currencyFormat";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, X, Eye, Pencil } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AddTrainingRequestModal from "@/shared/navbar/modals/AddTrainingRequestModalInNavbar";
import SelectSearch from "@/components/ui/SelectSearch";
import { FaPlus } from "react-icons/fa6";

const MyTrainingRequests = () => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(
    Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1),
  );
  const [limit, setLimit] = useState(
    Math.max(1, Number.parseInt(searchParams.get("limit"), 10) || 10),
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [sorting, setSorting] = useState([]);
  const [isTrainingRequestOpen, setIsTrainingRequestOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isView, setIsView] = useState(false);

  const handleEdit = (data) => {
    setEditData(data);
    setIsView(false);
    setIsTrainingRequestOpen(true);
  };

  const handleView = (data) => {
    setEditData(data);
    setIsView(true);
    setIsTrainingRequestOpen(true);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const { useMyTrainingRequestsQuery } = useHrQueryApi();
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
  } = useMyTrainingRequestsQuery({
    page,
    limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusCode ? { statusCode } : {}),
  });

  const trainingRequests = useMemo(() => {
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.list)) return data.list;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [response?.data]);
  const totalRequests =
    response?.pagination?.total ??
    response?.data?.pagination?.total ??
    response?.data?.total ??
    trainingRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalRequests / limit));

  const columns = useMemo(
    () => [
      {
        id: "serial",
        header: "SL",
        size: 60,
        cell: ({ row }) => (page - 1) * limit + row.index + 1,
      },
      {
        accessorKey: "requisitionNo",
        header: "Request No.",
        size: 125,
        cell: ({ row }) => (
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            {row.original.requisitionNo || `TR-${row.original.id}`}
          </span>
        ),
        meta: { className: "whitespace-nowrap" },
      },
      {
        accessorKey: "itemDescription",
        header: "Training",
        size: 220,
        cell: ({ row }) => (
          <span
            className="block max-w-[220px] truncate font-medium text-gray-900 dark:text-gray-100"
            title={row.original.itemDescription || ""}
          >
            {row.original.itemDescription || "-"}
          </span>
        ),
      },
      {
        accessorKey: "trainingTypeName",
        header: "Type",
        size: 110,
        cell: ({ row }) =>
          row.original.trainingTypeName ||
          (typeof row.original.trainingType === "string"
            ? row.original.trainingType
            : "-"),
        meta: { className: "whitespace-nowrap" },
      },
      {
        accessorKey: "quantity",
        header: "Participants",
        size: 110,
        cell: ({ row }) => row.original.quantity ?? "-",
        meta: { className: "whitespace-nowrap" },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        size: 110,
        cell: ({ row }) => {
          const dur = row.original.course_duration || row.original.courseDuration || row.original.duration;
          return dur ? `${dur} ${dur > 1 ? 'days' : 'day'}` : "-";
        },
        meta: { className: "whitespace-nowrap" },
      },
      {
        id: "trainingDates",
        accessorFn: (row) => row.startDate || row.start_date || "",
        header: "Training Dates",
        size: 200,
        cell: ({ row }) => {
          const startDate = row.original.startDate || row.original.start_date;
          const endDate = row.original.endDate || row.original.end_date;
          return (
            <span className="whitespace-nowrap">
              {startDate ? helpers.dDateUtc(startDate) : "-"}
              {" – "}
              {endDate ? helpers.dDateUtc(endDate) : "-"}
            </span>
          );
        },
        meta: { className: "whitespace-nowrap" },
      },
      {
        accessorKey: "requisitionDate",
        header: "Request Date",
        size: 130,
        cell: ({ row }) =>
          row.original.requisitionDate
            ? helpers.dDateUtc(row.original.requisitionDate)
            : "-",
        meta: { className: "whitespace-nowrap" },
      },
      {
        accessorKey: "estimatedCost",
        header: "Estimated Cost",
        size: 140,
        cell: ({ row }) =>
          row.original.estimatedCost == null
            ? "-"
            : formatNumber(row.original.estimatedCost),
        meta: { className: "whitespace-nowrap" },
      },
      {
        id: "status",
        accessorFn: (row) => row.status?.name || "Pending",
        header: "Status",
        size: 120,
        cell: ({ row }) => (
          <span
            className={`badge badge-pill badge-outline-${
              row.original.status?.colorName || "secondary"
            }`}
          >
            {row.original.status?.name || "Pending"}
          </span>
        ),
        meta: { className: "whitespace-nowrap" },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        size: 100,
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status?.name || row.original.statusCode || "Pending";
          const isPending = status.toLowerCase() === "pending" || status === "requisition_status_pending";
          return (
            <div className="flex justify-end items-center gap-1">
              {isPending && (
                <button
                  onClick={() => handleEdit(row.original)}
                  className="text-amber-500 hover:text-amber-600 p-1.5 rounded transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/30"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
              )}
              <button
                onClick={() => handleView(row.original)}
                className="text-blue-600 hover:text-blue-800 p-1.5 rounded transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30"
                title="View"
              >
                <Eye size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [page, limit],
  );

  const table = useReactTable({
    data: trainingRequests,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <section className="my-6 space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Training
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            My Training Requests
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Review and search the training requests you have submitted.
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setIsView(false);
            setIsTrainingRequestOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors self-start sm:self-auto"
        >
          <FaPlus size={14} />
          Add Training Request
        </button>
      </header>


      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-end sm:p-5">
          <label className="block w-full sm:w-80">
            <span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">
              Search requests
            </span>
            <span className="relative block">
              <Search
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your training requests..."
                aria-label="Search training requests"
                className="h-[38px] w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              )}
            </span>
          </label>

          <label className="block w-full sm:w-56">
            <span className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">
              Filter by status
            </span>
            <SelectSearch
              className="!mb-0"
              options={[
                { value: "", label: "All statuses" },
                { value: "requisition_status_pending", label: "Pending" },
                { value: "requisition_status_approved", label: "Approved" },
                { value: "requisition_status_rejected", label: "Rejected" },
              ]}
              value={statusCode}
              onChange={(value) => {
                setStatusCode(value);
                setPage(1);
              }}
            />
          </label>
        </div>

        {isError ? (
          <div
            role="alert"
            className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            Unable to load your training requests
            {error?.message ? `: ${error.message}` : "."}
          </div>
        ) : (
          <CommonTable
            table={table}
            columns={columns}
            isFetching={isLoading || isFetching}
            itemsPerPage={limit}
            hasActiveFilters={Boolean(debouncedSearch || statusCode)}
          />
        )}

        {!isError && (
          <div className="px-4 pb-1 sm:px-5">
            <Pagination
              currentPage={page}
              totalItems={totalRequests}
              resultRows={trainingRequests.length}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              size="sm"
              variant="outline"
              circular={false}
            />
          </div>
        )}
      </div>

      <AddTrainingRequestModal
        showModal={isTrainingRequestOpen}
        handleClose={() => {
          setIsTrainingRequestOpen(false);
          setEditData(null);
          setIsView(false);
        }}
        setShowModal={setIsTrainingRequestOpen}
        editData={editData}
        isView={isView}
      />
    </section>
  );
};

export default MyTrainingRequests;
