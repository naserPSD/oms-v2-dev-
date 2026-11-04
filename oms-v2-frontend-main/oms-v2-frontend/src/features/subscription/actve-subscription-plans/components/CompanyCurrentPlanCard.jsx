"use client";

import React from "react";
import Link from "next/link";
import {
  FiShield,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiArrowRight,
  FiFileText,
} from "react-icons/fi";

function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function formatPrice(value) {
  if (value == null || value === "") return "0";
  return Number(value).toLocaleString();
}

export default function CompanyCurrentPlanCard({ currentPlan }) {
  if (!currentPlan) return null;

  const {
    id,
    name,
    description,
    price,
    currency = "BDT",
    billingCycle = "Monthly",
    minUsers,
    maxUsers,
    isTrial,
    isPurchased,
    isExpired,
    daysRemaining = 0,
    startDate,
    endDate,
    paymentMethod,
  } = currentPlan;

  const userRange =
    minUsers != null || maxUsers != null
      ? `${minUsers ?? 1}${maxUsers ? ` - ${maxUsers}` : "+"} employees`
      : null;

  const checkoutUrl = id
    ? `/subscription/checkout?planId=${id}&planName=${encodeURIComponent(
        name || "Plan",
      )}&price=${price || 0}&currency=${encodeURIComponent(
        currency,
      )}&billingCycle=${encodeURIComponent(
        billingCycle,
      )}&minUsers=${minUsers || ""}&maxUsers=${maxUsers || ""}`
    : "/subscription/checkout";

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md backdrop-blur-sm transition-all duration-300">
      {/* Accent gradient strip at the top */}
      <div
        className={`h-1.5 w-full ${
          isPurchased
            ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400"
            : isExpired
            ? "bg-gradient-to-r from-rose-500 via-red-500 to-rose-400"
            : "bg-gradient-to-r from-amber-500 via-indigo-500 to-cyan-500"
        }`}
      />

      <div className="p-5 sm:p-7">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-3 rounded-xl flex-shrink-0 shadow-sm ${
                isPurchased
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : isExpired
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
              }`}
            >
              {isPurchased ? (
                <FiCheckCircle className="w-6 h-6" />
              ) : isExpired ? (
                <FiAlertTriangle className="w-6 h-6" />
              ) : (
                <FiClock className="w-6 h-6 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Company Current Plan
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {name || "Standard Subscription"}
              </h3>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center">
            {isPurchased ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active Paid Plan
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                <FiAlertTriangle className="w-3.5 h-3.5" />
                Trial Expired • Purchase Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 shadow-xs">
                <FiClock className="w-3.5 h-3.5" />
                Free Trial Active • {daysRemaining} {daysRemaining === 1 ? "Day" : "Days"} Left
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6">
          {/* Card 1: Team Size */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
              <FiUsers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Company Size Range
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {userRange || "Flexible Team"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Matched to employee size
              </p>
            </div>
          </div>

          {/* Card 2: Billing & Price */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
              <FiCreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Plan Price & Cycle
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatPrice(price)} {currency} / {billingCycle}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isPurchased ? "Subscription active" : "Purchase rate"}
              </p>
            </div>
          </div>

          {/* Card 3: Period / Validity */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
              <FiCalendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isTrial ? "Trial Validity" : "Active Period"}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {endDate ? formatDate(endDate) : "Ongoing"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isTrial
                  ? isExpired
                    ? "Trial ended"
                    : `${daysRemaining} days remaining`
                  : startDate
                  ? `Active since ${formatDate(startDate)}`
                  : "Fully activated"}
              </p>
            </div>
          </div>

          {/* Card 4: Payment Status */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-xs">
              <FiShield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Subscription Status
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {isPurchased
                  ? "Paid & Verified"
                  : isTrial
                  ? "Locked Trial"
                  : "Pending Payment"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {paymentMethod === "trial" ? "Complimentary trial" : paymentMethod || "SSLCommerz"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer / CTA section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {isPurchased ? (
              <span>
                Your company is actively subscribed to <strong>{name}</strong>. All features and modules are fully unlocked.
              </span>
            ) : isExpired ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Your trial has ended. Please purchase this subscription plan now to keep full access to company records and features.
              </span>
            ) : (
              <span>
                You are currently exploring <strong>{name}</strong> on a free trial ({daysRemaining} days remaining). Purchase now to secure uninterrupted operations.
              </span>
            )}
          </p>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {!isPurchased && (
              <Link
                href={checkoutUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>{isExpired ? "Purchase Plan Now" : "Purchase This Plan"}</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            )}

            {isPurchased && (
              <Link
                href="/subscription/payments/payment-history"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <FiFileText className="w-4 h-4" />
                <span>Payment History</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
