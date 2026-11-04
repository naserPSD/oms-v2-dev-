"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiClock,
  FiShield,
  FiArrowRight,
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useSubscriptionQueryApi } from "@/hooks/queryApi/useSubscriptionQueryApi";

export default function SubscriptionTrialBanner() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const { useCurrentCompanySubscriptionQuery } = useSubscriptionQueryApi();
  const { data, isLoading } = useCurrentCompanySubscriptionQuery();

  // If loading or no subscription record or user has purchased, do not render banner
  if (isLoading || !data?.data?.hasSubscription) {
    return null;
  }

  const { subscription, plan, isTrial, isPurchased, isExpired, daysRemaining } =
    data.data;

  // Once plan is purchased, hide the banner completely
  if (isPurchased) {
    return null;
  }

  // If neither trial nor unpaid subscription, do not render
  if (!isTrial && !subscription) {
    return null;
  }

  // Hide on checkout / payment pages to avoid cluttering the payment flow
  if (
    pathname?.startsWith("/subscription/checkout") ||
    pathname?.startsWith("/subscription/success") ||
    pathname?.startsWith("/subscription/fail") ||
    pathname?.startsWith("/subscription/cancel")
  ) {
    return null;
  }

  const planName = plan?.name || "Standard Plan";
  const userRange =
    plan?.minUsers != null
      ? `${plan.minUsers}${plan?.maxUsers ? ` - ${plan.maxUsers}` : "+"} employees`
      : null;

  const checkoutUrl = plan?.id
    ? `/subscription/checkout?planId=${plan.id}&planName=${encodeURIComponent(
        planName,
      )}&price=${plan.monthlyPrice || plan.price || 0}&currency=${encodeURIComponent(
        plan.currency || "BDT",
      )}&billingCycle=${encodeURIComponent(
        plan.billingCycle || "Monthly",
      )}&minUsers=${plan.minUsers || ""}&maxUsers=${plan.maxUsers || ""}`
    : "/subscription/active-subscription-plans";

  const isUrgent = isExpired || (daysRemaining != null && daysRemaining <= 3);

  return (
    <section
      aria-label="Subscription Status Banner"
      className="mb-6 w-full rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden font-sans print:hidden"
      style={{
        background: isExpired
          ? "linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 241, 242, 0.9) 100%)"
          : isUrgent
          ? "linear-gradient(135deg, rgba(255, 251, 235, 0.98) 0%, rgba(254, 243, 199, 0.9) 100%)"
          : "linear-gradient(135deg, rgba(240, 249, 255, 0.98) 0%, rgba(245, 243, 255, 0.95) 100%)",
        borderColor: isExpired
          ? "rgba(244, 63, 94, 0.35)"
          : isUrgent
          ? "rgba(245, 158, 11, 0.45)"
          : "rgba(99, 102, 241, 0.3)",
      }}
    >
      <div className="dark:bg-slate-900/90 dark:backdrop-blur-md p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Info Column */}
          <div className="flex items-start gap-3.5 sm:gap-4 flex-1">
            <div
              className={`p-3 rounded-xl flex-shrink-0 mt-0.5 shadow-sm ${
                isExpired
                  ? "bg-rose-500 text-white dark:bg-rose-600"
                  : isUrgent
                  ? "bg-amber-500 text-white dark:bg-amber-600"
                  : "bg-indigo-600 text-white dark:bg-indigo-600"
              }`}
            >
              {isExpired ? (
                <FiAlertTriangle className="w-5 h-5" />
              ) : (
                <FiClock className="w-5 h-5 animate-pulse" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs ${
                    isExpired
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                      : isUrgent
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                      : "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"
                  }`}
                >
                  {isExpired
                    ? "Trial Period Expired"
                    : `Free Trial Active • ${daysRemaining} ${
                        daysRemaining === 1 ? "Day" : "Days"
                      } Left`}
                </span>

                {userRange && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    Team Size: {userRange}
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {isExpired
                  ? `Your trial period for ${planName} has ended`
                  : `Complete subscription purchase for ${planName}`}
              </h4>

              {!collapsed && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl pt-0.5">
                  {isExpired
                    ? `Your free trial of ${planName} has ended. To maintain seamless business operations, avoid workspace restrictions, and ensure full team access, please finalize your subscription purchase now.`
                    : `Your company workspace is currently running on the complimentary ${planName} trial (${daysRemaining} days remaining). Purchase your plan now to lock in guaranteed service continuity and enable all premium business modules.`}
                </p>
              )}

              {!collapsed && !isExpired && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    Automatic Company Setup Locked
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <FiShield className="w-3.5 h-3.5 text-indigo-500" />
                    Instant Activation via SSLCommerz
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Column */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 lg:self-center flex-shrink-0 pt-1 lg:pt-0">
            <Link
              href={checkoutUrl}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                isExpired
                  ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                  : isUrgent
                  ? "bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
              }`}
            >
              <span>{isExpired ? "Purchase Plan Now" : "Purchase & Keep Plan"}</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/subscription/active-subscription-plans"
              className="w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            >
              All Plans
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand details" : "Collapse details"}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors hidden sm:inline-flex"
            >
              {collapsed ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
