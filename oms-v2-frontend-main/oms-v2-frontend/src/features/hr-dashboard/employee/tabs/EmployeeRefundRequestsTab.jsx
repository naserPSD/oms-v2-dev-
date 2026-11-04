// src/features/hr-dashboard/employee/tabs/EmployeeRefundRequestsTab.jsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Laptop,
  Check,
  X,
  FileText,
  FileDown,
} from "lucide-react";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";

import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers, { toaster } from "@/utils/helpers";
import { formatNumber } from "@/utils/currencyFormat";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { generateRefundPdf } from "@/utils/generateRefundPdf";
import DownloadButton from "@/components/common/DownloadButton";
import Avatar from "@/components/ui/Avatar";

export default function EmployeeRefundRequestsTab() {
  const {
    useAllAssetRefundRequestsQuery,
    useActionAssetRefundRequestMutation,
  } = useHrQueryApi({});

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof helpers.perPageListItems === "function") {
      return helpers.perPageListItems() || 10;
    }
    return helpers.perPageListItems || 10;
  });
  const [showFilter, setShowFilter] = useState("hide");
  const [viewItem, setViewItem] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filters.status && filters.status !== "all") {
      params.status = filters.status;
    }
    if (filters.search) {
      params.search = filters.search;
    }
    return params;
  }, [currentPage, itemsPerPage, filters]);

  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useAllAssetRefundRequestsQuery(queryParams);

  const actionMutation = useActionAssetRefundRequestMutation();

  const requestsList = useMemo(() => {
    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }
    if (Array.isArray(responseData?.data?.data)) {
      return responseData.data.data;
    }
    if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  }, [responseData]);

  const totalItems =
    responseData?.pagination?.total ??
    responseData?.data?.pagination?.total ??
    requestsList.length;

  // Real-time statistics across current fetched data
  const stats = useMemo(() => {
    const all = Array.isArray(requestsList) ? requestsList : [];
    const totalCount = totalItems;
    const pendingCount = all.filter((r) => r.status === "pending").length;
    const approvedCount = all.filter((r) => r.status === "approved").length;
    const rejectedCount = all.filter((r) => r.status === "rejected").length;
    return {
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }, [requestsList, totalItems]);

  const paginatedData = useMemo(() => {
    const list = Array.isArray(requestsList) ? requestsList : [];
    return list.map((item, idx) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + idx + 1,
    }));
  }, [requestsList, currentPage, itemsPerPage]);

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => (prev === "show" ? "hide" : "show"));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
    });
    setGlobalFilter("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((v) => v !== "" && v !== null);
  }, [filters]);

  const handleApprove = (item) => {
    Swal.fire({
      title: "Approve Refund Request?",
      text: `Are you sure you want to approve the refund for asset "${
        item.asset_model || item.asset_description || "Asset"
      }"? The asset will be marked as Withdrawn / Refunded.`,
      icon: "question",
      input: "text",
      inputPlaceholder: "Optional approval note / inspection remark...",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve Refund",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn bg-emerald-600 hover:bg-emerald-700",
        cancelButton: "swal-cancel-btn",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await actionMutation.mutateAsync({
            id: item.id,
            status: "approved",
            actionNote: result.value || "",
          });
          refetch();

          Swal.fire({
            title: "Refund Approved!",
            text: `Asset refund request has been approved. Would you like to download the official Refund Certificate (PDF) now?`,
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Download Certificate (PDF)",
            cancelButtonText: "Close",
            customClass: {
              popup: "swal-popup",
              confirmButton: "swal-confirm-btn bg-blue-600 hover:bg-blue-700",
              cancelButton: "swal-cancel-btn",
            },
          }).then((res) => {
            if (res.isConfirmed) {
              generateRefundPdf({
                ...item,
                status: "approved",
                action_date: new Date(),
                action_note: result.value || item.action_note || "",
              });
            }
          });
        } catch (e) {}
      }
    });
  };

  const handleReject = (item) => {
    Swal.fire({
      title: "Reject Refund Request?",
      text: `Please enter the reason for rejecting the refund request for asset "${
        item.asset_model || item.asset_description || "Asset"
      }".`,
      icon: "warning",
      input: "textarea",
      inputPlaceholder: "Enter reason for rejection...",
      inputValidator: (val) => {
        if (!val || !val.trim()) {
          return "Rejection reason is required";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Reject Request",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn bg-red-600 hover:bg-red-700",
        cancelButton: "swal-cancel-btn",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await actionMutation.mutateAsync({
            id: item.id,
            status: "rejected",
            actionNote: result.value,
          });
          refetch();
        } catch (e) {}
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "request_no",
        header: "Request No & Date",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <p className="text-xs font-semibold text-primary">
                {item.request_no || `REQ-${item.id}`}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {item.request_date
                  ? helpers.dDateUtc
                    ? helpers.dDateUtc(item.request_date)
                    : String(item.request_date).slice(0, 10)
                  : "-"}
              </p>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "employee",
        header: "Employee Details",
        cell: ({ row }) => {
          const item = row.original;
          const fullName = `${item.first_name || ""} ${
            item.last_name || ""
          }`.trim();

          const cellContent = (
            <>
              <Avatar
                text={helpers.avatarText(fullName)}
                value={fullName || "Employee"}
                alt={fullName || "Employee"}
                color="info"
                size="md"
              />
              <div className="ml-1 text-left">
                <p className="font-semibold dark-title-color text-xs group-hover:text-primary transition-colors">
                  {fullName || "Employee"}
                </p>
                {item.designation_name && (
                  <SimpleTooltip text="Designation">
                    <span className="badge badge-rounded badge-outline-secondary text-[10px] mt-0.5 inline-block">
                      {item.designation_name}
                    </span>
                  </SimpleTooltip>
                )}
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Code: {item.employee_code || "-"}
                </p>
                {item.email && (
                  <p className="text-[11px] text-gray-500 truncate max-w-[140px] mt-0.5">
                    {item.email}
                  </p>
                )}
              </div>
            </>
          );

          if (item.employee_id) {
            return (
              <Link
                href={`/hr-dashboard/employee/${item.employee_id}`}
                className="flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-opacity"
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
        size: 210,
      },
      {
        accessorKey: "asset",
        header: "Asset Details",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <p className="text-xs font-semibold dark-title-color line-clamp-1">
                {item.asset_description || item.asset_model || "Asset"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="badge badge-rounded badge-outline-secondary text-[10px]">
                  {item.asset_type_name || "Hardware"}
                </span>
                {item.asset_model && (
                  <span className="text-[11px] text-gray-500">
                    Model: {item.asset_model}
                  </span>
                )}
                {item.asset_serial && (
                  <span className="text-[11px] text-gray-400">
                    SN: {item.asset_serial}
                  </span>
                )}
              </div>
              {item.asset_amount > 0 && (
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                  Value: {formatNumber(item.asset_amount)} BDT
                </p>
              )}
            </div>
          );
        },
        size: 230,
      },
      {
        accessorKey: "reason",
        header: "Refund Reason",
        cell: ({ row }) => {
          const reason = row.original.reason;
          return (
            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
              {reason || "-"}
            </p>
          );
        },
        size: 160,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const st = row.original.status;
          if (st === "approved") {
            return (
              <span className="badge badge-pill badge-outline-success">
                Approved
              </span>
            );
          }
          if (st === "rejected") {
            return (
              <span className="badge badge-pill badge-outline-danger">
                Rejected
              </span>
            );
          }
          return (
            <span className="badge badge-pill badge-outline-warning">
              Pending
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "action_by",
        header: "Approved By",
        cell: ({ row }) => {
          const item = row.original;
          const approverName = `${item.approver_first_name || ""} ${
            item.approver_last_name || ""
          }`.trim();

          if (!approverName && item.status === "pending") {
            return (
              <span className="badge badge-pill badge-outline-secondary text-[10px]">
                Pending Review
              </span>
            );
          }

          if (!approverName) {
            return <span className="text-xs text-gray-400">-</span>;
          }

          const actionDateFormatted = item.action_date
            ? helpers.dDateUtc
              ? helpers.dDateUtc(item.action_date)
              : String(item.action_date).slice(0, 10)
            : null;

          const isApproved = item.status === "approved";

          const targetEmpId =
            item.approver_employee_id ||
            (item.action_by === 1021 ? 87 : item.action_by === 1020 ? 86 : item.action_by === 1011 ? 84 : null);

          const cellContent = (
            <>
              <Avatar
                text={helpers.avatarText(approverName)}
                value={approverName}
                alt={approverName}
                color={isApproved ? "success" : "danger"}
                size="md"
              />
              <div className="ml-1 text-left">
                <p className="font-semibold dark-title-color text-xs group-hover:text-primary transition-colors">
                  {approverName}
                </p>
                {item.approver_designation_name && (
                  <SimpleTooltip text="Designation">
                    <span className="badge badge-rounded badge-outline-secondary text-[10px] mt-0.5 inline-block">
                      {item.approver_designation_name}
                    </span>
                  </SimpleTooltip>
                )}
                {item.approver_email && (
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[140px]">
                    {item.approver_email}
                  </p>
                )}
                {actionDateFormatted && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isApproved ? "Approved: " : "Rejected: "}
                    {actionDateFormatted}
                  </p>
                )}
              </div>
            </>
          );

          if (targetEmpId) {
            return (
              <Link
                href={`/hr-dashboard/employee/${targetEmpId}`}
                className="flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-opacity"
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
        size: 220,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <SimpleTooltip text="View Details">
                <button
                  type="button"
                  onClick={() => setViewItem(item)}
                  className="btn-action text-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <Eye size={15} />
                </button>
              </SimpleTooltip>

              {item.status === "pending" && (
                <>
                  <SimpleTooltip text="Approve Refund">
                    <button
                      type="button"
                      disabled={actionMutation.isPending}
                      onClick={() => handleApprove(item)}
                      className="btn-action text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 p-1.5 rounded"
                    >
                      <Check size={16} className="stroke-[2.5]" />
                    </button>
                  </SimpleTooltip>

                  <SimpleTooltip text="Reject Request">
                    <button
                      type="button"
                      disabled={actionMutation.isPending}
                      onClick={() => handleReject(item)}
                      className="btn-action text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded"
                    >
                      <X size={16} className="stroke-[2.5]" />
                    </button>
                  </SimpleTooltip>
                </>
              )}

              {item.status === "approved" && (
                <DownloadButton
                  onClick={async () => {
                    setDownloadingId(item.id);
                    await generateRefundPdf(item);
                    setDownloadingId(null);
                  }}
                  isDownloading={downloadingId === item.id}
                  tooltip="Download Refund Certificate"
                />
              )}
            </div>
          );
        },
      },
    ],
    [actionMutation.isPending, downloadingId]
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Request No, Employee, Asset Model/Serial...",
      value: filters.search,
    },
    {
      component: "select",
      name: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
      placeholder: "Filter by Status",
      value: filters.status,
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Requests</p>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
              {stats.totalCount}
            </h3>
            <span className="text-[11px] text-gray-400">All submissions</span>
          </div>
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Pending Review</p>
            <h3 className="text-xl font-bold text-amber-600 mt-1">
              {stats.pendingCount}
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold">
              Action required
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Approved</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">
              {stats.approvedCount}
            </h3>
            <span className="text-[11px] text-gray-400">Assets returned</span>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Rejected</p>
            <h3 className="text-xl font-bold text-red-600 mt-1">
              {stats.rejectedCount}
            </h3>
            <span className="text-[11px] text-gray-400">Declined requests</span>
          </div>
          <div className="p-2.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
        <div>
          <h2 className="title-color font-bold text-lg">Asset Refund Requests</h2>
          <p className="text-xs text-gray-500">
            Review and take action on employee requests to return or refund allocated company assets.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
        </div>
      </div>

      {/* Filter Panel */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Table Section */}
      <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp size={14} />,
                          desc: <ChevronDown size={14} />,
                        }[header.column.getIsSorted()] ??
                          (header.column.getCanSort() ? (
                            <ArrowUpDown size={14} />
                          ) : null)}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  Loading refund requests...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Laptop className="w-10 h-10 text-gray-300" />
                    <p className="text-gray-500 font-medium text-sm">
                      No refund requests found
                    </p>
                    <p className="text-xs text-gray-400">
                      When employees submit refund requests for their allocated assets, they will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Details View Modal */}
      {viewItem && (
        <ModalTw
          show={!!viewItem}
          onClose={() => setViewItem(null)}
          title="Refund Request Details"
          size="md"
          showHeader={true}
          showFooter={false}
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Request No:</span>
              <span className="font-semibold text-primary">
                {viewItem.request_no}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Employee:</span>
              <span className="font-semibold">
                {`${viewItem.first_name || ""} ${viewItem.last_name || ""}`} (
                {viewItem.employee_code})
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Asset:</span>
              <span className="font-semibold">
                {viewItem.asset_description || viewItem.asset_model}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Model / Serial:</span>
              <span>
                {viewItem.asset_model || "-"} / {viewItem.asset_serial || "-"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Asset Value:</span>
              <span className="font-bold text-gray-800">
                {formatNumber(viewItem.asset_amount)} BDT
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Request Date:</span>
              <span>
                {viewItem.request_date
                  ? helpers.dDateUtc
                    ? helpers.dDateUtc(viewItem.request_date)
                    : String(viewItem.request_date).slice(0, 10)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Status:</span>
              <span
                className={`badge badge-pill ${
                  viewItem.status === "approved"
                    ? "badge-outline-success"
                    : viewItem.status === "rejected"
                    ? "badge-outline-danger"
                    : "badge-outline-warning"
                }`}
              >
                {viewItem.status?.toUpperCase()}
              </span>
            </div>
            {viewItem.status !== "pending" &&
              (viewItem.approver_first_name || viewItem.action_by) && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">
                    {viewItem.status === "approved"
                      ? "Approved By:"
                      : "Action By:"}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {`${viewItem.approver_first_name || ""} ${
                      viewItem.approver_last_name || ""
                    }`.trim() || "HR Admin"}
                    {viewItem.approver_designation_name
                      ? ` (${viewItem.approver_designation_name})`
                      : ""}
                  </span>
                </div>
              )}
            {viewItem.action_date && viewItem.status !== "pending" && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Action Date:</span>
                <span>
                  {helpers.dDateUtc
                    ? helpers.dDateUtc(viewItem.action_date)
                    : String(viewItem.action_date).slice(0, 10)}
                </span>
              </div>
            )}
            <div className="pt-1">
              <span className="text-gray-500 block mb-1">
                Reason from Employee:
              </span>
              <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
                {viewItem.reason || "No reason specified."}
              </p>
            </div>
            {viewItem.action_note && (
              <div className="pt-1">
                <span className="text-gray-500 block mb-1">
                  Admin Action Note:
                </span>
                <p className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-amber-800 dark:text-amber-200">
                  {viewItem.action_note}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-3 border-t">
              {viewItem.status === "pending" && (
                <>
                  <ButtonTw
                    type="button"
                    variant="green"
                    onClick={() => {
                      setViewItem(null);
                      handleApprove(viewItem);
                    }}
                  >
                    Approve
                  </ButtonTw>
                  <ButtonTw
                    type="button"
                    variant="red"
                    onClick={() => {
                      setViewItem(null);
                      handleReject(viewItem);
                    }}
                  >
                    Reject
                  </ButtonTw>
                </>
              )}
              {viewItem.status === "approved" && (
                <ButtonTw
                  type="button"
                  variant="primary"
                  onClick={() => generateRefundPdf(viewItem)}
                  className="flex items-center gap-1.5"
                >
                  <FileDown size={14} />
                  Download Certificate (PDF)
                </ButtonTw>
              )}
              <ButtonTw
                type="button"
                variant="outline.gray"
                onClick={() => setViewItem(null)}
              >
                Close
              </ButtonTw>
            </div>
          </div>
        </ModalTw>
      )}
    </div>
  );
}
