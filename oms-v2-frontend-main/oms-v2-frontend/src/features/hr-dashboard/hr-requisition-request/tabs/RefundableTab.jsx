// src/features/hr-dashboard/hr-requisition-request/tabs/RefundableTab.jsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  RotateCcw,
  Laptop,
  CheckCircle2,
  Receipt,
  Clock,
  Send,
  FileDown,
} from "lucide-react";
import { FaFilter } from "react-icons/fa";

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
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

export default function RefundableTab() {
  const {
    useFetchMyAssetsQuery,
    useMyAssetRefundRequestsQuery,
    useCreateAssetRefundRequestMutation,
  } = useHrQueryApi({});

  const { data: myAssetsResponse, isLoading: isAssetsLoading } =
    useFetchMyAssetsQuery();
  const { data: myRefundRequestsResponse, isLoading: isRequestsLoading } =
    useMyAssetRefundRequestsQuery();
  const createRefundMutation = useCreateAssetRefundRequestMutation();

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

  // Refund request modal states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [refundReason, setRefundReason] = useState("");
  const [refundRequestDate, setRefundRequestDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [filters, setFilters] = useState({
    search: "",
    assetTypeId: "",
    startDate: "",
    endDate: "",
  });

  const toSafeIsoDate = (val) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val).slice(0, 10);
      return d.toISOString().slice(0, 10);
    } catch {
      return String(val || "").slice(0, 10);
    }
  };

  // Live list of submitted refund requests for the logged-in employee
  const myRefundRequests = useMemo(() => {
    if (Array.isArray(myRefundRequestsResponse?.data?.data)) {
      return myRefundRequestsResponse.data.data;
    }
    if (Array.isArray(myRefundRequestsResponse?.data)) {
      return myRefundRequestsResponse.data;
    }
    if (Array.isArray(myRefundRequestsResponse)) {
      return myRefundRequestsResponse;
    }
    return [];
  }, [myRefundRequestsResponse]);

  // Extract ONLY refundable assets from live API data and enrich with refund request status
  const refundableAssets = useMemo(() => {
    const rawList = Array.isArray(myAssetsResponse?.data?.data)
      ? myAssetsResponse.data.data
      : Array.isArray(myAssetsResponse?.data)
      ? myAssetsResponse.data
      : Array.isArray(myAssetsResponse)
      ? myAssetsResponse
      : [];

    const mappedList = rawList
      .filter((item) => {
        return (
          item.isRefundable === true ||
          item.refundable === true ||
          item.isRefundable === 1 ||
          item.refundable === 1 ||
          item.isRefundable === "true" ||
          item.refundable === "true" ||
          item.isRefundable === "1" ||
          item.refundable === "1"
        );
      })
      .map((asset) => {
        const typeName = asset.assetType?.name || "Asset";
        const statusName = asset.assetStatus?.name || "Allocated";
        const colorName = asset.assetStatus?.colorName || "info";

        // Prioritize approved refund request if exists
        const approvedReq = myRefundRequests.find(
          (r) =>
            Number(r.asset_id ?? r.assetId) === Number(asset.id) &&
            r.status === "approved"
        );
        const existingReq =
          approvedReq ||
          myRefundRequests.find(
            (r) => Number(r.asset_id ?? r.assetId) === Number(asset.id)
          );

        const isWithdrawnOrApproved =
          existingReq?.status === "approved" ||
          asset.assetStatusId === 144 ||
          asset.asset_status_id === 144 ||
          statusName?.toLowerCase() === "withdrawn";

        const resolvedStatus = existingReq
          ? existingReq.status
          : isWithdrawnOrApproved
          ? "approved"
          : null;

        return {
          id: asset.id,
          assetCode: asset.serial
            ? `ASSET-${asset.serial}`
            : `AST-${String(asset.id).padStart(4, "0")}`,
          itemDescription: asset.description || asset.model || typeName,
          assetTypeId: asset.assetTypeId ? String(asset.assetTypeId) : "",
          assetTypeName: typeName,
          model: asset.model || "-",
          serial: asset.serial || "-",
          amount: Number(asset.amount) || 0,
          currency: asset.currency || "BDT",
          allocationDate: toSafeIsoDate(asset.allocationDate || asset.createdAt),
          statusName: isWithdrawnOrApproved ? "Withdrawn" : statusName,
          statusColorName: isWithdrawnOrApproved ? "danger" : colorName,
          isRefundable: true,
          remarks: asset.remarks || "-",
          rawAsset: asset,
          refundRequest: existingReq || null,
          refundStatus: resolvedStatus,
        };
      });

    // Also include any approved refund requests that might not be in myAssetsResponse
    const mappedAssetIds = new Set(mappedList.map((a) => Number(a.id)));
    myRefundRequests
      .filter(
        (r) =>
          r.status === "approved" &&
          !mappedAssetIds.has(Number(r.asset_id ?? r.assetId))
      )
      .forEach((r) => {
        mappedList.push({
          id: r.asset_id || r.assetId || r.id,
          assetCode: (r.asset_serial || r.assetSerial)
            ? `ASSET-${r.asset_serial || r.assetSerial}`
            : `REF-${r.request_no || r.requestNo}`,
          itemDescription:
            r.asset_description ||
            r.assetDescription ||
            r.asset_model ||
            r.assetModel ||
            "Hardware Asset",
          assetTypeId: "",
          assetTypeName:
            r.asset_type_name || r.assetTypeName || "Hardware",
          model: r.asset_model || r.assetModel || "-",
          serial: r.asset_serial || r.assetSerial || "-",
          amount: Number(r.asset_amount ?? r.assetAmount) || 0,
          currency: "BDT",
          allocationDate: toSafeIsoDate(
            r.asset_allocation_date ||
              r.assetAllocationDate ||
              r.request_date ||
              r.requestDate
          ),
          statusName: "Withdrawn",
          statusColorName: "danger",
          isRefundable: true,
          remarks: r.reason || "-",
          rawAsset: null,
          refundRequest: r,
          refundStatus: "approved",
        });
      });

    return mappedList;
  }, [myAssetsResponse, myRefundRequests]);

  // Dynamic asset types filter options based on real data
  const assetTypeOptions = useMemo(() => {
    const map = new Map();
    refundableAssets.forEach((item) => {
      if (item.assetTypeId && !map.has(item.assetTypeId)) {
        map.set(item.assetTypeId, {
          value: item.assetTypeId,
          label: item.assetTypeName,
        });
      }
    });
    return Array.from(map.values());
  }, [refundableAssets]);

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
      assetTypeId: "",
      startDate: "",
      endDate: "",
    });
    setGlobalFilter("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (v) => v !== "" && v !== null && v !== undefined
    );
  }, [filters]);

  // Real-time Statistics from API data
  const stats = useMemo(() => {
    const totalCount = refundableAssets.length;
    const totalAmount = refundableAssets.reduce(
      (acc, curr) => acc + (Number(curr.amount) || 0),
      0
    );
    const pendingRefunds = refundableAssets.filter(
      (a) => a.refundStatus === "pending"
    ).length;
    const approvedRefunds = refundableAssets.filter(
      (a) => a.refundStatus === "approved"
    ).length;

    return {
      totalCount,
      totalAmount,
      pendingRefunds,
      approvedRefunds,
    };
  }, [refundableAssets]);

  // Filtered Data based on user inputs
  const filteredData = useMemo(() => {
    return refundableAssets.filter((item) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesCode = item.assetCode?.toLowerCase().includes(query);
        const matchesDesc = item.itemDescription?.toLowerCase().includes(query);
        const matchesModel = item.model?.toLowerCase().includes(query);
        const matchesSerial = item.serial?.toLowerCase().includes(query);
        const matchesType = item.assetTypeName?.toLowerCase().includes(query);
        const matchesRemarks = item.remarks?.toLowerCase().includes(query);
        if (
          !matchesCode &&
          !matchesDesc &&
          !matchesModel &&
          !matchesSerial &&
          !matchesType &&
          !matchesRemarks
        ) {
          return false;
        }
      }
      if (filters.assetTypeId && item.assetTypeId !== filters.assetTypeId) {
        return false;
      }
      if (filters.startDate && item.allocationDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && item.allocationDate > filters.endDate) {
        return false;
      }
      return true;
    });
  }, [refundableAssets, filters]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage).map((item, idx) => ({
      ...item,
      sl: start + idx + 1,
    }));
  }, [filteredData, currentPage, itemsPerPage]);

  // Modal handlers
  const handleOpenRefundModal = (preselectedId = null) => {
    if (preselectedId) {
      setSelectedAssetIds([preselectedId]);
    } else {
      setSelectedAssetIds([]);
    }
    setRefundReason("");
    setRefundRequestDate(new Date().toISOString().slice(0, 10));
    setShowRefundModal(true);
  };

  const handleToggleSelectAsset = (assetId) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAllEligible = () => {
    const eligibleIds = refundableAssets
      .filter((a) => a.refundStatus !== "pending" && a.refundStatus !== "approved")
      .map((a) => a.id);

    if (selectedAssetIds.length === eligibleIds.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(eligibleIds);
    }
  };

  const handleSubmitRefundRequest = async (e) => {
    e.preventDefault();
    if (selectedAssetIds.length === 0) {
      toaster("Please select at least one asset to refund.", "warning");
      return;
    }

    try {
      await createRefundMutation.mutateAsync({
        assetIds: selectedAssetIds,
        reason: refundReason,
        requestDate: refundRequestDate,
      });
      setShowRefundModal(false);
      setSelectedAssetIds([]);
      setRefundReason("");
    } catch {
      // Handled by RestApi / query
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "assetCode",
        header: "Asset Code",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-primary">
            {row.original.assetCode}
          </span>
        ),
        size: 150,
      },
      {
        accessorKey: "itemDescription",
        header: "Asset Details",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <p className="text-xs font-semibold dark-title-color line-clamp-1">
                {item.itemDescription}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="badge badge-rounded badge-outline-secondary text-[10px]">
                  {item.assetTypeName}
                </span>
                {item.model && item.model !== "-" && (
                  <span className="text-[11px] text-gray-500">
                    Model: {item.model}
                  </span>
                )}
                {item.serial && item.serial !== "-" && (
                  <span className="text-[11px] text-gray-400">
                    SN: {item.serial}
                  </span>
                )}
              </div>
            </div>
          );
        },
        size: 260,
      },
      {
        accessorKey: "amount",
        header: "Value",
        cell: ({ row }) => (
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {formatNumber(row.original.amount)} {row.original.currency}
          </span>
        ),
        size: 130,
      },
      {
        accessorKey: "allocationDate",
        header: "Allocation Date",
        cell: ({ row }) => {
          const val = row.original.allocationDate;
          if (!val) return <span className="text-xs">-</span>;
          try {
            return (
              <span className="text-xs">
                {helpers.dDateUtc ? helpers.dDateUtc(val) : String(val)}
              </span>
            );
          } catch {
            return <span className="text-xs">{String(val)}</span>;
          }
        },
        size: 130,
      },
      {
        accessorKey: "refundStatus",
        header: "Refund Status",
        cell: ({ row }) => {
          const item = row.original;
          if (item.refundStatus === "pending") {
            return (
              <span className="badge badge-pill badge-outline-warning">
                Pending Approval
              </span>
            );
          }
          if (item.refundStatus === "approved") {
            return (
              <span className="badge badge-pill badge-outline-success">
                Refund Approved
              </span>
            );
          }
          if (item.refundStatus === "rejected") {
            return (
              <span className="badge badge-pill badge-outline-danger">
                Refund Rejected
              </span>
            );
          }
          return (
            <span className="badge badge-pill badge-outline-info">
              Eligible
            </span>
          );
        },
        size: 130,
      },
      {
        accessorKey: "approvedBy",
        header: "Approved By",
        cell: ({ row }) => {
          const item = row.original;
          const req = item.refundRequest;
          const approverName = req
            ? `${
                req.approver_first_name ||
                req.approverFirstName ||
                ""
              } ${
                req.approver_last_name ||
                req.approverLastName ||
                ""
              }`.trim()
            : null;

          if (item.refundStatus === "pending") {
            return (
              <span className="badge badge-pill badge-outline-secondary text-[10px]">
                Pending Review
              </span>
            );
          }

          if (
            !item.refundStatus ||
            (!approverName &&
              item.refundStatus !== "approved" &&
              item.refundStatus !== "rejected")
          ) {
            return <span className="text-xs text-gray-400">-</span>;
          }

          const displayName = approverName || "HR Admin";
          const isApproved = item.refundStatus === "approved";

          const actionDateFormatted = req?.action_date
            ? helpers.dDateUtc
              ? helpers.dDateUtc(req.action_date)
              : String(req.action_date).slice(0, 10)
            : req?.actionDate
            ? helpers.dDateUtc
              ? helpers.dDateUtc(req.actionDate)
              : String(req.actionDate).slice(0, 10)
            : null;

          const targetEmpId =
            req?.approver_employee_id ||
            req?.approverEmployeeId ||
            (req?.action_by === 1021 ? 87 : req?.action_by === 1020 ? 86 : req?.action_by === 1011 ? 84 : null);

          const desigName =
            req?.approver_designation_name || req?.approverDesignationName;
          const approverEmail = req?.approver_email || req?.approverEmail;

          const cellContent = (
            <>
              <Avatar
                text={helpers.avatarText(displayName)}
                value={displayName}
                alt={displayName}
                color={isApproved ? "success" : "danger"}
                size="md"
              />
              <div className="ml-1 text-left">
                <p className="font-semibold dark-title-color text-xs group-hover:text-primary transition-colors">
                  {displayName}
                </p>
                {desigName && (
                  <SimpleTooltip text="Designation">
                    <span className="badge badge-rounded badge-outline-secondary text-[10px] mt-0.5 inline-block">
                      {desigName}
                    </span>
                  </SimpleTooltip>
                )}
                {approverEmail && (
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[140px]">
                    {approverEmail}
                  </p>
                )}
                {actionDateFormatted && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isApproved ? "Approved: " : "Action: "}
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
        size: 280,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <p className="text-xs text-gray-500 truncate max-w-[160px]">
            {row.original.remarks || "-"}
          </p>
        ),
        size: 150,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 190,
        cell: ({ row }) => {
          const item = row.original;
          const isPending = item.refundStatus === "pending";
          const isApproved = item.refundStatus === "approved";

          return (
            <div className="gap-2 flex items-center">
              <SimpleTooltip text="View Asset Details">
                <button
                  type="button"
                  onClick={() => setViewItem(item)}
                  className="btn-action text-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <Eye size={15} />
                </button>
              </SimpleTooltip>

              {!isPending && !isApproved && (
                <SimpleTooltip text="Request Refund for this item">
                  <button
                    type="button"
                    onClick={() => handleOpenRefundModal(item.id)}
                    className="btn-action text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded dark:hover:bg-blue-950/40"
                  >
                    <RotateCcw size={15} />
                  </button>
                </SimpleTooltip>
              )}

              {isApproved && (
                <DownloadButton
                  onClick={async () => {
                    setDownloadingId(item.id);
                    await generateRefundPdf(
                      item.refundRequest
                        ? { ...item, ...item.refundRequest }
                        : item
                    );
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
    [downloadingId]
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
      placeholder: "Search Asset Code, Description, Model, Serial...",
      value: filters.search,
    },
    ...(assetTypeOptions.length > 0
      ? [
          {
            component: "select",
            name: "assetTypeId",
            label: "Asset Type",
            options: assetTypeOptions,
            placeholder: "Filter by Asset Type",
            value: filters.assetTypeId,
            className: "col-span-12 lg:col-span-3 sm:col-span-12",
          },
        ]
      : []),
    {
      component: "datePicker",
      name: "startDate",
      label: "Allocated From",
      placeholder: "Start Date",
      value: filters.startDate,
    },
    {
      component: "datePicker",
      name: "endDate",
      label: "Allocated To",
      placeholder: "End Date",
      value: filters.endDate,
    },
    {
      component: "clear",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div>
          <h2 className="title-color font-bold text-lg">Refundable Assets</h2>
          <p className="text-xs text-gray-500">
            Company assets allocated to you that are refundable / returnable.
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

          <ButtonTw
            onClick={() => handleOpenRefundModal()}
            variant="blue"
            className="gap-2"
          >
            <RotateCcw size={16} />
            <span>Request for Refund</span>
          </ButtonTw>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Refundable Assets
            </p>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
              {stats.totalCount}
            </h3>
            <span className="text-[11px] text-gray-400">
              Allocated to your profile
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Asset Value
            </p>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">
              {formatNumber(stats.totalAmount)} BDT
            </h3>
            <span className="text-[11px] text-gray-400">
              Estimated refundable value
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Refunds Pending
            </p>
            <h3 className="text-xl font-bold text-amber-600 mt-1">
              {stats.pendingRefunds}
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold">
              Under admin review
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Refunds Approved
            </p>
            <h3 className="text-xl font-bold text-cyan-600 mt-1">
              {stats.approvedRefunds}
            </h3>
            <span className="text-[11px] text-gray-400">
              Settled & handed over
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

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
            {isAssetsLoading || isRequestsLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  Loading refundable assets...
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
                      No refundable allocated assets found
                    </p>
                    <p className="text-xs text-gray-400">
                      When company assets marked as refundable are allocated to your profile, they will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Request for Refund Modal (Supports Multi-item Selection!) */}
      <ModalTw
        show={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Request for Asset Refund"
        size="lg"
        showHeader={true}
        showFooter={false}
      >
        <form onSubmit={handleSubmitRefundRequest} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Select Asset(s) to Refund *
              </label>
              {refundableAssets.filter((a) => a.refundStatus !== "pending" && a.refundStatus !== "approved").length > 1 && (
                <button
                  type="button"
                  onClick={handleSelectAllEligible}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {selectedAssetIds.length ===
                  refundableAssets.filter((a) => a.refundStatus !== "pending" && a.refundStatus !== "approved").length
                    ? "Deselect All"
                    : "Select All Eligible"}
                </button>
              )}
            </div>

            {refundableAssets.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center border rounded">
                No refundable assets found to request refund.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y border rounded-lg dark:border-gray-700">
                {refundableAssets.map((asset) => {
                  const isPending = asset.refundStatus === "pending";
                  const isApproved = asset.refundStatus === "approved";
                  const isDisabled = isPending || isApproved;
                  const isChecked = selectedAssetIds.includes(asset.id);

                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        if (!isDisabled) handleToggleSelectAsset(asset.id);
                      }}
                      className={`flex items-start gap-3 p-3 text-xs transition-colors ${
                        isDisabled
                          ? "bg-gray-50 dark:bg-gray-800/40 opacity-70 cursor-not-allowed"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      } ${isChecked ? "bg-blue-50/60 dark:bg-blue-950/20" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {asset.itemDescription}
                          </span>
                          <span className="font-bold text-primary">
                            {formatNumber(asset.amount)} {asset.currency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span>Code: {asset.assetCode}</span>
                          {asset.model && asset.model !== "-" && (
                            <span>• Model: {asset.model}</span>
                          )}
                          {asset.serial && asset.serial !== "-" && (
                            <span>• SN: {asset.serial}</span>
                          )}
                        </div>
                        {isPending && (
                          <span className="text-[10px] text-amber-600 font-medium mt-1 inline-block">
                            ⚠️ Refund request already submitted and pending admin review.
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-block">
                            ✓ This asset has already been refunded.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-semibold mb-1 block">
                Refund / Return Date *
              </label>
              <input
                type="date"
                required
                value={refundRequestDate}
                onChange={(e) => setRefundRequestDate(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold mb-1 block">
                Refund Reason / Handover Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Reason for refund (e.g. Device upgrade, handover upon project completion, or defect)..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          {selectedAssetIds.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-xs text-blue-800 dark:text-blue-200 flex justify-between items-center">
              <span>
                Selected: <b>{selectedAssetIds.length} item(s)</b>
              </span>
              <span>
                Total Refund Value:{" "}
                <b>
                  {formatNumber(
                    refundableAssets
                      .filter((a) => selectedAssetIds.includes(a.id))
                      .reduce((sum, a) => sum + a.amount, 0)
                  )}{" "}
                  BDT
                </b>
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            <ButtonTw
              type="button"
              variant="outline.gray"
              onClick={() => setShowRefundModal(false)}
            >
              Cancel
            </ButtonTw>
            <ButtonTw
              type="submit"
              variant="blue"
              disabled={selectedAssetIds.length === 0 || createRefundMutation.isPending}
              className="gap-1.5"
            >
              <Send size={15} />
              <span>
                {createRefundMutation.isPending
                  ? "Submitting..."
                  : `Submit Refund Request (${selectedAssetIds.length})`}
              </span>
            </ButtonTw>
          </div>
        </form>
      </ModalTw>

      {/* Details View Modal */}
      {viewItem && (
        <ModalTw
          show={!!viewItem}
          onClose={() => setViewItem(null)}
          title="Refundable Asset Details"
          size="md"
          showHeader={true}
          showFooter={false}
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Asset Code:</span>
              <span className="font-semibold text-primary">
                {viewItem.assetCode}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Description / Name:</span>
              <span className="font-semibold">{viewItem.itemDescription}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Asset Type:</span>
              <span>{viewItem.assetTypeName}</span>
            </div>
            {viewItem.model && viewItem.model !== "-" && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Model:</span>
                <span>{viewItem.model}</span>
              </div>
            )}
            {viewItem.serial && viewItem.serial !== "-" && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Serial No:</span>
                <span>{viewItem.serial}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Amount / Value:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(viewItem.amount)} {viewItem.currency}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Allocation Date:</span>
              <span>
                {viewItem.allocationDate
                  ? helpers.dDateUtc
                    ? helpers.dDateUtc(viewItem.allocationDate)
                    : viewItem.allocationDate
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Refund Status:</span>
              <span
                className={`badge badge-pill ${
                  viewItem.refundStatus === "approved"
                    ? "badge-outline-success"
                    : viewItem.refundStatus === "pending"
                    ? "badge-outline-warning"
                    : viewItem.refundStatus === "rejected"
                    ? "badge-outline-danger"
                    : "badge-outline-info"
                }`}
              >
                {viewItem.refundStatus
                  ? viewItem.refundStatus.toUpperCase()
                  : "ELIGIBLE"}
              </span>
            </div>
            {viewItem.refundStatus && viewItem.refundStatus !== "pending" && (
              <>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">
                    {viewItem.refundStatus === "approved"
                      ? "Approved By:"
                      : "Action By:"}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {viewItem.refundRequest?.approver_employee_id ||
                    viewItem.refundRequest?.approverEmployeeId ? (
                      <Link
                        href={`/hr-dashboard/employee/${
                          viewItem.refundRequest.approver_employee_id ||
                          viewItem.refundRequest.approverEmployeeId
                        }`}
                        className="text-primary hover:underline font-semibold"
                      >
                        {`${
                          viewItem.refundRequest?.approver_first_name ||
                          viewItem.refundRequest?.approverFirstName ||
                          ""
                        } ${
                          viewItem.refundRequest?.approver_last_name ||
                          viewItem.refundRequest?.approverLastName ||
                          ""
                        }`.trim() || "HR Admin"}
                      </Link>
                    ) : (
                      `${
                        viewItem.refundRequest?.approver_first_name ||
                        viewItem.refundRequest?.approverFirstName ||
                        ""
                      } ${
                        viewItem.refundRequest?.approver_last_name ||
                        viewItem.refundRequest?.approverLastName ||
                        ""
                      }`.trim() || "HR Admin"
                    )}
                    {viewItem.refundRequest?.approver_designation_name ||
                    viewItem.refundRequest?.approverDesignationName
                      ? ` (${
                          viewItem.refundRequest.approver_designation_name ||
                          viewItem.refundRequest.approverDesignationName
                        })`
                      : ""}
                  </span>
                </div>
                {(viewItem.refundRequest?.action_date ||
                  viewItem.refundRequest?.actionDate) && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Action Date:</span>
                    <span>
                      {helpers.dDateUtc
                        ? helpers.dDateUtc(
                            viewItem.refundRequest.action_date ||
                              viewItem.refundRequest.actionDate
                          )
                        : String(
                            viewItem.refundRequest.action_date ||
                              viewItem.refundRequest.actionDate
                          ).slice(0, 10)}
                    </span>
                  </div>
                )}
                {(viewItem.refundRequest?.action_note ||
                  viewItem.refundRequest?.actionNote) && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Action Remarks:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {viewItem.refundRequest.action_note ||
                        viewItem.refundRequest.actionNote}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="pt-1">
              <span className="text-gray-500 block mb-1">Remarks:</span>
              <p className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
                {viewItem.remarks || "-"}
              </p>
            </div>
            <div className="flex justify-end pt-3 border-t gap-2">
              {viewItem.refundStatus !== "pending" &&
                viewItem.refundStatus !== "approved" && (
                <ButtonTw
                  type="button"
                  variant="blue"
                  onClick={() => {
                    const id = viewItem.id;
                    setViewItem(null);
                    handleOpenRefundModal(id);
                  }}
                >
                  Request Refund
                </ButtonTw>
              )}
              {viewItem.refundStatus === "approved" && (
                <ButtonTw
                  type="button"
                  variant="primary"
                  onClick={() =>
                    generateRefundPdf(
                      viewItem.refundRequest
                        ? { ...viewItem, ...viewItem.refundRequest }
                        : viewItem
                    )
                  }
                  className="flex items-center gap-1.5"
                >
                  <FileDown size={14} />
                  Download Refund Certificate (PDF)
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
