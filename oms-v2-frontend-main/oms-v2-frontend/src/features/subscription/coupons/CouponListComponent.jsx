// src/features/subscription/coupons/CouponListComponent.jsx
"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import {
  Ticket,
  Percent,
  Copy,
  Check,
  Layers,
  Sparkles,
  Pencil,
  Trash2,
  Clock,
  Gift,
} from "lucide-react";
import Swal from "sweetalert2";

// Components
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SwitchButton from "@/components/ui/SwitchButton";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import CouponTable from "./components/CouponTable";
import CouponAddOrUpdateModal from "./components/CouponAddOrUpdateModal";

// Hooks & Utilities
import helpers, { toaster } from "@/utils/helpers";
import { useCouponQueryApi } from "@/hooks/queryApi/useCouponQueryApi";
import { fetchActiveSubscriptions } from "@/services/subscriptionApi";

export default function CouponListComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems || 10;
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialDiscountType = searchParams.get("discountType") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [plansMap, setPlansMap] = useState({});

  const [showFilter, setShowFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("showCouponFilter") || "show";
    }
    return "show";
  });

  const [filters, setFilters] = useState({
    search: initialSearch,
    status: initialStatus,
    discountType: initialDiscountType,
  });
  const [sorting, setSorting] = useState([]);

  // Load plans for readable name mapping in applicable plans column
  useEffect(() => {
    let active = true;
    fetchActiveSubscriptions()
      .then((res) => {
        if (!active) return;
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((p) => {
            map[p.id] = p.name;
          });
          setPlansMap(map);
        }
      })
      .catch((err) => {
        console.warn("Could not load plans mapping for coupons", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingCoupon(null);
  }, []);

  const {
    useCouponsQuery,
    addOrUpdateCouponMutation,
    deleteCouponMutation,
    toggleCouponStatusMutation,
  } = useCouponQueryApi({
    handleClose: handleCloseModal,
    setShowModal,
  });

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.discountType) params.discountType = filters.discountType;
    return params;
  }, [currentPage, itemsPerPage, filters]);

  const { data: responseData, isLoading: isFetching } =
    useCouponsQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data?.data || responseData?.data || [],
    [responseData]
  );

  const pagination = responseData?.pagination ||
    responseData?.data?.pagination || {
      page: currentPage,
      total: Array.isArray(dataArray) ? dataArray.length : 0,
      limit: itemsPerPage,
      lastPage: 1,
    };

  const total = pagination.total || 0;

  const listData = useMemo(() => {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (v) => v !== "" && v !== undefined && v !== null
    );
  }, [filters]);

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const next = prev === "show" ? "hide" : "show";
      if (typeof window !== "undefined") {
        localStorage.setItem("showCouponFilter", next);
      }
      return next;
    });
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "",
      discountType: "",
    });
    setCurrentPage(1);
  };

  const handleCopyCode = (code) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toaster(`Copied ${code} to clipboard!`, "success");
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handleEdit = useCallback((coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    (coupon) => {
      Swal.fire({
        title: "Delete Coupon?",
        text: `Are you sure you want to delete coupon code "${coupon.code}"? This action cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteCouponMutation.mutate(coupon.id);
        }
      });
    },
    [deleteCouponMutation]
  );

  const handleToggleStatus = useCallback(
    (coupon) => {
      toggleCouponStatusMutation.mutate(coupon.id);
    },
    [toggleCouponStatusMutation]
  );

  const handleFormSubmit = useCallback(
    (payload) => {
      addOrUpdateCouponMutation.mutate(payload);
    },
    [addOrUpdateCouponMutation]
  );

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        header: "SL",
        accessorKey: "sl",
        enableSorting: false,
        size: 50,
        cell: ({ getValue }) => (
          <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
            {getValue()}
          </span>
        ),
      },
      {
        header: "Coupon Code & Offer",
        accessorKey: "code",
        cell: ({ row }) => {
          const item = row.original;
          const isCopied = copiedCode === item.code;
          return (
            <div className="flex flex-col gap-1 min-w-[210px]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/40 shadow-xs">
                  {item.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(item.code)}
                  title="Copy coupon code"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {item.firstTimeOnly && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                    First Time
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.name}
              </div>
              {item.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {item.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: "Discount",
        accessorKey: "discountValue",
        cell: ({ row }) => {
          const item = row.original;
          const isPercentage = item.discountType === "percentage";
          return (
            <div className="space-y-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isPercentage
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40"
                }`}
              >
                {isPercentage ? (
                  <>
                    <Percent className="w-3 h-3" /> {item.discountValue}% OFF
                  </>
                ) : (
                  <span>
                    {item.discountValue} {item.currency || "BDT"} OFF
                  </span>
                )}
              </span>
              {item.minimumAmount ? (
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Min spend: {item.minimumAmount} {item.currency || "BDT"}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        header: "Applicable Plans",
        accessorKey: "appliesTo",
        cell: ({ row }) => {
          const item = row.original;
          if (item.appliesTo === "all" || !item.applicablePlans?.length) {
            return (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <Layers className="w-3 h-3 text-blue-500 dark:text-blue-400" /> All Plans
              </span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-[220px]">
              {item.applicablePlans.map((planId) => (
                <span
                  key={planId}
                  className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                >
                  {plansMap[planId] || `Plan #${planId}`}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        header: "Usage & Limits",
        accessorKey: "redemptionCount",
        cell: ({ row }) => {
          const item = row.original;
          const redemptions = item.redemptionCount || 0;
          const max = item.maxRedemptions;
          const isMaxedOut = max && redemptions >= max;

          return (
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-1">
                <span
                  className={
                    isMaxedOut
                      ? "text-rose-600 dark:text-rose-400 font-bold"
                      : "text-gray-900 dark:text-gray-100 font-semibold"
                  }
                >
                  {redemptions}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  / {max ? `${max} uses` : "Unlimited"}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Max {item.maxUsesPerCompany || 1} use/company
              </div>
            </div>
          );
        },
      },
      {
        header: "Validity",
        accessorKey: "validUntil",
        cell: ({ row }) => {
          const item = row.original;
          const now = new Date();
          const validFrom = item.validFrom ? new Date(item.validFrom) : null;
          const validUntil = item.validUntil ? new Date(item.validUntil) : null;
          const isExpired = validUntil && validUntil < now;
          const isUpcoming = validFrom && validFrom > now;

          if (!validFrom && !validUntil) {
            return (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Lifetime / No Expiry
              </span>
            );
          }

          return (
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {validUntil
                    ? `Until ${validUntil.toLocaleDateString()}`
                    : `From ${validFrom.toLocaleDateString()}`}
                </span>
              </div>
              {isExpired ? (
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-600/30">
                  Expired
                </span>
              ) : isUpcoming ? (
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-600/30">
                  Upcoming
                </span>
              ) : (
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-600/30">
                  Active
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: () => <div className="text-center w-full">Active</div>,
        accessorKey: "isActive",
        size: 90,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center">
              <SwitchButton
                enabled={Boolean(item.isActive)}
                onChange={() => handleToggleStatus(item)}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0 mx-auto"
                disabled={toggleCouponStatusMutation.isPending}
              />
            </div>
          );
        },
      },
      {
        header: () => <div className="text-center w-full">Action</div>,
        id: "actions",
        size: 90,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <SimpleTooltip title="Edit Coupon" text="Edit Coupon">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </SimpleTooltip>
              <SimpleTooltip title="Delete Coupon" text="Delete Coupon">
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
    ],
    [
      copiedCode,
      plansMap,
      toggleCouponStatusMutation.isPending,
      handleToggleStatus,
      handleEdit,
      handleDelete,
    ]
  );

  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filterConfig = [
    {
      type: "search",
      name: "search",
      placeholder: "Search coupon code or offer name...",
      component: "search",
    },
    {
      type: "select",
      name: "status",
      placeholder: "Select Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "expired", label: "Expired" },
      ],
      component: "select",
    },
    {
      type: "select",
      name: "discountType",
      placeholder: "Discount Type",
      options: [
        { value: "percentage", label: "Percentage (%)" },
        { value: "fixed", label: "Fixed Amount" },
      ],
      component: "select",
    },
    {
      component: "clear",
    },
  ];

  // Quick stats computed
  const stats = useMemo(() => {
    const totalCount = total || listData.length;
    const activeCount = listData.filter((c) => c.isActive).length;
    const totalRedeemed = listData.reduce(
      (sum, c) => sum + (c.redemptionCount || 0),
      0
    );
    return { totalCount, activeCount, totalRedeemed };
  }, [total, listData]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="title-color font-bold text-xl tracking-tight">
              Subscription Coupons & Offers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-600/30">
              Admin Offer Engine
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Create and manage promotional discount coupons for subscription plans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick link button to Subscription Plans */}
          <ButtonTw
            onClick={() => router.push("/admin/subscription/subscription-list")}
            variant="alternative"
            className="gap-2 h-9 text-xs"
          >
            <Layers className="w-3.5 h-3.5" /> View Plans
          </ButtonTw>

          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={() => toggleFilter()}
              variant="alternative"
              className="gap-2 h-9"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>

          <ButtonTw
            onClick={() => {
              setEditingCoupon(null);
              setShowModal(true);
            }}
            variant="blue"
            className="gap-2 h-9"
          >
            <BiPlus className="w-4 h-4" /> Add New Coupon
          </ButtonTw>
        </div>
      </div>

      {/* KPI Stats Cards - sleek, modern glassmorphic look */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Coupons</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Offers</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.activeCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Redemptions</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-300">{stats.totalRedeemed}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Table */}
      <CouponTable
        table={table}
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      {/* Add / Edit Modal */}
      <CouponAddOrUpdateModal
        show={showModal}
        onClose={handleCloseModal}
        initialData={editingCoupon}
        onSubmit={handleFormSubmit}
        isSubmitting={addOrUpdateCouponMutation.isPending}
      />
    </div>
  );
}
