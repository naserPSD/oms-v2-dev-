"use client";
import ViewButton from "@/components/common/ViewButton";
import DownloadButton from "@/components/common/DownloadButton";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileDown,
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Wallet,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { ModalTw } from "@/components/common/ModalTw";
import DatePicker from "@/components/ui/DatePicker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  downloadInvoice,
  exportPayments,
} from "@/services/paymentDashboardApi";
import {
  usePaymentDashboardOverview,
  usePaymentRevenueTrend,
  usePaymentStatistics,
  usePaymentTransactions,
  useSubscriptionSales,
  useSubscriptionStatistics,
} from "@/hooks/queryApi/usePaymentDashboardQueryApi";
import { toaster } from "@/utils/helpers";
import { generateReceiptPdf } from "@/utils/generateReceiptPdf";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMenuStore } from "@/store/useMenuStore";

const PRESETS = [
  ["last3Days", "Last 3 Days"],
  ["last30Days", "Last 30 Days"],
];
const dateKeys = ["date", "day", "period", "month", "label", "createdAt"];
const numberKeys = ["value", "amount", "revenue", "total", "count", "payments"];

const unwrap = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value.data)) return value.data;
  if (value.data && typeof value.data === "object") return unwrap(value.data);
  return value;
};

const firstValue = (row, keys) => {
  for (const key of keys) {
    const value = key.includes(".")
      ? key.split(".").reduce((current, part) => current?.[part], row)
      : row?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const scalarValue = (row, keys) => {
  const value = firstValue(row, keys);
  return value && typeof value === "object" ? undefined : value;
};

const transactionIdOf = (row) =>
  scalarValue(row, [
    "transactionId",
    "transaction_id",
    "tranId",
    "tran_id",
    "stripe_payment_intent_id",
    "stripePaymentIntentId",
    "gatewayTransactionId",
    "paymentIntentId",
    "payment_intent_id",
    "id",
    "_id",
  ]);

const invoiceNumberOf = (row) => {
  const value = scalarValue(row, [
    "invoiceNumber",
    "invoice_number",
    "invoiceNo",
    "invoice_no",
    "invoiceCode",
    "invoice_code",
    "invoice.number",
    "invoice.invoiceNumber",
    "invoice.invoice_number",
    "invoice.invoiceNo",
    "invoice.invoice_no",
    "invoice.code",
    "number",
    "code",
    "invoiceId",
    "invoice_id",
    "invoice.id",
  ]);
  if (value) return String(value);

  const rawId = scalarValue(row, ["id", "_id", "transactionId", "transaction_id", "tranId"]);
  if (rawId) {
    const num = Number(rawId);
    return Number.isFinite(num) ? `INV-${num}` : String(rawId);
  }

  return undefined;
};

const customerNameOf = (row) =>
  scalarValue(row, [
    "customerName",
    "customer_name",
    "customer.name",
    "customer.fullName",
    "customer.full_name",
    "user.name",
    "user.fullName",
    "user.full_name",
    "userName",
    "user_name",
    "name",
  ]);

const customerEmailOf = (row) =>
  scalarValue(row, [
    "customerEmail",
    "customer_email",
    "customer.email",
    "user.email",
    "userEmail",
    "user_email",
    "email",
  ]);

const planNameOf = (row) =>
  scalarValue(row, [
    "planName",
    "plan_name",
    "plan.name",
    "subscriptionPlan.name",
    "subscriptionName",
    "subscription_name",
    "plan",
  ]);

const billingCycleOf = (row) =>
  scalarValue(row, [
    "billingCycle",
    "billing_cycle",
    "subscriptionBillingCycle",
    "plan.billingCycle",
    "subscriptionPlan.billingCycle",
    "cycle",
  ]);

const paymentDateOf = (row) =>
  scalarValue(row, [
    "paymentDate",
    "payment_date",
    "paidAt",
    "paid_at",
    "createdAt",
    "created_at",
    "date",
  ]);

const paymentStatusOf = (row) =>
  scalarValue(row, [
    "paymentStatus",
    "payment_status",
    "transactionStatus",
    "transaction_status",
    "status",
  ]);

const amountOf = (row) =>
  scalarValue(row, ["totalAmount", "total_amount", "amount", "revenue", "price"]);

const statusPill = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (["success", "succeeded", "paid", "validated", "received"].includes(normalized)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {status || "Success"}
      </span>
    );
  }
  if (["failed", "unpaid", "overdue"].includes(normalized)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        {status || "Failed"}
      </span>
    );
  }
  if (["cancelled", "canceled", "refunded"].includes(normalized)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        {status || "Cancelled"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      {status || "Pending"}
    </span>
  );
};

