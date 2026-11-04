"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Building2,
  Crown,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Eye,
  ChevronRight,
  AlertTriangle,
  RotateCw,
  Globe,
  ExternalLink,
  Briefcase,
  UserCheck,
  TrendingUp,
  Zap,
  Award,
  XCircle,
  Receipt,
  CreditCard,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { useSubscriptionQueryApi } from "@/hooks/queryApi/useSubscriptionQueryApi";
import { ModalTw } from "@/components/common/ModalTw";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers, { toaster } from "@/utils/helpers";
import { downloadInvoice } from "@/services/paymentDashboardApi";
import { generateReceiptPdf } from "@/utils/generateReceiptPdf";

/**
 * Dynamic Color & Icon Scheme for Subscription Plans:
 * - Growth: Vibrant Emerald Green (expansion & thriving tier)
 * - Enterprise: Royal Indigo / Sapphire Blue (high security & enterprise scale)
 * - Starter Plan: Vivid Cyan / Sky Blue (fresh modern start)
 * - Custom / Other: Violet / Purple (specialized tier)
 * - Trial / Complimentary (replaces Free Plan): Warm Amber
 */
export const getPlanTheme = (planName = "", isPremium = false) => {
  const raw = String(planName || "").trim();
  const normalized = raw.toLowerCase();

  // "jara kinse paid korse sohodo tader e package show korba r free plan naa diye trail plan deo ba sob free kore deo"
  // If not paid or trial/free, strictly return Trial Plan
  if (
    !isPremium ||
    !planName ||
    normalized.includes("free") ||
    normalized.includes("trial")
  ) {
    return {
      key: "trial",
      displayName: "Trial Plan",
      badgeClass:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconContainerClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
      cardBorder: "border-amber-200 dark:border-amber-800/60",
      cardBg: "bg-white dark:bg-[#111827]",
      cardInnerBg: "bg-amber-50/50 dark:bg-amber-950/30",
      cardInnerBorder: "border-amber-200/80 dark:border-amber-800/50",
      accentText: "text-amber-700 dark:text-amber-300",
      barColor: "bg-amber-500",
      Icon: Clock,
    };
  }

  // 1. Growth Plan (Distinct Emerald / Vibrant Green)
  if (normalized.includes("growth")) {
    return {
      key: "growth",
      displayName: raw || "Growth",
      badgeClass:
        "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/70",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconContainerClass:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
      cardBorder: "border-emerald-200 dark:border-emerald-800/60",
      cardBg:
        "bg-gradient-to-br from-white via-emerald-50/25 to-white dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900",
      cardInnerBg:
        "bg-emerald-50/60 dark:bg-emerald-950/40",
      cardInnerBorder:
        "border-emerald-200/90 dark:border-emerald-800/60",
      accentText: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-500",
      Icon: TrendingUp,
    };
  }

  // 2. Enterprise Plan (Distinct Royal Indigo / Sapphire Blue)
  if (normalized.includes("enterprise")) {
    return {
      key: "enterprise",
      displayName: raw || "Enterprise",
      badgeClass:
        "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/70",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconContainerClass:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
      cardBorder: "border-indigo-200 dark:border-indigo-800/60",
      cardBg:
        "bg-gradient-to-br from-white via-indigo-50/25 to-white dark:from-gray-900 dark:via-indigo-950/20 dark:to-gray-900",
      cardInnerBg:
        "bg-indigo-50/60 dark:bg-indigo-950/40",
      cardInnerBorder:
        "border-indigo-200/90 dark:border-indigo-800/60",
      accentText: "text-indigo-600 dark:text-indigo-400",
      barColor: "bg-indigo-600",
      Icon: Crown,
    };
  }

  // 3. Starter Plan (Distinct Cyan / Sky Blue)
  if (normalized.includes("start")) {
    return {
      key: "starter",
      displayName: raw || "Starter Plan",
      badgeClass:
        "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/70",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      iconContainerClass:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300",
      cardBorder: "border-cyan-200 dark:border-cyan-800/60",
      cardBg:
        "bg-gradient-to-br from-white via-cyan-50/25 to-white dark:from-gray-900 dark:via-cyan-950/20 dark:to-gray-900",
      cardInnerBg:
        "bg-cyan-50/60 dark:bg-cyan-950/40",
      cardInnerBorder:
        "border-cyan-200/90 dark:border-cyan-800/60",
      accentText: "text-cyan-600 dark:text-cyan-400",
      barColor: "bg-cyan-500",
      Icon: Zap,
    };
  }

  // 4. Other / Professional / Business Plan (Violet / Purple)
  return {
    key: "custom",
    displayName: raw || "Premium Plan",
    badgeClass:
      "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/70",
    iconColor: "text-purple-600 dark:text-purple-400",
    iconContainerClass:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
    cardBorder: "border-purple-200 dark:border-purple-800/60",
    cardBg:
      "bg-gradient-to-br from-white via-purple-50/25 to-white dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900",
    cardInnerBg:
      "bg-purple-50/60 dark:bg-purple-950/40",
    cardInnerBorder:
      "border-purple-200/90 dark:border-purple-800/60",
    accentText: "text-purple-600 dark:text-purple-400",
    barColor: "bg-purple-600",
    Icon: Award,
  };
};

/**
 * Dynamic Color & Icon Scheme for Subscription Statuses (status_group_id = 6):
 * - Active (30): Vibrant Emerald Green
 * - Trial (34): Warm Amber / Yellow
 * - Expired (32): Crimson / Rose
 * - Canceled (33): Slate / Gray
 * - Pending (228): Sky Blue
 */
export const getSubscriptionStatusTheme = (status) => {
  const statusId =
    typeof status === "object" ? Number(status?.id) : Number(status);
  const rawCode =
    typeof status === "object"
      ? status?.code || status?.name || ""
      : String(status || "");
  const statusCode = String(rawCode).toLowerCase().trim();

  if (statusId === 30 || statusCode.includes("active")) {
    return {
      id: 30,
      name: "Active",
      badgeClass:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800",
      dotClass: "bg-emerald-500",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      Icon: ShieldCheck,
    };
  }

  if (statusId === 34 || statusCode.includes("trial")) {
    return {
      id: 34,
      name: "Trial",
      badgeClass:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800",
      dotClass: "bg-amber-500",
      iconColor: "text-amber-600 dark:text-amber-400",
      Icon: Clock,
    };
  }

  if (statusId === 32 || statusCode.includes("expired")) {
    return {
      id: 32,
      name: "Expired",
      badgeClass:
        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800",
      dotClass: "bg-rose-500",
      iconColor: "text-rose-600 dark:text-rose-400",
      Icon: AlertTriangle,
    };
  }

  if (
    statusId === 33 ||
    statusCode.includes("canceled") ||
    statusCode.includes("cancelled")
  ) {
    return {
      id: 33,
      name: "Canceled",
      badgeClass:
        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700",
      dotClass: "bg-gray-500",
      iconColor: "text-gray-500 dark:text-gray-400",
      Icon: XCircle,
    };
  }

  return {
    id: statusId || 0,
    name:
      (typeof status === "object" ? status?.name : String(status || "")) ||
      "Pending",
    badgeClass:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800",
    dotClass: "bg-blue-500",
    iconColor: "text-blue-600 dark:text-blue-400",
    Icon: Clock,
  };
};

