"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiArrowRight,
  FiCopy,
  FiCheck,
  FiPrinter,
  FiRefreshCw,
  FiShield,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";
import { getPaymentTransactionDetails, verifyPaymentTransaction } from "@/services/subscriptionApi";

const STATUS_CONFIGS = {
  success: {
    icon: FiCheckCircle,
    label: "Payment Successful",
    title: "Subscription Activated Successfully!",
    subtitle: "Thank you for your purchase. Your subscription plan is now active.",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    badgeText: "Transaction Completed",
  },
  failed: {
    icon: FiXCircle,
    label: "Payment Failed",
    title: "Payment Could Not Be Completed",
    subtitle: "The payment gateway was unable to process your transaction. No funds were debited.",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    badgeText: "Transaction Failed",
  },
  cancel: {
    icon: FiAlertCircle,
    label: "Payment Cancelled",
    title: "Transaction Was Cancelled",
    subtitle: "You cancelled the payment process on the SSLCOMMERZ checkout page. No charges occurred.",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    badgeText: "Transaction Cancelled",
  },
  pending: {
    icon: FiClock,
    label: "Verification Pending",
    title: "Verifying Your Payment...",
    subtitle: "We are awaiting final confirmation from the SSLCOMMERZ gateway. Please wait a moment.",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    badgeText: "Pending Verification",
  },
};

export default function SubscriptionPaymentResult({ status = "success", searchParams = {} }) {
  const normalizedStatus = ["failed", "fail", "error"].includes(status?.toLowerCase())
    ? "failed"
    : ["cancel", "cancelled", "canceled"].includes(status?.toLowerCase())
    ? "cancel"
    : ["pending", "processing"].includes(status?.toLowerCase())
    ? "pending"
    : "success";

  const config = STATUS_CONFIGS[normalizedStatus] || STATUS_CONFIGS.success;
  const StatusIcon = config.icon;

  const tranId =
    searchParams?.tran_id ||
    searchParams?.tranId ||
    searchParams?.transaction_id ||
    "";
  const rawReason =
    searchParams?.reason ||
    searchParams?.error ||
    searchParams?.message ||
    searchParams?.failedreason ||
    "";

  const [transactionData, setTransactionData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(Boolean(tranId));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!tranId) {
      setLoadingDetails(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        // Attempt to fetch confirmed transaction details
        let res = await getPaymentTransactionDetails(tranId).catch(() => null);
        if (!res?.data && normalizedStatus === "success") {
          // If details endpoint is not yet populated, call verify endpoint
          res = await verifyPaymentTransaction(tranId).catch(() => null);
        }

        if (isMounted && res?.data) {
          setTransactionData(res.data);
        }
      } catch (err) {
        console.warn("Unable to fetch payment details:", err);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [tranId, normalizedStatus]);

  const handleCopyTranId = () => {
    if (!tranId) return;
    navigator.clipboard.writeText(tranId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const planName = transactionData?.planName || "Subscription Plan";
  const amount = transactionData?.amount || searchParams?.amount;
  const currency = transactionData?.currency || searchParams?.currency || "BDT";
  const formattedDate = transactionData?.createdAt
    ? new Date(transactionData.createdAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
        {/* Header Ribbon / Status Banner */}
        <div className="p-8 sm:p-10 text-center border-b border-slate-100 dark:border-slate-800/80 relative">
          <div className="absolute top-4 right-4 print:hidden">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {config.badgeText}
            </span>
          </div>

          <div
            className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner mb-6 ${config.iconBg}`}
          >
            <StatusIcon className={`w-10 h-10 ${config.iconColor}`} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {config.subtitle}
          </p>

          {rawReason && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs text-left">
              <span className="font-semibold">Reason: </span>
              {rawReason.replace(/_/g, " ")}
            </div>
          )}
        </div>

        {/* Transaction Summary / Receipt Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FiCreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Transaction Details
              </span>
            </div>
            {tranId && (
              <button
                type="button"
                onClick={handleCopyTranId}
                className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 flex items-center gap-1 font-medium transition"
              >
                {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Tran ID"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {tranId && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                  Transaction ID
                </span>
                <span className="font-mono font-medium text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                  {tranId}
                </span>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                Payment Gateway
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-cyan-500" />
                SSLCOMMERZ Secure Pay
              </span>
            </div>

            {planName && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                  Subscription Plan
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {planName}
                </span>
              </div>
            )}

            {amount && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                  Amount Paid
                </span>
                <span className="font-bold text-cyan-700 dark:text-cyan-400 text-base">
                  {Number(amount).toLocaleString()} {currency}
                </span>
              </div>
            )}

            {transactionData?.invoiceNumber && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                  Invoice No.
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <FiFileText className="w-3.5 h-3.5 text-slate-400" />
                  {transactionData.invoiceNumber}
                </span>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                Date & Time
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end print:hidden">
            {normalizedStatus === "success" && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <FiPrinter className="w-3.5 h-3.5" />
                Print Receipt
              </button>
            )}

            {normalizedStatus !== "success" ? (
              <Link
                href="/subscription/active-subscription-plans"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-500 active:scale-[0.99]"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                Try Payment Again
              </Link>
            ) : (
              <Link
                href="/subscription/payments/payment-history"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Payment History
              </Link>
            )}

            <Link
              href="/main-dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-900/20 transition active:scale-[0.99]"
            >
              Go to Dashboard
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Security / SSL Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/80 px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
          <FiShield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Verified by SSLCOMMERZ Payment Gateway &bull; 128-bit PCI-DSS compliant</span>
        </div>
      </div>
    </div>
  );
}