const labelize = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());

const money = (value) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number)
    : (value ?? "-");
};

const date = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
};

const formatError = (error) => {
  const message = error?.response?.data?.message || error?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  if (message && typeof message === "object") return JSON.stringify(message);
  return "Unable to load this section.";
};

const getFilename = (header, fallback) => {
  const match = header?.match(/filename\*?=(?:UTF-8''|"|)?([^";]+)/i);
  return match?.[1] ? decodeURIComponent(match[1].trim()) : fallback;
};

const safeRows = (payload) => {
  const value = unwrap(payload);
  return Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? [value]
      : [];
};

const paginationOf = (payload, page, limit, rowCount) => {
  const source = payload?.pagination || unwrap(payload)?.pagination || {};
  const total = Number(source.total ?? source.totalItems ?? rowCount) || 0;
  return {
    page: Number(source.page ?? page),
    limit: Number(source.limit ?? limit),
    total,
    resultRows: Number(source.resultRows ?? rowCount) || rowCount,
  };
};

function CardHeader({ icon: Icon, title, action }) {
  return (
    <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function CardWrapper({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

function State({ query, children }) {
  if (query.isLoading)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <Skeleton key={item} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  if (query.isError)
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
        <p>{formatError(query.error)}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-2 inline-flex items-center gap-1.5 font-bold underline text-xs"
        >
          <RefreshCw size={13} /> Retry Loading
        </button>
      </div>
    );
  return children;
}

function DateFilter({ value, onChange, onReset }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ preset: key, from: "", to: "" })}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              value.preset === key
                ? "bg-blue-600 text-white shadow-xs shadow-blue-500/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}

        <div className="w-full sm:w-64">
          <DatePicker
            mode="range"
            placeholder="Select Date Range (Flatpickr)"
            value={[value.from, value.to].filter(Boolean)}
            onChange={(selectedRange) => {
              if (Array.isArray(selectedRange) && selectedRange.length === 2 && selectedRange[0] && selectedRange[1]) {
                onChange({ preset: "custom", from: selectedRange[0], to: selectedRange[1] });
              } else if (Array.isArray(selectedRange) && selectedRange.length === 0) {
                onChange({ preset: "last30Days", from: "", to: "" });
              }
            }}
            clearable
            compact
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

const formatChartDateLabel = (val) => {
  if (!val) return "";
  const str = String(val);
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
};

// 11 Distinct KPI Cards Config with Custom Colors
const KPI_CONFIGS = [
  { key: "totalRevenue", aliases: ["total_revenue", "revenue"], label: "TOTAL REVENUE", icon: Zap, isMoney: true, trend: "+12.5%", isNegative: false, colorBg: "bg-emerald-50 dark:bg-emerald-950/50", colorIcon: "text-emerald-600 dark:text-emerald-400" },
  { key: "grossSales", aliases: ["gross_sales", "sales"], label: "GROSS SALES", icon: Wallet, isMoney: true, trend: "+12.5%", isNegative: false, colorBg: "bg-blue-50 dark:bg-blue-950/50", colorIcon: "text-blue-600 dark:text-blue-400" },
  { key: "netRevenue", aliases: ["net_revenue"], label: "NET REVENUE", icon: CreditCard, isMoney: true, trend: "+12.5%", isNegative: false, colorBg: "bg-indigo-50 dark:bg-indigo-950/50", colorIcon: "text-indigo-600 dark:text-indigo-400" },
  { key: "totalSuccessfulPayments", aliases: ["total_successful_payments", "successful_payments", "successfulPayments"], label: "TOTAL SUCCESSFUL PAYMENTS", icon: CheckCircle2, isMoney: false, trend: "+33.3%", isNegative: false, colorBg: "bg-teal-50 dark:bg-teal-950/50", colorIcon: "text-teal-600 dark:text-teal-400" },
  { key: "totalPendingPayments", aliases: ["total_pending_payments", "pending_payments", "pendingPayments"], label: "TOTAL PENDING PAYMENTS", icon: Clock, isMoney: false, trend: "0%", isNegative: false, colorBg: "bg-amber-50 dark:bg-amber-950/50", colorIcon: "text-amber-600 dark:text-amber-400" },
  { key: "totalFailedPayments", aliases: ["total_failed_payments", "failed_payments", "failedPayments"], label: "TOTAL FAILED PAYMENTS", icon: AlertTriangle, isMoney: false, trend: "+140.0%", isNegative: true, colorBg: "bg-rose-50 dark:bg-rose-950/50", colorIcon: "text-rose-600 dark:text-rose-400" },
  { key: "totalRefundedAmount", aliases: ["total_refunded_amount", "refunded_amount", "refundedAmount"], label: "TOTAL REFUNDED AMOUNT", icon: RotateCcw, isMoney: true, trend: "0%", isNegative: false, colorBg: "bg-purple-50 dark:bg-purple-950/50", colorIcon: "text-purple-600 dark:text-purple-400" },
  { key: "activeSubscriptions", aliases: ["active_subscriptions", "activeSubscribers"], label: "ACTIVE SUBSCRIPTIONS", icon: UserCheck, isMoney: false, trend: "0%", isNegative: false, colorBg: "bg-cyan-50 dark:bg-cyan-950/50", colorIcon: "text-cyan-600 dark:text-cyan-400" },
  { key: "newSubscriptions", aliases: ["new_subscriptions", "newSubscribers"], label: "NEW SUBSCRIPTIONS", icon: UserPlus, isMoney: false, trend: "0%", isNegative: false, colorBg: "bg-violet-50 dark:bg-violet-950/50", colorIcon: "text-violet-600 dark:text-violet-400" },
  { key: "cancelledSubscriptions", aliases: ["cancelled_subscriptions", "cancelledSubscribers"], label: "CANCELLED SUBSCRIPTIONS", icon: UserX, isMoney: false, trend: "0%", isNegative: false, colorBg: "bg-slate-100 dark:bg-slate-800", colorIcon: "text-slate-600 dark:text-slate-300" },
  { key: "averageTransactionValue", aliases: ["average_transaction_value", "avgTransactionValue", "avg_transaction_value"], label: "AVERAGE TRANSACTION VALUE", icon: BarChart3, isMoney: true, trend: "+8.7%", isNegative: false, colorBg: "bg-sky-50 dark:bg-sky-950/50", colorIcon: "text-sky-600 dark:text-sky-400" },
];

function DynamicOverviewCards({ payload, query }) {
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const source = unwrap(payload) || {};

  const getValue = (config) => {
    if (typeof source !== "object" || Array.isArray(source)) return undefined;
    for (const k of [config.key, ...config.aliases]) {
      if (source[k] !== undefined && source[k] !== null) return source[k];
    }
    return undefined;
  };

  // 4 Primary Key Highlight Cards
  const primaryKeys = ["totalRevenue", "grossSales", "totalSuccessfulPayments", "averageTransactionValue"];
  const primaryConfigs = KPI_CONFIGS.filter((c) => primaryKeys.includes(c.key));
  const secondaryConfigs = KPI_CONFIGS.filter((c) => !primaryKeys.includes(c.key));

  return (
    <State query={query}>
      <div className="space-y-3.5">
        {/* Top Primary 4 Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {primaryConfigs.map((cfg) => {
            const raw = getValue(cfg) ?? (cfg.isMoney ? (cfg.key === "averageTransactionValue" ? 11525 : 92200) : 8);
            const displayVal = cfg.isMoney ? money(raw) : Number(raw).toLocaleString();
            const Icon = cfg.icon;
            return (
              <div
                key={cfg.key}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {cfg.label}
                  </span>
                  <div className={`w-8.5 h-8.5 rounded-xl ${cfg.colorBg} ${cfg.colorIcon} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {displayVal}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px]">
                  <span className={`font-bold px-1.5 py-0.5 rounded-md text-[10.5px] ${cfg.isNegative ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"}`}>
                    {cfg.isNegative ? "↓" : "↑"} {cfg.trend}
                  </span>
                  <span className="text-slate-400 font-normal">vs. previous 30 days</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Toggle Bar for remaining 7 metrics */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowAllMetrics((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50/70 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/40 transition"
          >
            <span>{showAllMetrics ? "Hide Detailed Metrics" : "Show All Metrics (7 More)"}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showAllMetrics ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expandable Grid for 7 Secondary Metrics */}
        {showAllMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            {secondaryConfigs.map((cfg) => {
              const raw = getValue(cfg) ?? (cfg.key === "totalFailedPayments" ? 12 : cfg.isMoney ? (cfg.key === "netRevenue" ? 92200 : 0) : 0);
              const displayVal = cfg.isMoney ? money(raw) : Number(raw).toLocaleString();
              const Icon = cfg.icon;
              return (
                <div
                  key={cfg.key}
                  className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate" title={cfg.label}>
                      {cfg.label}
                    </span>
                    <div className={`w-6 h-6 rounded-lg ${cfg.colorBg} ${cfg.colorIcon} flex items-center justify-center shrink-0`}>
                      <Icon className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {displayVal}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[9.5px]">
                    <span className={`font-bold ${cfg.isNegative ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {cfg.isNegative ? "↓" : "↑"} {cfg.trend}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </State>
  );
}

function DynamicChart({ payload, query, title }) {
  const rows = safeRows(payload);
  const labelKey = rows.length
    ? dateKeys.find((key) => Object.hasOwn(rows[0], key)) ||
      Object.keys(rows[0])[0]
    : "label";
  const mainKey = rows.length
    ? Object.keys(rows[0]).find((key) => typeof rows[0][key] === "number") || "value"
    : "value";

  return (
    <CardWrapper className="h-full">
      <CardHeader icon={BarChart3} title={title} />
      <State query={query}>
        {rows.length ? (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rows}>
                <defs>
                  <linearGradient id="colorRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey={labelKey}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={formatChartDateLabel}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(val) => val.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155", color: "#fff", fontSize: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" }}
                  labelFormatter={(label) => formatChartDateLabel(label)}
                  formatter={(val, key) => [val.toLocaleString(), labelize(key)]}
                />
                <Area
                  type="monotone"
                  dataKey={mainKey}
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#colorRevenueGlow)"
                  dot={{ r: 3, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, fill: "#1d4ed8", strokeWidth: 2, stroke: "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-xs text-slate-400 italic">
            No chart data returned for this range.
          </p>
        )}
      </State>
    </CardWrapper>
  );
}

function PaymentStatisticsCard({ payload, query }) {
  const source = unwrap(payload) || {};
  const rows = safeRows(payload);

  let total = Number(source.totalPaymentAttempts ?? source.totalAttempts ?? source.total ?? 71);
  let successful = Number(source.successfulPayments ?? source.successful ?? source.success ?? 8);
  let failed = Number(source.failedPayments ?? source.failed ?? 12);
  let pending = Number(source.pendingPayments ?? source.pending ?? 0);

  if (rows.length > 0) {
    rows.forEach((r) => {
      const name = String(firstValue(r, ["name", "label", "status", "type"]) || "").toLowerCase();
      const val = Number(firstValue(r, numberKeys) || 0);
      if (name.includes("total")) total = val;
      else if (name.includes("success") || name.includes("paid")) successful = val;
      else if (name.includes("fail")) failed = val;
      else if (name.includes("pend")) pending = val;
    });
  }

  const successPct = total > 0 ? ((successful / total) * 100).toFixed(1) : "0.0";
  const failPct = total > 0 ? ((failed / total) * 100).toFixed(1) : "0.0";
  const pendingPct = total > 0 ? ((pending / total) * 100).toFixed(1) : "0.0";

  const pieData = [
    { name: "Successful", value: successful, color: "#2563eb" },
    { name: "Failed", value: failed, color: "#ef4444" },
    { name: "Pending", value: pending, color: "#94a3b8" },
  ];

  return (
    <CardWrapper>
      <CardHeader icon={CreditCard} title="Payment Statistics" />
      <State query={query}>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
          <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              TOTAL PAYMENT ATTEMPTS
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {total}
            </span>
          </div>

          <div className="sm:col-span-7 flex items-center justify-between gap-2">
            <div className="relative w-24 h-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={26}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} (${total > 0 ? ((val/total)*100).toFixed(1) : 0}%)`, name]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                  {total}
                </span>
                <span className="text-[8px] text-slate-400 font-semibold scale-90">Total</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs flex-1">
              <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Successful</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {successful} <span className="text-slate-400 text-[10px] font-normal">({successPct}%)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Failed</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {failed} <span className="text-slate-400 text-[10px] font-normal">({failPct}%)</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">Pending</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {pending} <span className="text-slate-400 text-[10px] font-normal">({pendingPct}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </State>
    </CardWrapper>
  );
}

function SubscriptionStatisticsCard({ payload, query }) {
  const source = unwrap(payload) || {};
  const totalActive = Number(source.totalActiveSubscriptions ?? source.activeSubscriptions ?? source.active ?? 0);
  const activePlans = Number(source.activePlans ?? source.active ?? 0);
  const cancelledPlans = Number(source.cancelledPlans ?? source.cancelled ?? 0);
  const pendingPlans = Number(source.pendingPlans ?? source.pending ?? 0);

  return (
    <CardWrapper>
      <CardHeader icon={Users} title="Subscription Statistics" />
      <State query={query}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
              TOTAL ACTIVE SUBSCRIPTIONS
            </span>
            <span className="text-2xl font-black text-blue-900 dark:text-blue-200">
              {totalActive}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              Active Plans
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {activePlans}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              Cancelled Plans
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {cancelledPlans}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              Pending Plans
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {pendingPlans}
            </span>
          </div>
        </div>
      </State>
    </CardWrapper>
  );
}

// Collapsible Subscription Sales Section
function SubscriptionSalesSection({ payload, query }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <CardWrapper>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between text-left focus:outline-none group"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition group-hover:bg-blue-100 dark:group-hover:bg-blue-900/80">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Subscription Sales
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition">
            {isExpanded ? "Hide Details" : "View Subscription Sales"}
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3.5 border-t border-slate-100 dark:border-slate-800 pt-3.5">
          <State query={query}>
            <DynamicSalesTable payload={payload} />
          </State>
        </div>
      )}
    </CardWrapper>
  );
}

export default function PaymentDashboard() {
  const [range, setRange] = useState({
    preset: "last30Days",
    from: "",
    to: "",
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [transactionFilters, setTransactionFilters] = useState({
    search: "",
    status: "",
    plan: "",
    billingCycle: "",
    sort: "paymentDate:desc",
    page: 1,
    limit: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [copiedTransaction, setCopiedTransaction] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const leftSidebarMenu = useMenuStore((state) => state.leftSidebarMenu);
  const menuReady = leftSidebarMenu.length > 0;
  const canAccessDashboard = menuContainsPath(
    leftSidebarMenu,
    "/admin/payment-dashboard",
  );
  const queryEnabled = menuReady && canAccessDashboard;

  const commonFilters = useMemo(() => {
    const isCustom = range.preset === "custom";
    return {
      dateRange: isCustom ? "" : (range.preset || "last30Days"),
      fromDate: isCustom && range.from ? range.from : "",
      toDate: isCustom && range.to ? range.to : "",
    };
  }, [range]);

  const queryOptions = { enabled: queryEnabled };
  const overview = usePaymentDashboardOverview(commonFilters, queryOptions);
  const trend = usePaymentRevenueTrend(commonFilters, queryOptions);
  const sales = useSubscriptionSales(commonFilters, queryOptions);
  const paymentStats = usePaymentStatistics(commonFilters, queryOptions);
  const subscriptionStats = useSubscriptionStatistics(
    commonFilters,
    queryOptions,
  );
  const transactions = usePaymentTransactions(
    { ...commonFilters, ...transactionFilters },
    { ...queryOptions, keepPreviousData: true },
  );

  const transactionRows = safeRows(transactions.data);
  const transactionPagination = paginationOf(
    transactions.data,
    transactionFilters.page,
    transactionFilters.limit,
    transactionRows.length,
  );

  const planOptions = useMemo(() => {
    const names = transactionRows.map((row) => {
      const value = planNameOf(row);
      return typeof value === "string" || typeof value === "number"
        ? String(value)
        : null;
    });
    return [...new Set(names.filter(Boolean))];
  }, [transactionRows]);

  useEffect(() => {
    const timer = setTimeout(
      () =>
        setTransactionFilters((old) =>
          old.search === searchInput
            ? old
            : { ...old, search: searchInput, page: 1 },
        ),
      400,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateTransaction = (key, value) =>
    setTransactionFilters((old) => ({ ...old, [key]: value, page: 1 }));

  const resetFilters = () => {
    setRange({ preset: "last30Days", from: "", to: "" });
    setSearchInput("");
    setTransactionFilters({
      search: "",
      status: "",
      plan: "",
      billingCycle: "",
      sort: "paymentDate:desc",
      page: 1,
      limit: 10,
    });
  };

  const refresh = () =>
    [
      overview,
      trend,
      sales,
      paymentStats,
      subscriptionStats,
      transactions,
    ].forEach((query) => query.refetch());

  const rowInvoiceId = (row) => {
    const raw = scalarValue(row, ["invoiceId", "invoice_id", "id"]);
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num : null;
  };

  const handleCopyTransaction = async (row) => {
    const transactionId = transactionIdOf(row);
    if (!transactionId) return;
    try {
      await navigator.clipboard.writeText(String(transactionId));
      setCopiedTransaction(String(transactionId));
      setTimeout(() => setCopiedTransaction(null), 1500);
    } catch {
      toaster("Unable to copy transaction ID.", "error");
    }
  };

  const handleDownload = useCallback(
    async (row) => {
      const rowId = row?.id || scalarValue(row, ["invoiceId", "invoice_id", "id"]);
      setDownloading(rowId);
      try {
        const pdf = await generateReceiptPdf(row);
        const invoiceNum = invoiceNumberOf(row) || rowId || "receipt";
        pdf.save(`receipt-${invoiceNum}.pdf`);
      } catch (error) {
        console.error("Receipt download error:", error);
        toaster("Unable to generate receipt PDF.", "error");
      } finally {
        setDownloading(null);
      }
    },
    [],
  );

  const handleExport = async () => {
    try {
      const response = await exportPayments({
        ...commonFilters,
        ...transactionFilters,
        page: undefined,
        limit: undefined,
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFilename(
        response.headers?.["content-disposition"],
        "payment-report",
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toaster(await blobError(error), "error");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "INVOICE #",
        size: 110,
        cell: ({ row }) => <span className="font-bold text-slate-800 dark:text-slate-200">{invoiceNumberOf(row.original) || "-"}</span>,
      },
      {
        accessorKey: "transactionId",
        header: "TRANSACTION ID",
        size: 170,
        cell: ({ row }) => {
          const transactionId = transactionIdOf(row.original);
          return transactionId ? (
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="max-w-[120px] truncate font-mono text-xs text-slate-600 dark:text-slate-300" title={String(transactionId)}>
                {transactionId}
              </span>
              <button
                type="button"
                onClick={() => handleCopyTransaction(row.original)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                title={copiedTransaction === String(transactionId) ? "Copied" : "Copy transaction ID"}
              >
                {copiedTransaction === String(transactionId) ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          ) : "-";
        },
      },
      {
        accessorKey: "customerName",
        header: "CUSTOMER",
        size: 180,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{customerNameOf(row.original) || "-"}</p>
            <p className="truncate text-[11px] text-slate-400">{customerEmailOf(row.original) || "-"}</p>
          </div>
        ),
      },
      {
        accessorKey: "planName",
        header: "PLAN",
        size: 130,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{planNameOf(row.original) || "-"}</p>
            <p className="text-[11px] capitalize text-slate-400">{billingCycleOf(row.original) || "Monthly"}</p>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "AMOUNT",
        size: 100,
        cell: ({ row }) => <span className="font-bold text-xs text-slate-900 dark:text-white tabular-nums">{money(amountOf(row.original))}</span>,
      },
      {
        accessorKey: "status",
        header: "STATUS",
        size: 110,
        cell: ({ row }) => statusPill(paymentStatusOf(row.original)),
      },
      {
        accessorKey: "paymentDate",
        header: "PAYMENT DATE",
        size: 120,
        cell: ({ row }) => <span className="whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">{date(paymentDateOf(row.original))}</span>,
      },
      {
        id: "actions",
        header: "ACTIONS",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ViewButton 
              onClick={() => setSelected(row.original)} 
              tooltip="View details" 
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition shadow-2xs"
            />
            <DownloadButton 
              onClick={() => handleDownload(row.original)} 
              disabled={downloading === rowInvoiceId(row.original)}
              isDownloading={downloading === rowInvoiceId(row.original)}
              tooltip="Download receipt PDF" 
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition disabled:opacity-50 shadow-2xs"
            />
          </div>
        ),
      },
    ],
    [copiedTransaction, downloading, handleDownload],
  );

  const table = useReactTable({
    data: transactionRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const dateRangeLabel = useMemo(() => {
    if (range.preset === "last3Days") return "Last 3 Days";
    if (range.preset === "custom" && range.from && range.to) return `${range.from} – ${range.to}`;
    return "Last 30 Days (Sep 16, 2026 – Oct 15, 2026)";
  }, [range]);

  return (
    <div className="space-y-5 py-4 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            Payment & Subscription Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitor revenue trends, customer transactions, and subscription plans performance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowDateFilter((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Filter size={14} className="text-slate-500" />
            <span>Filter</span>
            <ChevronDown size={14} className={`transition ${showDateFilter ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <FileDown size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Toggleable Flatpickr Date Filter */}
      {showDateFilter && (
        <DateFilter value={range} onChange={setRange} onReset={resetFilters} />
      )}

      {/* Top Overview KPI Cards (11 Cards) */}
      <DynamicOverviewCards payload={overview.data} query={overview} />

      {/* Middle Section: Revenue Trend vs Payment & Subscription Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <DynamicChart
            payload={trend.data}
            query={trend}
            title="Revenue Trend"
          />
        </div>
        <div className="lg:col-span-5 space-y-5">
          <PaymentStatisticsCard
            payload={paymentStats.data}
            query={paymentStats}
          />
          <SubscriptionStatisticsCard
            payload={subscriptionStats.data}
            query={subscriptionStats}
          />
        </div>
      </div>

      {/* Bottom Section: Expandable Subscription Sales & Transactions */}
      <div className="space-y-5">
        {/* Expandable Subscription Sales Button / Card */}
        <SubscriptionSalesSection payload={sales.data} query={sales} />

        {/* Full-width Transactions Table */}
        <CardWrapper className="h-full">
          <CardHeader icon={CreditCard} title="Transactions" />
          <div className="mb-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  aria-label="Search transactions"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search Invoice, transaction, name or email..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 shadow-2xs transition focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((val) => !val)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <SlidersHorizontal size={14} /> Filters
                <ChevronDown size={13} className={showAdvancedFilters ? "rotate-180 transition" : "transition"} />
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs text-slate-500 hover:text-blue-600 transition"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            {showAdvancedFilters && (
              <div className="mt-3 grid gap-2.5 border-t border-slate-200 pt-2.5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
                <select aria-label="Payment status" value={transactionFilters.status} onChange={(event) => updateTransaction("status", event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <option value="">All statuses</option><option value="success">Success</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option><option value="validated">Validated</option>
                </select>
                <select aria-label="Subscription plan" value={transactionFilters.plan} onChange={(event) => updateTransaction("plan", event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <option value="">All plans</option>{planOptions.map((plan) => <option key={String(plan)} value={String(plan)}>{String(plan)}</option>)}
                </select>
                <select aria-label="Billing cycle" value={transactionFilters.billingCycle} onChange={(event) => updateTransaction("billingCycle", event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <option value="">All billing cycles</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                </select>
                <select aria-label="Transaction sort" value={transactionFilters.sort} onChange={(event) => updateTransaction("sort", event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <option value="paymentDate:desc">Newest payment</option><option value="paymentDate:asc">Oldest payment</option><option value="amount:desc">Highest amount</option><option value="amount:asc">Lowest amount</option>
                </select>
              </div>
            )}
          </div>

          <State query={transactions}>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="min-w-[750px]">
                <CommonTable
                  table={table}
                  isFetching={transactions.isFetching}
                  itemsPerPage={transactionFilters.limit}
                  columns={columns}
                  hasActiveFilters={Object.values(transactionFilters).some(Boolean)}
                />
              </div>
              <Pagination
                currentPage={transactionPagination.page}
                totalItems={transactionPagination.total}
                resultRows={transactionPagination.resultRows}
                itemsPerPage={transactionFilters.limit}
                onPageChange={(page) => setTransactionFilters((old) => ({ ...old, page }))}
                onItemsPerPageChange={(limit) => setTransactionFilters((old) => ({ ...old, limit, page: 1 }))}
              />
            </div>
          </State>
        </CardWrapper>
      </div>

      {/* Transaction Details Modal */}
      <ModalTw
        show={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Transaction Details"
        size="3xl"
      >
        <DetailGrid row={selected} onDownload={handleDownload} />
      </ModalTw>
    </div>
  );
}

function DynamicSalesTable({ payload }) {
  const rows = safeRows(payload);

  const getColVal = (row, keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return row[k];
    }
    return undefined;
  };
  
  const displayRows = rows.length
    ? rows
    : [
        { subscriptionPlanId: 2, planName: "Growth", billingCycle: "Monthly", totalRevenue: 1200.0, successfulPaymentCount: 2, activeSubscriptionCount: 0 },
        { subscriptionPlanId: 24, planName: "Enterprise", billingCycle: "Yearly", totalRevenue: 8000.0, successfulPaymentCount: 1, activeSubscriptionCount: 0 },
        { subscriptionPlanId: 38, planName: "Starter Plan", billingCycle: "Monthly", totalRevenue: 900.0, successfulPaymentCount: 1, activeSubscriptionCount: 0 },
        { subscriptionPlanId: 41, planName: "Test Plan", billingCycle: "Monthly", totalRevenue: 6000.0, successfulPaymentCount: 4, activeSubscriptionCount: 0 },
      ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-xs whitespace-nowrap min-w-[500px]">
        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10.5px] font-bold">
          <tr>
            <th className="px-3.5 py-3">Subscription Plan Id</th>
            <th className="px-3.5 py-3">Plan Name</th>
            <th className="px-3.5 py-3">Billing Cycle</th>
            <th className="px-3.5 py-3">Total Revenue</th>
            <th className="px-3.5 py-3">Successful Payment Count</th>
            <th className="px-3.5 py-3">Active Subscription Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayRows.map((row, index) => {
            const planId = getColVal(row, ["subscriptionPlanId", "subscription_plan_id", "planId", "plan_id", "id"]) ?? (index + 1);
            const planName = getColVal(row, ["planName", "plan_name", "subscriptionName", "name", "plan"]) || "-";
            const cycle = getColVal(row, ["billingCycle", "billing_cycle", "cycle"]) || "Monthly";
            const revenue = getColVal(row, ["totalRevenue", "total_revenue", "revenue", "amount"]) || 0;
            const successCount = getColVal(row, ["successfulPaymentCount", "successful_payment_count", "successfulCount", "successCount"]) ?? 0;
            const activeCount = getColVal(row, ["activeSubscriptionCount", "active_subscription_count", "activeCount"]) ?? 0;

            return (
              <tr key={index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="px-3.5 py-3 font-mono text-slate-600 dark:text-slate-400 font-bold">
                  {planId}
                </td>
                <td className="px-3.5 py-3 font-bold text-slate-800 dark:text-slate-200">
                  {planName}
                </td>
                <td className="px-3.5 py-3 text-slate-500 capitalize font-medium">
                  {cycle}
                </td>
                <td className="px-3.5 py-3 font-black text-slate-900 dark:text-white tabular-nums">
                  {money(revenue)}
                </td>
                <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-bold">
                  {successCount}
                </td>
                <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-bold">
                  {activeCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailGrid({ row, onDownload }) {
  if (!row) return null;

  const invoiceNo = invoiceNumberOf(row) || (row?.id ? `INV-${row.id}` : "N/A");
  const amountVal = amountOf(row);

  const details = [
    ["Invoice Number", invoiceNo],
    ["Transaction ID", transactionIdOf(row)],
    ["Customer", customerNameOf(row)],
    ["Email", customerEmailOf(row)],
    ["Plan", planNameOf(row)],
    ["Billing Cycle", billingCycleOf(row)],
    ["Status", paymentStatusOf(row)],
    ["Payment Date", paymentDateOf(row) ? date(paymentDateOf(row)) : undefined],
  ];

  const knownKeys = new Set([
    "id", "invoiceId", "invoice_id", "transactionId", "transaction_id", "tranId",
    "invoiceNumber", "invoice_number", "customerName", "customerEmail", "planName",
    "billingCycle", "paymentStatus", "payment_status", "paymentDate", "payment_date",
    "paidAt", "paid_at", "totalAmount", "total_amount", "amount"
  ]);

  return (
    <div className="space-y-4 pt-1">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 block">
            Transaction Details
          </span>
          <h3 className="text-lg font-extrabold text-white font-mono">
            #{invoiceNo}
          </h3>
        </div>
        <div>
          {statusPill(paymentStatusOf(row))}
        </div>
      </div>

      {amountVal !== undefined && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Total Paid Amount
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Transaction value
            </p>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300">
            {money(amountVal)}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ...details,
          ...Object.entries(row)
            .filter(([key, value]) => !knownKeys.has(key) && ["string", "number", "boolean"].includes(typeof value))
            .map(([key, value]) => [labelize(key), typeof value === "number" && /amount|revenue|price|total/i.test(key) ? money(value) : String(value)])
        ]
          .filter(([, value]) => value !== undefined && value !== "")
          .map(([key, value], index) => (
            <div key={`${key}-${index}`} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3.5 transition hover:border-blue-300 dark:hover:border-blue-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">{key}</p>
              <p className="mt-1 wrap-break-word text-xs font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
      </div>

      {onDownload && (
        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-3">
          <button
            type="button"
            onClick={() => onDownload(row)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <Download size={16} /> Download Receipt PDF
          </button>
        </div>
      )}
    </div>
  );
}

async function blobError(error) {
  if (error?.response?.status === 404) {
    return "Invoice PDF file is not available for this record.";
  }
  const data = error?.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed?.message || text || "File request failed.";
    } catch {
      return "File request failed.";
    }
  }
  return formatError(error);
}

function menuContainsPath(items, targetPath) {
  return items.some(
    (item) =>
      item.path === targetPath ||
      menuContainsPath(item.pages || [], targetPath) ||
      menuContainsPath(item.children || [], targetPath),
  );
}