/**
 * Extract 2-letter initials: First letter of 1st word + first letter of 2nd word.
 * If single word, returns the first 2 letters.
 * e.g., "Demo Company" -> "DC", "Dhaka Club" -> "DC", "TREENETRA" -> "TR"
 */
export const getCompanyInitials = (name) => {
  if (!name || typeof name !== "string") return "CO";
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    const first = words[0].charAt(0).toUpperCase();
    const second = words[1].charAt(0).toUpperCase();
    return `${first}${second}`;
  }

  const single = words[0] || "";
  if (single.length >= 2) {
    return single.slice(0, 2).toUpperCase();
  }
  return (single.charAt(0) || "C").toUpperCase();
};

const AVATAR_GRADIENTS = [
  "from-primaryColor to-primaryColor-700 text-white",
  "from-primaryColor-600 to-secondaryColor text-white",
  "from-secondaryColor to-primaryColor text-white",
  "from-primaryColor-700 to-primaryColor-800 text-white",
  "from-primaryColor-500 to-secondaryColor-600 text-white",
];

const getAvatarGradient = (id, name = "") => {
  const charCodeSum = (name || "")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), Number(id) || 0);
  return AVATAR_GRADIENTS[charCodeSum % AVATAR_GRADIENTS.length];
};

/**
 * Company Logo Component:
 * Attempts to load company logo image; if null or on error, falls back to
 * 2-letter initials (first letter and 2nd first letter) with a vibrant gradient.
 */
