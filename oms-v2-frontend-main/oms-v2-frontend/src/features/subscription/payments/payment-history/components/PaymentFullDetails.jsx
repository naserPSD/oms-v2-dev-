"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiShield,
  FiCreditCard,
  FiFileText,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiCopy,
  FiCheck,
  FiPrinter,
  FiDownload,
  FiLayers,
  FiUsers,
  FiRefreshCw,
} from "react-icons/fi";
import { getPaymentTransactionDetails } from "@/services/subscriptionApi";
import { generateReceiptPdf } from "@/utils/generateReceiptPdf";
import { toaster } from "@/utils/helpers";

function parseFeatures(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && Array.isArray(value.features)) return value.features;

  let text = String(value);
  try {
    const stripped = text.replace(/<[^>]*>/g, "").trim();
    const parsed = JSON.parse(stripped);
    if (parsed && Array.isArray(parsed.features)) return parsed.features;
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Split HTML or text lines
  text = text
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.split("\n").map((item) => item.trim()).filter(Boolean);
}

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateOnly(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function PaymentFullDetails({ identifier }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!identifier) {
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getPaymentTransactionDetails(identifier);
        if (isMounted) {
          if (response?.data) {
            setData(response.data);
          } else {
            throw new Error("Payment transaction data not found");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load payment details:", err);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load payment details. Please check the transaction ID."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [identifier]);

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadInvoice = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const pdfData = {
        invoiceNumber: data.invoice?.invoiceNumber || data.tranId,
        invoiceId: data.invoice?.id || data.id,
        planName: data.plan?.name,
        plan: data.plan,
        subscriptionPlan: data.plan,
        amount: data.amount,
        totalAmount: data.invoice?.totalAmount || data.amount,
        currency: data.currency,
        paymentStatus: data.status,
        paidAt: data.invoice?.paidAt || data.createdAt,
        activeFrom: data.invoice?.billingPeriodStart,
        activeTo: data.invoice?.billingPeriodEnd,
        tranId: data.tranId,
        transactionId: data.tranId,
        customer: data.customer,
      };

      const pdf = await generateReceiptPdf(pdfData);
      pdf.save(`receipt-${data.invoice?.invoiceNumber || data.tranId}.pdf`);
    } catch (err) {
      console.error("Error generating receipt PDF:", err);
      toaster("Unable to generate receipt PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-3xl">
          <FiAlertCircle />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Payment Details Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {error || "Could not retrieve the payment details for this transaction."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/subscription/payments/payment-history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <FiArrowLeft /> Back to Payment History
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500"
          >
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  const normalizedStatus = String(data.status || "").toUpperCase();
  const isSuccess = normalizedStatus === "SUCCESS" || normalizedStatus === "VALIDATED";
  const isFailed = normalizedStatus === "FAILED";
  const isCancelled = normalizedStatus === "CANCELLED";

  const statusBadge = isSuccess ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      Payment Completed & Validated
    </span>
  ) : isFailed ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
      <FiXCircle className="w-3.5 h-3.5 text-rose-600" />
      Payment Failed
    </span>
  ) : isCancelled ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
      <FiAlertCircle className="w-3.5 h-3.5 text-amber-600" />
      Payment Cancelled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
      <FiClock className="w-3.5 h-3.5 text-sky-600" />
      Pending Verification
    </span>
  );

  const features = parseFeatures(data.plan?.features);
  const ssl = data.sslcommerz || {};
  const invoice = data.invoice || {};
  const plan = data.plan || {};
  const customer = data.customer || {};

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-6 px-2 sm:px-4">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/subscription/payments/payment-history"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition hover:border-cyan-500 shadow-2xs"
            title="Back to Payment History"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Payment & Plan Details
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SSLCOMMERZ transaction receipt and subscription plan breakdown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 transition active:scale-[0.99] disabled:opacity-60"
          >
            <FiDownload className="w-3.5 h-3.5" />
            {downloading ? "Generating PDF..." : "Download Receipt"}
          </button>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-linear-to-br from-white via-slate-50/50 to-slate-100/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {statusBadge}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                SSLCOMMERZ
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {Number(data.amount || 0).toLocaleString()} {data.currency}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({plan.billingCycle || "Monthly"} Subscription)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Transaction ID
              </span>
              <div className="flex items-center gap-1.5 font-mono font-medium select-all">
                <span>{data.tranId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy("tranId", data.tranId)}
                  className="text-slate-400 hover:text-cyan-600 transition"
                  title="Copy Transaction ID"
                >
                  {copiedKey === "tranId" ? (
                    <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <FiCopy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Payment Date
              </span>
              <span className="font-medium">{formatDate(data.createdAt)}</span>
            </div>

            {invoice.invoiceNumber && (
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Invoice Number
                </span>
                <span className="font-mono font-medium text-cyan-700 dark:text-cyan-400">
                  {invoice.invoiceNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
              Plan Purchased
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {plan.name || "Custom Plan"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
              Payment Method
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {ssl.cardType || data.paymentMethod || "SSLCOMMERZ"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
              Coverage Start
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {formatDateOnly(invoice.billingPeriodStart || data.createdAt)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-0.5">
              Coverage End
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {formatDateOnly(invoice.billingPeriodEnd) || "Active Subscription"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: SSLCOMMERZ Details & Plan Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: SSLCOMMERZ Gateway Details */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
                <FiCreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  SSLCOMMERZ Gateway Information
                </h2>
                <p className="text-xs text-slate-400">Secure digital payment confirmation</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <FiShield className="w-3 h-3" /> PCI-DSS Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">SSL Validation ID (val_id)</span>
              <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 dark:text-slate-200 select-all">
                <span>{ssl.valId || "—"}</span>
                {ssl.valId && (
                  <button
                    type="button"
                    onClick={() => handleCopy("valId", ssl.valId)}
                    className="text-slate-400 hover:text-cyan-600"
                    title="Copy Validation ID"
                  >
                    {copiedKey === "valId" ? (
                      <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <FiCopy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Bank Transaction ID</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 select-all">
                {ssl.bankTranId || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Payment Channel / Card Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {ssl.cardType || "SSLCOMMERZ Online Pay"}
              </span>
            </div>

            {ssl.cardBrand && (
              <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Card Brand</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                  {ssl.cardBrand}
                </span>
              </div>
            )}

            {ssl.cardIssuer && (
              <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Card Issuer / Bank</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ssl.cardIssuer}
                </span>
              </div>
            )}

            {ssl.cardIssuerCountry && (
              <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Issuer Country</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {ssl.cardIssuerCountry}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Store Settlement Amount</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {ssl.storeAmount ? `${Number(ssl.storeAmount).toLocaleString()} ${data.currency}` : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Risk Level</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {ssl.riskTitle || "Safe"} (Level {ssl.riskLevel ?? 0})
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400 font-medium">Gateway Timestamp</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {ssl.tranDate ? formatDate(ssl.tranDate) : formatDate(data.createdAt)}
              </span>
            </div>
          </div>
        </section>

        {/* CARD 2: Subscription Plan Information */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <FiLayers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Subscription Plan Details
                </h2>
                <p className="text-xs text-slate-400">Plan allowance & feature bundle</p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2.5 py-1 rounded-full">
              {plan.billingCycle || "Monthly"}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Plan Name
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {plan.name || "Subscription Plan"}
              </h3>
              {plan.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {plan.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 border-y border-dashed border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block mb-0.5">Price Model</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {plan.monthlyPrice ? `${Number(plan.monthlyPrice).toLocaleString()} ${plan.currency}/month` : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">User Allowance</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <FiUsers className="w-3.5 h-3.5 text-slate-400" />
                  {plan.minUsers != null || plan.maxUsers != null
                    ? `${plan.minUsers ?? 1}${plan.maxUsers ? ` - ${plan.maxUsers}` : "+"} users`
                    : "Standard Seats"}
                </span>
              </div>
            </div>

            {/* Features Checklist */}
            {features.length > 0 && (
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                  Included Plan Features
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-tight"
                    >
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Secondary Grid: Invoice Breakdown & Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 3: Invoice & Billing Summary */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <FiFileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Invoice & Billing Breakdown
                </h2>
                <p className="text-xs text-slate-400">Itemized statement of charges</p>
              </div>
            </div>
            {invoice.invoiceNumber && (
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                {invoice.invoiceNumber}
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <span>Base Plan Fee</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {Number(invoice.baseAmount || data.amount).toFixed(2)} {data.currency}
              </span>
            </div>

            {invoice.perUserAmount > 0 && (
              <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <span>Per User Fee ({invoice.userCount || 1} users)</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {Number(invoice.perUserAmount * (invoice.userCount || 1)).toFixed(2)} {data.currency}
                </span>
              </div>
            )}

            <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {Number(invoice.subtotal || data.amount).toFixed(2)} {data.currency}
              </span>
            </div>

            {Number(invoice.discountAmount || 0) > 0 && (
              <div className="flex justify-between py-1.5 text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 font-medium">
                <span>Discount / Promo</span>
                <span>-{Number(invoice.discountAmount).toFixed(2)} {data.currency}</span>
              </div>
            )}

            {Number(invoice.taxAmount || 0) > 0 && (
              <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <span>Tax / VAT</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  +{Number(invoice.taxAmount).toFixed(2)} {data.currency}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-3 text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Paid</span>
              <span className="text-cyan-700 dark:text-cyan-400 text-base">
                {Number(invoice.totalAmount || data.amount).toFixed(2)} {data.currency}
              </span>
            </div>
          </div>
        </section>

        {/* CARD 4: Customer Information */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Billed Customer & Account
                </h2>
                <p className="text-xs text-slate-400">Subscriber details on record</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                {(customer.name || "C").charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Customer Name</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {customer.name || "Valued Subscriber"}
                </span>
              </div>
            </div>

            {customer.email && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <FiMail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Email Address</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                    {customer.email}
                  </span>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <FiPhone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Phone Number</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {customer.phone}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Account User ID</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                #{customer.id || data.id}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* SSLCOMMERZ Security Footer */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4 text-emerald-500" />
          <span>Processed via SSLCOMMERZ Payment Gateway &bull; 128-bit SSL Encrypted</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Invoice &bull; {invoice.invoiceNumber || data.tranId}
        </div>
      </div>
    </div>
  );
}