export function CompanyLogo({ logo, name, id, size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);
  const initials = getCompanyInitials(name);
  const resolvedUrl = logo ? helpers.resolveImageUrl(logo) : null;
  const gradientClass = getAvatarGradient(id, name);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs rounded-lg",
    md: "w-10 h-10 text-xs sm:text-sm rounded-xl",
    lg: "w-14 h-14 text-base sm:text-lg rounded-2xl",
    xl: "w-16 h-16 text-lg sm:text-xl rounded-2xl",
  }[size] || "w-10 h-10 text-xs sm:text-sm rounded-xl";

  if (resolvedUrl && !imgError) {
    return (
      <div
        className={`${sizeClasses} shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-2xs ${className}`}
      >
        <img
          src={resolvedUrl}
          alt={name || "Company Logo"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} shrink-0 overflow-hidden bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold tracking-wider shadow-2xs uppercase select-none ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}

export default function SubscriberCompaniesList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilter, setShowFilter] = useState(true);

  // Filter state for our DataFilter component
  const [filters, setFilters] = useState({
    search: "",
    subscriptionStatus: "", // '' | '30' (Active) | '34' (Trial) | '32' (Expired) | '33' (Canceled)
    planType: "", // '' | 'purchased' | 'trial' | 'growth' | 'enterprise'
    status: "", // '' | 'active' | 'inactive' (company status)
  });

  // Selected company for detail modal
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalTab, setDetailModalTab] = useState("overview"); // 'overview' | 'purchases'
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [copiedTxnId, setCopiedTxnId] = useState(null);

  // Company status toggle confirmation state
  const [toggleConfirmCompany, setToggleConfirmCompany] = useState(null);
  const [isTogglingId, setIsTogglingId] = useState(null);

  // Persistent references to last known valid counts so clicking cards/filters NEVER flashes 0
  const lastKnownSummaryRef = useRef({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    purchasedCompanies: 0,
    purchasedAmount: 0,
    trialCompanies: 0,
    premiumCompanies: 0,
    freeCompanies: 0,
    appSubStatuses: [],
  });
  const lastKnownPlanBreakdownRef = useRef({});

  // Hook queries and mutations
  const {
    useSubscriberCompaniesQuery,
    useToggleSubscriberCompanyStatusMutation,
  } = useSubscriptionQueryApi();

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: filters.search ? filters.search.trim() : "",
      subscriptionStatus: filters.subscriptionStatus || "all",
      planType: filters.planType || "all",
      status: filters.status || "all",
    }),
    [page, limit, filters]
  );

  const {
    data: responseData,
    isLoading,
    isFetching,
    refetch,
  } = useSubscriberCompaniesQuery(queryParams);

  const toggleMutation = useToggleSubscriberCompanyStatusMutation;

  // Resolve payload container across all possible response structures:
  // e.g. { message, data: [], summary: {}, pagination: {} }
  // or { success: true, data: { data: [], summary: {}, pagination: {} } }
  // or { data: [] }
  const { companies, displaySummary, pagination } = useMemo(() => {
    const payload =
      responseData?.data?.summary !== undefined
        ? responseData.data
        : responseData?.summary !== undefined
        ? responseData
        : responseData?.data?.data?.summary !== undefined
        ? responseData.data.data
        : responseData?.data || responseData || {};

    const rawCompanies =
      Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(responseData?.data?.data)
        ? responseData.data.data
        : Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : [];

    const compList = Array.isArray(rawCompanies) ? rawCompanies : [];

    const serverSummary =
      payload?.summary ||
      responseData?.summary ||
      responseData?.data?.summary ||
      responseData?.data?.data?.summary;

    const totalCompanies = Number(serverSummary?.totalCompanies ?? 0);
    const activeCompanies = Number(serverSummary?.activeCompanies ?? 0);
    const inactiveCompanies = Number(serverSummary?.inactiveCompanies ?? 0);
    const purchasedCompanies = Number(
      serverSummary?.purchasedCompanies ?? serverSummary?.premiumCompanies ?? 0
    );
    const purchasedAmount = Number(serverSummary?.purchasedAmount ?? 0);
    const trialCompanies = Number(
      serverSummary?.trialCompanies ?? serverSummary?.freeCompanies ?? 0
    );

    const hasSummaryValues =
      totalCompanies > 0 ||
      activeCompanies > 0 ||
      inactiveCompanies > 0 ||
      purchasedCompanies > 0 ||
      trialCompanies > 0;

    let summaryObj;
    if (hasSummaryValues) {
      summaryObj = {
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        purchasedCompanies,
        purchasedAmount,
        trialCompanies,
        premiumCompanies: purchasedCompanies,
        freeCompanies: trialCompanies,
        appSubStatuses: Array.isArray(serverSummary?.appSubStatuses)
          ? serverSummary.appSubStatuses
          : lastKnownSummaryRef.current?.appSubStatuses || [],
        plans: Array.isArray(serverSummary?.plans)
          ? serverSummary.plans
          : lastKnownSummaryRef.current?.plans || [],
        planCounts:
          serverSummary?.planCounts ||
          lastKnownSummaryRef.current?.planCounts ||
          {},
      };
      lastKnownSummaryRef.current = summaryObj;
    } else if (lastKnownSummaryRef.current.totalCompanies > 0) {
      // Smooth retention: never flash 0 during query transitions or network fetching
      summaryObj = lastKnownSummaryRef.current;
    } else if (compList.length > 0) {
      const purchasedCount = compList.filter((c) => c.isPurchased).length;
      const trialCount = compList.length - purchasedCount;
      summaryObj = {
        totalCompanies: compList.length,
        activeCompanies: compList.filter((c) => c.isActive !== false).length,
        inactiveCompanies: compList.filter((c) => !c.isActive).length,
        purchasedCompanies: purchasedCount,
        purchasedAmount: 0,
        trialCompanies: trialCount,
        premiumCompanies: purchasedCount,
        freeCompanies: trialCount,
        appSubStatuses: lastKnownSummaryRef.current?.appSubStatuses || [],
        plans: lastKnownSummaryRef.current?.plans || [],
        planCounts: lastKnownSummaryRef.current?.planCounts || {},
      };
      if (summaryObj.totalCompanies > 0) {
        lastKnownSummaryRef.current = summaryObj;
      }
    } else {
      summaryObj = lastKnownSummaryRef.current;
    }

    const serverPagination =
      payload?.pagination ||
      responseData?.pagination ||
      responseData?.data?.pagination;

    const paginationObj = serverPagination || {
      total: summaryObj.totalCompanies || compList.length || 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    return {
      companies: compList,
      displaySummary: summaryObj,
      pagination: paginationObj,
    };
  }, [responseData]);

  // Breakdown of plan counts among companies for quick metric badges
  const planBreakdown = useMemo(() => {
    if (
      Array.isArray(displaySummary?.plans) &&
      displaySummary.plans.length > 0
    ) {
      const map = {};
      displaySummary.plans.forEach((p) => {
        map[p.name] = Number(p.count ?? 0);
      });
      lastKnownPlanBreakdownRef.current = map;
      return map;
    }
    const counts = {};
    companies.forEach((c) => {
      if (c.planName && c.planName !== "Trial") {
        counts[c.planName] = (counts[c.planName] || 0) + 1;
      }
    });
    if (Object.keys(counts).length > 0) {
      lastKnownPlanBreakdownRef.current = counts;
      return counts;
    }
    return lastKnownPlanBreakdownRef.current;
  }, [companies, displaySummary?.plans]);

  // Available plans list for quick tabs and filtering
  const availablePlans = useMemo(() => {
    if (
      Array.isArray(displaySummary?.plans) &&
      displaySummary.plans.length > 0
    ) {
      return displaySummary.plans;
    }
    return [
      {
        id: 2,
        name: "Growth",
        slug: "growth",
        count: planBreakdown["Growth"] ?? 0,
      },
      {
        id: 24,
        name: "Enterprise",
        slug: "enterprise",
        count: planBreakdown["Enterprise"] ?? 0,
      },
      {
        id: 38,
        name: "Starter Plan",
        slug: "starter-plan",
        count: planBreakdown["Starter Plan"] ?? 0,
      },
    ];
  }, [displaySummary?.plans, planBreakdown]);

  // Filter options for Subscription Statuses where status_group_id = 6 (App Subscription Statuses)
  const subscriptionStatusOptions = useMemo(() => {
    if (
      Array.isArray(displaySummary?.appSubStatuses) &&
      displaySummary.appSubStatuses.length > 0
    ) {
      return [
        { value: "", label: "All Subscription Statuses" },
        ...displaySummary.appSubStatuses.map((s) => ({
          value: String(s.id),
          label: `${s.name} (${s.id === 30 ? "Paid & Active" : s.id === 34 ? "Trial" : s.name})`,
        })),
      ];
    }
    return [
      { value: "", label: "All Subscription Statuses" },
      { value: "30", label: "Active (Paid Subscription)" },
      { value: "34", label: "Trial Plan" },
      { value: "32", label: "Expired" },
      { value: "33", label: "Canceled" },
    ];
  }, [displaySummary?.appSubStatuses]);

  // Filter options: Purchased Packages, Trial, and specific subscription plan names
  const planFilterOptions = useMemo(() => {
    const list = [
      { value: "", label: "All Plans & Packages" },
      { value: "purchased", label: "Purchased Packages Only" },
      { value: "trial", label: "Trial Only (No Paid Package)" },
    ];

    if (availablePlans.length > 0) {
      availablePlans.forEach((p) => {
        list.push({
          value: p.slug || String(p.id),
          label: `${p.name} Plan`,
        });
      });
      return list;
    }

    return [
      { value: "", label: "All Plans & Packages" },
      { value: "purchased", label: "Purchased Packages Only" },
      { value: "trial", label: "Trial Only (No Paid Package)" },
      { value: "growth", label: "Growth Plan" },
      { value: "enterprise", label: "Enterprise Plan" },
      { value: "starter-plan", label: "Starter Plan" },
    ];
  }, [availablePlans]);

  // Filter config for our DataFilter component
  const filterConfig = useMemo(
    () => [
      {
        name: "search",
        label: "Search Companies",
        component: "input",
        placeholder: "Search company, email, phone, or owner...",
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
      },
      {
        name: "subscriptionStatus",
        label: "Subscription Status",
        component: "select",
        placeholder: "All Sub Statuses",
        options: subscriptionStatusOptions,
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
        searchable: false,
      },
      {
        name: "planType",
        label: "Plan / Package",
        component: "select",
        placeholder: "All Plans",
        options: planFilterOptions,
        className: "col-span-12 sm:col-span-6 lg:col-span-2",
        searchable: false,
      },
      {
        name: "status",
        label: "Company Status",
        component: "select",
        placeholder: "All Status",
        options: [
          { value: "", label: "All Status" },
          { value: "active", label: "Active Companies" },
          { value: "inactive", label: "Deactivated Companies" },
        ],
        className: "col-span-12 sm:col-span-6 lg:col-span-2",
        searchable: false,
      },
      {
        component: "clear",
        className:
          "col-span-12 sm:col-span-6 lg:col-span-2 flex items-center justify-center mt-1.5 [&_button]:whitespace-nowrap [&_button]:text-xs [&_button]:px-3",
      },
    ],
    [subscriptionStatusOptions, planFilterOptions]
  );

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.subscriptionStatus ||
      filters.planType ||
      filters.status
  );

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      subscriptionStatus: "",
      planType: "",
      status: "",
    });
    setPage(1);
  };

  const handleToggleClick = (company) => {
    setToggleConfirmCompany(company);
  };

  const handleConfirmToggle = async () => {
    if (!toggleConfirmCompany) return;
    const target = toggleConfirmCompany;
    setToggleConfirmCompany(null);
    setIsTogglingId(target.id);
    try {
      await toggleMutation.mutateAsync({
        id: target.id,
        isActive: !target.isActive,
      });
    } finally {
      setIsTogglingId(null);
    }
  };

  const handleCopyText = (text, id) => {
    if (!text) return;
    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(text));
      setCopiedTxnId(id);
      setTimeout(() => setCopiedTxnId(null), 2000);
      toaster("Copied to clipboard", "success");
    }
  };

  const handleDownloadInvoice = async (inv) => {
    if (!inv || !inv.id) return;
    setDownloadingInvoiceId(inv.id);
    try {
      const response = await downloadInvoice(inv.id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${inv.invoiceNumber || inv.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toaster("Invoice downloaded successfully", "success");
    } catch (error) {
      console.warn("API invoice download failed, generating client receipt PDF:", error);
      try {
        const pdf = await generateReceiptPdf(inv);
        pdf.save(`receipt-${inv.invoiceNumber || inv.id}.pdf`);
        toaster("Receipt generated and downloaded", "success");
      } catch (genError) {
        console.error("Receipt generation failed:", genError);
        toaster("Could not download invoice. Please try again.", "error");
      }
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleCardQuickFilter = (
    targetPlanType = "",
    targetStatus = "",
    targetSubStatus = ""
  ) => {
    setFilters((prev) => {
      // 1. Reset all filters
      if (!targetPlanType && !targetStatus && !targetSubStatus) {
        return {
          ...prev,
          planType: "",
          status: "",
          subscriptionStatus: "",
        };
      }

      // 2. If clicking a planType card (e.g. 'purchased' or 'trial' or specific plan)
      if (targetPlanType) {
        if (
          prev.planType === targetPlanType &&
          !prev.status &&
          !prev.subscriptionStatus
        ) {
          return {
            ...prev,
            planType: "",
            status: "",
            subscriptionStatus: "",
          };
        }
        return {
          ...prev,
          planType: targetPlanType,
          status: "",
          subscriptionStatus: "",
        };
      }

      // 3. If clicking a company status card (e.g. 'active' or 'inactive')
      if (targetStatus) {
        if (
          prev.status === targetStatus &&
          !prev.planType &&
          !prev.subscriptionStatus
        ) {
          return {
            ...prev,
            planType: "",
            status: "",
            subscriptionStatus: "",
          };
        }
        return {
          ...prev,
          status: targetStatus,
          planType: "",
          subscriptionStatus: "",
        };
      }

      // 4. If clicking a subscriptionStatus card (e.g. '30', '34')
      if (targetSubStatus) {
        if (
          prev.subscriptionStatus === targetSubStatus &&
          !prev.planType &&
          !prev.status
        ) {
          return {
            ...prev,
            planType: "",
            status: "",
            subscriptionStatus: "",
          };
        }
        return {
          ...prev,
          subscriptionStatus: targetSubStatus,
          planType: "",
          status: "",
        };
      }

      return prev;
    });
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── 1. Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Subscribers Companies
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Building2 className="w-3 h-3" />
              {displaySummary.totalCompanies} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track registered tenant companies, monitor paid subscriptions vs trial workspaces, and manage active/deactive status.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <SimpleTooltip text={showFilter ? "Hide Filters" : "Show Filters"}>
            <ButtonTw
              variant="alternative"
              onClick={() => setShowFilter(!showFilter)}
              className="gap-2 text-xs font-semibold"
            >
              <FaFilter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip text="Refresh Companies">
            <ButtonTw
              variant="alternative"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2 text-xs font-semibold"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-primaryColor" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </ButtonTw>
          </SimpleTooltip>
        </div>
      </div>

      {/* ─── 2. DataFilter Component (PLACED AT THE TOP) ─────────────────── */}
      <DataFilter
        showFilter={showFilter}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ─── 3. Summary Metric Cards (BELOW THE FILTER) ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Companies */}
        <div
          onClick={() => handleCardQuickFilter("", "", "")}
          className={`group p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            !filters.planType && !filters.status && !filters.subscriptionStatus
              ? "bg-primaryColor/5 border-primaryColor shadow-xs"
              : "bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-primaryColor/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-primaryColor transition-colors">
              Total Companies
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primaryColor/10 text-primaryColor dark:text-primaryColor-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              {displaySummary.totalCompanies}
            </h3>
            <span className="text-xs text-gray-400">registered</span>
          </div>
          <div className="mt-2 text-[11px] text-primaryColor dark:text-primaryColor-400 font-medium flex items-center gap-1">
            <span>View all</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Purchased Packages (Shows count and collected amount) */}
        <div
          onClick={() => handleCardQuickFilter("purchased", "", "")}
          className={`group p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filters.planType === "purchased" &&
            !filters.status &&
            !filters.subscriptionStatus
              ? "bg-primaryColor/5 border-primaryColor shadow-xs"
              : "bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-primaryColor/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primaryColor dark:text-primaryColor-400 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Purchased Packages
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primaryColor/10 text-primaryColor dark:text-primaryColor-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Crown className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              {displaySummary.purchasedCompanies}
            </h3>
            <span className="text-xs text-gray-400">subscribed</span>
          </div>
          <div className="mt-2 text-[11px] text-primaryColor dark:text-primaryColor-400 font-medium flex items-center gap-1">
            <span>Paid subscribers</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Trial Accounts */}
        <div
          onClick={() => handleCardQuickFilter("trial", "", "")}
          className={`group p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filters.planType === "trial" &&
            !filters.status &&
            !filters.subscriptionStatus
              ? "bg-amber-500/5 border-amber-500 shadow-xs"
              : "bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Trial Accounts
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              {displaySummary.trialCompanies}
            </h3>
            <span className="text-xs text-gray-400">trial workspaces</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>Trial tenants</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Active Companies */}
        <div
          onClick={() => handleCardQuickFilter("", "active", "")}
          className={`group p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filters.status === "active" &&
            !filters.planType &&
            !filters.subscriptionStatus
              ? "bg-emerald-500/5 border-emerald-500 shadow-xs"
              : "bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Active
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              {displaySummary.activeCompanies}
            </h3>
            <span className="text-xs text-gray-400">operational</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span>Active workspaces</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Deactivated Companies */}
        <div
          onClick={() => handleCardQuickFilter("", "inactive", "")}
          className={`group col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filters.status === "inactive" &&
            !filters.planType &&
            !filters.subscriptionStatus
              ? "bg-rose-500/5 border-rose-500 shadow-xs"
              : "bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-rose-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Deactivated
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              {displaySummary.inactiveCompanies}
            </h3>
            <span className="text-xs text-gray-400">disabled</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
            <span>Suspended</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* ─── 4. Quick Category Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Quick Plan Filter Tabs */}
        <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => handleCardQuickFilter("", "", "")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              !filters.planType && !filters.status && !filters.subscriptionStatus
                ? "bg-primaryColor text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All Companies ({displaySummary.totalCompanies})
          </button>
          <button
            onClick={() => handleCardQuickFilter("trial", "", "")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filters.planType === "trial" &&
              !filters.status &&
              !filters.subscriptionStatus
                ? "bg-primaryColor text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Trial ({displaySummary.trialCompanies})</span>
          </button>
          {availablePlans.map((plan) => {
            const planSlug = plan.slug || String(plan.id);
            const planTheme = getPlanTheme(plan.name, true);
            const PlanIcon = planTheme.Icon;
            const count = plan.count ?? planBreakdown[plan.name] ?? 0;
            const isSelected =
              filters.planType === planSlug &&
              !filters.status &&
              !filters.subscriptionStatus;
            return (
              <button
                key={plan.id || planSlug}
                onClick={() => handleCardQuickFilter(planSlug, "", "")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primaryColor text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <PlanIcon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? "text-white" : planTheme.iconColor
                  }`}
                />
                <span>
                  {plan.name} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 5. Main Table of Subscriber Companies ───────────────────────── */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        {/* Responsive Table Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[840px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Plan & Package</th>
                <th className="py-3.5 px-4">Workspace Owner & Contact</th>
                <th className="py-3.5 px-4 text-center">App Users</th>
                <th className="py-3.5 px-4 text-center">Active Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RotateCw className="w-6 h-6 animate-spin text-primaryColor" />
                      <span className="text-xs font-medium">
                        Loading subscriber companies...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-gray-400">
                      <Building2 className="w-12 h-12 stroke-[1.2] text-gray-300 dark:text-gray-600 mb-2" />
                      <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm">
                        No companies found
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Try modifying your search or resetting active filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primaryColor text-white hover:bg-primaryColor-700 transition cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const isToggling = isTogglingId === company.id;

                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Column 1: Company Logo / Initials & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <CompanyLogo
                            logo={company.logo}
                            name={company.name}
                            id={company.id}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {company.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shrink-0">
                                #{company.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>
                                Joined{" "}
                                {company.createdAt
                                  ? new Date(company.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Plan & Package (Single unified column) */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const isPurchased = Boolean(company.isPurchased);
                          const planTheme = getPlanTheme(
                            isPurchased ? company.planName : "Trial Plan",
                            isPurchased
                          );
                          const PlanIcon = planTheme.Icon;
                          const endDate = company.subscription?.endDate;

                          return (
                            <div className="space-y-1">
                              {/* Plan / Package Badge */}
                              <div>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${planTheme.badgeClass} shadow-2xs transition-all`}
                                >
                                  <PlanIcon
                                    className={`w-3.5 h-3.5 ${planTheme.iconColor}`}
                                  />
                                  <span>{planTheme.displayName}</span>
                                </span>
                              </div>

                              {/* Paid Package: Price & Renewal */}
                              {isPurchased ? (
                                <div className="space-y-0.5">
                                  {company.subscription?.monthlyPrice ? (
                                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                      {company.subscription.currency || "BDT"}{" "}
                                      {Number(company.subscription.monthlyPrice).toLocaleString()}/mo
                                    </p>
                                  ) : null}
                                  {endDate && (
                                    <p className="text-[10px] text-gray-400">
                                      Renews {helpers.dDateUtc(endDate, "D MMM YYYY")}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                /* Trial: Duration with Clock icon */
                                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                  <span>
                                    {endDate
                                      ? `Trial (${helpers.dDateUtc(endDate, "D MMM YYYY")})`
                                      : "Trial Workspace"}
                                  </span>
                                </div>
                              )}

                              {/* Invoice info if available */}
                              {company.latestInvoice?.invoiceNumber ? (
                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                                    {company.latestInvoice.invoiceNumber}
                                  </span>
                                  <span
                                    className={`font-semibold capitalize text-[9px] ${
                                      company.latestInvoice.paymentStatus === "paid" ||
                                      company.latestInvoice.status === "paid"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-amber-600 dark:text-amber-400"
                                    }`}
                                  >
                                    ({company.latestInvoice.paymentStatus || company.latestInvoice.status || "Unpaid"})
                                  </span>
                                </div>
                              ) : company.latestSubInvoice?.id ? (
                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                                    SUB-INV-#{company.latestSubInvoice.id}
                                  </span>
                                  <span
                                    className={`font-semibold capitalize text-[9px] ${
                                      company.latestSubInvoice.statusId === 38 ||
                                      company.latestSubInvoice.paidAt
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-amber-600 dark:text-amber-400"
                                    }`}
                                  >
                                    ({company.latestSubInvoice.statusName ||
                                      (company.latestSubInvoice.paidAt ? "paid" : "unpaid")})
                                  </span>
                                </div>
                              ) : null}

                              {/* Purchase count button if purchase history exists */}
                              {Array.isArray(company.purchaseHistory) && company.purchaseHistory.length > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCompany(company);
                                    setDetailModalTab("purchases");
                                    setShowDetailModal(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[10px] font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer w-fit"
                                >
                                  <Receipt className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                                  <span>{company.purchaseHistory.length} invoice{company.purchaseHistory.length > 1 ? "s" : ""}</span>
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Column 3: Workspace Owner & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {company.owner?.name ? (
                            <div className="font-semibold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate">
                                {company.owner.name}
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">
                              Owner not assigned
                            </div>
                          )}

                          <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5">
                            {(company.owner?.email || company.email) && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="truncate">
                                  {company.owner?.email || company.email}
                                </span>
                              </div>
                            )}
                            {(company.owner?.phone || company.phone) && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>
                                  {company.owner?.phone || company.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 4: App Users Count */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>
                              {company.activeUsers} / {company.totalUsers}
                            </span>
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            Active / Total
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Active / Deactive Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={company.isActive}
                              disabled={isToggling}
                              onChange={() => handleToggleClick(company)}
                              className="sr-only peer"
                            />
                            <div
                              className={`w-11 h-6 bg-gray-300 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${
                                company.isActive
                                  ? "peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500"
                                  : "bg-gray-300 dark:bg-gray-700"
                              } ${isToggling ? "opacity-50 cursor-wait" : ""}`}
                            />
                          </label>

                          <span
                            className={`text-[11px] font-bold ${
                              company.isActive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {company.isActive ? "Active" : "Deactivated"}
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <SimpleTooltip text="View Full Company Details">
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setDetailModalTab("overview");
                                setShowDetailModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>Details</span>
                            </button>
                          </SimpleTooltip>

                          <SimpleTooltip text="View Purchase & Billing History">
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setDetailModalTab("purchases");
                                setShowDetailModal(true);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                                (company.purchaseHistory?.length || 0) > 0
                                  ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Invoices ({company.purchaseHistory?.length || 0})</span>
                            </button>
                          </SimpleTooltip>
                        </div>
                      </td>
                    </tr>

                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Shared Project Pagination Component ───────────────────────────── */}
        {!isLoading && companies.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Pagination
              currentPage={page}
              totalItems={pagination.total || displaySummary.totalCompanies || companies.length || 0}
              itemsPerPage={limit}
              onPageChange={(newPage) => setPage(newPage)}
              onItemsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              variant="primary"
              size="sm"
              background={false}
              className="my-1"
            />
          </div>
        )}
      </div>

      {/* ─── 6. Confirmation Modal for Active / Deactive Toggle ───────────── */}
      <ModalTw
        isOpen={Boolean(toggleConfirmCompany)}
        show={Boolean(toggleConfirmCompany)}
        onClose={() => setToggleConfirmCompany(null)}
        onConfirm={handleConfirmToggle}
        title={
          toggleConfirmCompany?.isActive
            ? `Deactivate ${toggleConfirmCompany?.name}?`
            : `Activate ${toggleConfirmCompany?.name}?`
        }
        confirmText={
          toggleConfirmCompany?.isActive
            ? "Yes, Deactivate Company"
            : "Yes, Activate Company"
        }
        cancelText="Cancel"
        type={toggleConfirmCompany?.isActive ? "danger" : "default"}
        size="md"
      >
        <div className="space-y-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <div
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${
              toggleConfirmCompany?.isActive
                ? "border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20"
                : "border-primaryColor/20 bg-primaryColor/5"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                toggleConfirmCompany?.isActive
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-primaryColor dark:text-primaryColor-400"
              }`}
            />
            <div className="space-y-1">
              <p
                className={`font-bold text-xs sm:text-sm ${
                  toggleConfirmCompany?.isActive
                    ? "text-rose-900 dark:text-rose-200"
                    : "text-primaryColor-800 dark:text-primaryColor-300"
                }`}
              >
                Super Admin Company Status Action
              </p>
              <p
                className={`text-xs ${
                  toggleConfirmCompany?.isActive
                    ? "text-rose-800/80 dark:text-rose-300/80"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {toggleConfirmCompany?.isActive
                  ? `Deactivating "${toggleConfirmCompany?.name}" will disable access for all app users associated with this tenant workspace in applications and app_users.`
                  : `Activating "${toggleConfirmCompany?.name}" will re-enable platform access and workspace login for its registered app users.`}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Company:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {toggleConfirmCompany?.name} (#{toggleConfirmCompany?.id})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Plan:</span>
              {(() => {
                const toggleTheme = getPlanTheme(
                  toggleConfirmCompany?.planName,
                  toggleConfirmCompany?.isPremium
                );
                const ToggleIcon = toggleTheme.Icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${toggleTheme.badgeClass}`}
                  >
                    <ToggleIcon
                      className={`w-3 h-3 ${toggleTheme.iconColor}`}
                    />
                    <span>{toggleTheme.displayName}</span>
                  </span>
                );
              })()}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Users:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {toggleConfirmCompany?.totalUsers} members
              </span>
            </div>
          </div>
        </div>
      </ModalTw>

      {/* ─── 7. Company Details Modal ────────────────────────────────────── */}
      <ModalTw
        isOpen={showDetailModal && Boolean(selectedCompany)}
        show={showDetailModal && Boolean(selectedCompany)}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCompany(null);
        }}
        title="Subscriber Company Information"
        subTitle="Complete organization profile, subscription package, app users, and contact details"
        size="4xl"
        showFooter={false}
      >
        {selectedCompany && (
          <div className="space-y-4 py-2">
            {/* Top Company Profile Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gray-50/75 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <CompanyLogo
                  logo={selectedCompany.logo}
                  name={selectedCompany.name}
                  id={selectedCompany.id}
                  size="xl"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white truncate">
                      {selectedCompany.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      ID #{selectedCompany.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        selectedCompany.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedCompany.isActive
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        }`}
                      />
                      {selectedCompany.isActive
                        ? "Active Workspace"
                        : "Deactivated"}
                    </span>

                    {/* Plan Badge (Distinct Plan Color) */}
                    {(() => {
                      const modalPlanTheme = getPlanTheme(
                        selectedCompany.planName ||
                          selectedCompany.subscription?.planName,
                        selectedCompany.isPremium
                      );
                      const ModalPlanIcon = modalPlanTheme.Icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${modalPlanTheme.badgeClass} shadow-2xs`}
                        >
                          <ModalPlanIcon
                            className={`w-3.5 h-3.5 ${modalPlanTheme.iconColor}`}
                          />
                          <span>{modalPlanTheme.displayName}</span>
                        </span>
                      );
                    })()}

                    {/* Business Type */}
                    {selectedCompany.businessType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span>{selectedCompany.businessType}</span>
                      </span>
                    )}

                    {/* Company Size */}
                    {selectedCompany.companySize && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span>{selectedCompany.companySize} employees</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Workspace Stats */}
              <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-4 text-xs">
                <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider">
                  Workspace Users
                </span>
                <span className="font-extrabold text-base text-gray-900 dark:text-white mt-0.5">
                  {selectedCompany.activeUsers}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    / {selectedCompany.totalUsers} total
                  </span>
                </span>
                <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>
                    Joined{" "}
                    {selectedCompany.createdAt
                      ? helpers.dDateUtc(selectedCompany.createdAt, "D MMM YYYY")
                      : "—"}
                  </span>
                </span>
              </div>
            </div>

            {/* Modal Tabs: Workspace Overview & Purchase History */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                type="button"
                onClick={() => setDetailModalTab("overview")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  detailModalTab === "overview"
                    ? "bg-primaryColor text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Workspace Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalTab("purchases")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  detailModalTab === "purchases"
                    ? "bg-primaryColor text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Purchase & Billing History</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    detailModalTab === "purchases"
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {selectedCompany.purchaseHistory?.length || 0}
                </span>
              </button>
            </div>

            {/* TAB 1: Workspace Overview */}
            {detailModalTab === "overview" && (
              <div className="space-y-4">
                {/* 4 Rich Information Cards in 2x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

              {/* Card 1: Company Profile & Web Presence */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-7 h-7 rounded-lg bg-primaryColor/10 text-primaryColor flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                    Company Profile
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Official Email
                    </span>
                    {selectedCompany.email ? (
                      <a
                        href={`mailto:${selectedCompany.email}`}
                        className="font-semibold text-primaryColor dark:text-primaryColor-400 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedCompany.email}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 font-normal">
                        Not provided
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Official Phone
                    </span>
                    {selectedCompany.phone ? (
                      <a
                        href={`tel:${selectedCompany.phone}`}
                        className="font-semibold text-gray-800 dark:text-gray-200 hover:text-primaryColor flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedCompany.phone}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 font-normal">
                        Not provided
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Office Address
                    </span>
                    {selectedCompany.address ? (
                      <p className="text-gray-700 dark:text-gray-300 flex items-start gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{selectedCompany.address}</span>
                      </p>
                    ) : (
                      <span className="text-gray-400 font-normal">
                        Address not specified
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Website & Online Links
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {selectedCompany.websiteUrl ? (
                        <a
                          href={
                            selectedCompany.websiteUrl.startsWith("http")
                              ? selectedCompany.websiteUrl
                              : `https://${selectedCompany.websiteUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primaryColor/10 hover:text-primaryColor text-gray-700 dark:text-gray-300 transition text-[11px] font-semibold"
                        >
                          <Globe className="w-3 h-3 text-primaryColor" />
                          <span>Website</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ) : null}

                      {selectedCompany.facebookUrl ? (
                        <a
                          href={selectedCompany.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primaryColor/10 hover:text-primaryColor text-gray-700 dark:text-gray-300 transition text-[11px] font-semibold"
                        >
                          <span>Facebook</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ) : null}

                      {selectedCompany.linkedinUrl ? (
                        <a
                          href={selectedCompany.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primaryColor/10 hover:text-primaryColor text-gray-700 dark:text-gray-300 transition text-[11px] font-semibold"
                        >
                          <span>LinkedIn</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ) : null}

                      {!selectedCompany.websiteUrl &&
                        !selectedCompany.facebookUrl &&
                        !selectedCompany.linkedinUrl && (
                          <span className="text-gray-400 font-normal">
                            No links listed
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Subscription Plan Information (Distinct Color Theme) */}
              {(() => {
                const subPlanTheme = getPlanTheme(
                  selectedCompany.subscription?.planName ||
                    selectedCompany.planName,
                  selectedCompany.isPremium
                );
                const SubPlanIcon = subPlanTheme.Icon;

                return (
                  <div
                    className={`p-4 rounded-xl border ${subPlanTheme.cardBorder} ${subPlanTheme.cardBg} shadow-2xs space-y-3 transition-all`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg ${subPlanTheme.iconContainerClass} flex items-center justify-center`}
                        >
                          <SubPlanIcon
                            className={`w-3.5 h-3.5 ${subPlanTheme.iconColor}`}
                          />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                          Subscription Plan
                        </h4>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${subPlanTheme.badgeClass}`}
                      >
                        {subPlanTheme.displayName}
                      </span>
                    </div>

                    {selectedCompany.isPremium &&
                    selectedCompany.subscription ? (
                      <div className="space-y-2.5 text-xs">
                        <div
                          className={`flex items-center justify-between p-2.5 rounded-lg ${subPlanTheme.cardInnerBg} border ${subPlanTheme.cardInnerBorder}`}
                        >
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                              Package Tier
                            </span>
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                              {selectedCompany.subscription.planName ||
                                subPlanTheme.displayName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                              Rate
                            </span>
                            <span
                              className={`font-extrabold text-sm ${subPlanTheme.accentText}`}
                            >
                              {selectedCompany.subscription.currency || "BDT"}{" "}
                              {selectedCompany.subscription.monthlyPrice || 0} /
                              mo
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            className={`p-2 rounded-lg ${subPlanTheme.cardInnerBg} border ${subPlanTheme.cardInnerBorder}`}
                          >
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Start Date
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {selectedCompany.subscription.startDate
                                ? helpers.dDateUtc(
                                    selectedCompany.subscription.startDate,
                                    "D MMM YYYY"
                                  )
                                : "—"}
                            </span>
                          </div>

                          <div
                            className={`p-2 rounded-lg ${subPlanTheme.cardInnerBg} border ${subPlanTheme.cardInnerBorder}`}
                          >
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Renewal / Expiry
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {selectedCompany.subscription.endDate
                                ? helpers.dDateUtc(
                                    selectedCompany.subscription.endDate,
                                    "D MMM YYYY"
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-gray-400">Subscription Status:</span>
                          <span
                            className={`font-semibold capitalize flex items-center gap-1.5 ${
                              selectedCompany.isPurchased
                                ? "text-emerald-600 dark:text-emerald-400"
                                : selectedCompany.isTrial
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                selectedCompany.isPurchased
                                  ? "bg-emerald-500 animate-pulse"
                                  : selectedCompany.isTrial
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            {selectedCompany.isPurchased
                              ? "Paid & Active"
                              : selectedCompany.isTrial
                              ? "Trial Mode (Unpaid)"
                              : selectedCompany.isPending
                              ? "Pending Activation"
                              : selectedCompany.subscription.statusName ||
                                selectedCompany.subscription.statusCode ||
                                "Unpaid"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Payment Method:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {selectedCompany.subscription.paymentMethod || "Subscription"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Auto-Renewal:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {selectedCompany.subscription.autoRenew
                              ? "Enabled (Auto-renews)"
                              : "Manual Renewal"}
                          </span>
                        </div>

                        {selectedCompany.subscription.maxUsers && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              User Seat Limit:
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              Up to {selectedCompany.subscription.maxUsers}{" "}
                              seats
                            </span>
                          </div>
                        )}

                        {/* Invoice Breakdown if present */}
                        {(selectedCompany.latestInvoice || selectedCompany.latestSubInvoice) && (
                          <div
                            className={`p-2.5 rounded-lg border ${subPlanTheme.cardInnerBorder} ${subPlanTheme.cardInnerBg} space-y-1 mt-2`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-gray-500 dark:text-gray-400">
                                Latest Invoice:
                              </span>
                              <span className="font-mono text-gray-800 dark:text-gray-200">
                                {selectedCompany.latestInvoice?.invoiceNumber ||
                                  `SUB-INV-#${selectedCompany.latestSubInvoice?.id}`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400">Amount / Status:</span>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                BDT {selectedCompany.latestInvoice?.totalAmount || selectedCompany.latestSubInvoice?.amount || 0} (
                                <span
                                  className={`capitalize font-bold ${
                                    (selectedCompany.latestInvoice?.paymentStatus === "paid" ||
                                      selectedCompany.latestSubInvoice?.statusId === 38 ||
                                      selectedCompany.latestSubInvoice?.paidAt)
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-amber-600 dark:text-amber-400"
                                  }`}
                                >
                                  {selectedCompany.latestInvoice?.paymentStatus ||
                                    selectedCompany.latestInvoice?.status ||
                                    (selectedCompany.latestSubInvoice?.paidAt ? "paid" : "unpaid")}
                                </span>
                                )
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Trial Workspace</span>
                        </div>
                        <p className="text-amber-700/80 dark:text-amber-300/80 text-[11px] leading-relaxed">
                          This company operates on a complimentary trial workspace without
                          an active paid subscription. They have full access to evaluate system features.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Card 3: Workspace Owner & Super Admin */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-7 h-7 rounded-lg bg-primaryColor/10 text-primaryColor flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                    Workspace Owner
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Primary Administrator
                    </span>
                    <p className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                      {selectedCompany.owner?.name || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Direct Email
                    </span>
                    {selectedCompany.owner?.email ? (
                      <a
                        href={`mailto:${selectedCompany.owner.email}`}
                        className="font-semibold text-primaryColor dark:text-primaryColor-400 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedCompany.owner.email}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 font-normal">
                        No email available
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block">
                      Direct Phone
                    </span>
                    {selectedCompany.owner?.phone ? (
                      <a
                        href={`tel:${selectedCompany.owner.phone}`}
                        className="font-semibold text-gray-800 dark:text-gray-200 hover:text-primaryColor flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{selectedCompany.owner.phone}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 font-normal">
                        No phone available
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primaryColor/10 text-primaryColor dark:text-primaryColor-400 border border-primaryColor/20">
                      <UserCheck className="w-3 h-3" />
                      Tenant Account Administrator
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: App Users & Workspace Capacity */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-7 h-7 rounded-lg bg-primaryColor/10 text-primaryColor flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                    Workspace Users & Capacity
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Active Users
                      </span>
                      <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                        {selectedCompany.activeUsers}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Total Registered
                      </span>
                      <span className="font-extrabold text-base text-gray-900 dark:text-white">
                        {selectedCompany.totalUsers}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar of active users */}
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                      <span>Active Seat Ratio</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {selectedCompany.totalUsers > 0
                          ? Math.round(
                              (selectedCompany.activeUsers /
                                selectedCompany.totalUsers) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-primaryColor rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            selectedCompany.totalUsers > 0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (selectedCompany.activeUsers /
                                      selectedCompany.totalUsers) *
                                      100
                                  )
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    {selectedCompany.isActive
                      ? "All active members can authenticate and access tenant workspace resources."
                      : "Workspace is deactivated. Member access is currently blocked."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Billing Summary Box in Overview */}
            <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Billing & Purchase Records</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                      {selectedCompany.purchaseHistory?.length || 0} Total Invoices
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {(selectedCompany.purchaseHistory?.length || 0) > 0
                      ? `Total amount billed: BDT ${(selectedCompany.purchaseHistory || []).reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0).toLocaleString()} across ${(selectedCompany.purchaseHistory || []).length} billing invoices.`
                      : "No transaction invoices registered for this company yet."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalTab("purchases")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primaryColor text-primaryColor text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
              >
                <span>View Full Purchase Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Company Purchase & Billing History */}
        {detailModalTab === "purchases" && (() => {
          const history = Array.isArray(selectedCompany.purchaseHistory)
            ? selectedCompany.purchaseHistory
            : [];
          const totalInvoices = history.length;
          const totalBilled = history.reduce(
            (sum, inv) => sum + Number(inv.totalAmount || 0),
            0
          );
          const paidInvoices = history.filter(
            (inv) => inv.paymentStatus === "paid" || inv.status === "paid"
          );
          const paidAmount = paidInvoices.reduce(
            (sum, inv) => sum + Number(inv.totalAmount || 0),
            0
          );
          const pendingInvoices = history.filter(
            (inv) => inv.paymentStatus !== "paid" && inv.status !== "paid"
          );

          return (
            <div className="space-y-4">
              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <span>Total Invoices</span>
                    <Receipt className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                    {totalInvoices}
                  </p>
                  <span className="text-[10px] text-gray-400">All recorded orders</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <span>Total Billed</span>
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    BDT {totalBilled.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-gray-400">Gross transaction sum</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <span>Paid & Settled</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    BDT {paidAmount.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    {paidInvoices.length} invoices cleared
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <span>Pending / Due</span>
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
                    {pendingInvoices.length}
                  </p>
                  <span className="text-[10px] text-gray-400">Awaiting payment</span>
                </div>
              </div>

              {/* Invoice List */}
              {history.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                    No Purchase History Found
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    This company has not completed any paid plan transactions yet. They are currently registered on a complimentary trial workspace.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {history.map((inv, idx) => {
                    const isPaid = inv.paymentStatus === "paid" || inv.status === "paid";
                    const isCancelled = inv.status === "cancelled";
                    const invPlanTheme = getPlanTheme(inv.planName, true);
                    const InvPlanIcon = invPlanTheme.Icon;

                    return (
                      <div
                        key={inv.id || idx}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] shadow-2xs hover:border-gray-300 dark:hover:border-gray-600 transition space-y-3"
                      >
                        {/* Invoice Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="w-7 h-7 rounded-lg bg-primaryColor/10 text-primaryColor flex items-center justify-center shrink-0">
                              <Receipt className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                  {inv.invoiceNumber || `INV-#${inv.id}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(inv.invoiceNumber || inv.id, `inv-${inv.id}`)}
                                  className="text-gray-400 hover:text-primaryColor transition p-0.5 cursor-pointer"
                                  title="Copy Invoice Number"
                                >
                                  {copiedTxnId === `inv-${inv.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>
                                  {inv.createdAt
                                    ? helpers.dDateUtc(inv.createdAt, "D MMM YYYY, h:mm A")
                                    : "—"}
                                </span>
                              </span>
                            </div>

                            {/* Plan Badge */}
                            {inv.planName ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${invPlanTheme.badgeClass}`}
                              >
                                <InvPlanIcon className={`w-3 h-3 ${invPlanTheme.iconColor}`} />
                                <span>{inv.planName}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                Subscription Invoice
                              </span>
                            )}
                          </div>

                          {/* Right: Amount & Status */}
                          <div className="flex items-center sm:items-end justify-between sm:justify-start gap-3">
                            <div className="sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                                Amount
                              </span>
                              <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                                {inv.currency || "BDT"}{" "}
                                {Number(inv.totalAmount || 0).toLocaleString()}
                              </span>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                isPaid
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60"
                                  : isCancelled
                                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60"
                                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPaid
                                    ? "bg-emerald-500"
                                    : isCancelled
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              <span>{inv.paymentStatus || inv.status || "unpaid"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Invoice Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                          <div className="p-2 rounded-lg bg-gray-50/75 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Transaction ID
                            </span>
                            {inv.transactionId ? (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                                  {inv.transactionId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(inv.transactionId, `txn-${inv.id}`)}
                                  className="text-gray-400 hover:text-primaryColor p-0.5 cursor-pointer shrink-0"
                                  title="Copy Transaction ID"
                                >
                                  {copiedTxnId === `txn-${inv.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400">Manual / N/A</span>
                            )}
                          </div>

                          <div className="p-2 rounded-lg bg-gray-50/75 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Payment Gateway
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize mt-0.5 block truncate">
                              {inv.gateway || inv.paymentMethod || "Subscription Billing"}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-gray-50/75 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Payment Settlement
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                              {inv.paidAt
                                ? helpers.dDateUtc(inv.paidAt, "D MMM YYYY, h:mm A")
                                : "Awaiting settlement"}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-gray-50/75 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">
                              Due Date
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                              {inv.dueDate
                                ? helpers.dDateUtc(inv.dueDate, "D MMM YYYY")
                                : "—"}
                            </span>
                          </div>
                        </div>

                        {/* Download PDF Invoice Action */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-gray-400">
                            {inv.billingPeriodStart && inv.billingPeriodEnd
                              ? `Period: ${helpers.dDateUtc(inv.billingPeriodStart, "D MMM YYYY")} — ${helpers.dDateUtc(inv.billingPeriodEnd, "D MMM YYYY")}`
                              : "Official Subscription Tax Invoice"}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(inv)}
                            disabled={downloadingInvoiceId === inv.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primaryColor transition cursor-pointer"
                          >
                            {downloadingInvoiceId === inv.id ? (
                              <RotateCw className="w-3.5 h-3.5 animate-spin text-primaryColor" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-primaryColor" />
                            )}
                            <span>
                              {downloadingInvoiceId === inv.id
                                ? "Downloading..."
                                : "Download Invoice PDF"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}


            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <div>
                <ButtonTw
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetailModal(false);
                    setToggleConfirmCompany(selectedCompany);
                  }}
                  className={`text-xs font-semibold gap-1.5 ${
                    selectedCompany.isActive
                      ? "text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
                      : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/30"
                  }`}
                >
                  {selectedCompany.isActive ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Deactivate Workspace</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Activate Workspace</span>
                    </>
                  )}
                </ButtonTw>
              </div>

              <ButtonTw
                variant="alternative"
                size="sm"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCompany(null);
                }}
                className="text-xs font-semibold px-4"
              >
                Close
              </ButtonTw>
            </div>
          </div>
        )}
      </ModalTw>
    </div>
  );
}
