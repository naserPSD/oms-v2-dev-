import React, { useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";
import ButtonTw from "@/components/ui/ButtonTw";
import SwitchButton from "@/components/ui/SwitchButton";
import { initiatePayment } from "@/services/subscriptionApi";
import { toaster } from "@/utils/helpers";

function parseFeatures(value) {
  if (!value) return [];
  if (typeof value === "object") return value.features || [];

  let text = String(value);
  try {
    const strippedText = text.replace(/<[^>]*>/g, "").trim();
    const parsed = JSON.parse(strippedText);
    if (parsed && parsed.features) return parsed.features;
  } catch (err) {
    // Fall back to HTML parsing below
    void err;
  }

  // If it's an HTML string, split it into an array
  text = text
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.split("\n").map(item => item.trim()).filter(Boolean);
}

function formatPrice(value) {
  if (value == null || value === "") return "0";
  return Number(value).toLocaleString();
}

function isActivePlan(plan) {
  const activeValue = plan.isActive ?? plan.is_active ?? plan.active;

  if (activeValue == null) return true;

  return [true, 1, "1", "true", "active"].includes(
    typeof activeValue === "string"
      ? activeValue.toLowerCase()
      : activeValue,
  );
}

const SubscriptionCard = ({
  data = [],
  isFetching,
  onEdit,
  onDelete,
  onToggleStatus,
  currentPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [initiatingPlanId, setInitiatingPlanId] = useState(null);

  useEffect(() => {
    const clearPurchaseLoading = () => setInitiatingPlanId(null);
    const onPageShow = (event) => {
      if (event.persisted) {
        clearPurchaseLoading();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
  const filteredPlans = useMemo(
    () => {
      const priceKey = billingCycle === "yearly" ? "yearlyPrice" : "monthlyPrice";

      return data
        .filter(isActivePlan)
        .sort((firstPlan, secondPlan) => {
          const firstPrice = Number(firstPlan[priceKey]) || 0;
          const secondPrice = Number(secondPlan[priceKey]) || 0;
          return firstPrice - secondPrice;
        });
    },
    [billingCycle, data],
  );

  const handleGetStarted = async (plan) => {
    if (typeof window !== "undefined" && !localStorage.getItem("accessToken")) {
      window.location.href = "/sign-in";
      return;
    }

    setInitiatingPlanId(plan.id);

    try {
      const response = await initiatePayment({
        subscriptionPlanId: plan.id,
        billingCycle,
      });
      const gatewayUrl = response?.data?.gatewayUrl || response?.gatewayUrl;

      if (!gatewayUrl) {
        throw new Error("Payment gateway URL was not returned by the backend");
      }

      window.location.href = gatewayUrl;
    } catch (error) {
      const responseStatus = error?.response?.status;
      const responseData = error?.response?.data;
      const errorMessage =
        responseData?.message ||
        responseData?.error ||
        (responseStatus === 409
          ? "You already have an active subscription."
          : null) ||
        error?.message ||
        "Unable to start payment. Please try again.";

      const rawMsg = Array.isArray(errorMessage) ? errorMessage.join(", ") : String(errorMessage);
      const isAlreadySubscribed =
        rawMsg.toLowerCase().includes("already has") ||
        rawMsg.toLowerCase().includes("already have") ||
        rawMsg.toLowerCase().includes("already active") ||
        responseStatus === 409;

      if (isAlreadySubscribed) {
        const activeName = currentPlan?.name ? ` (${currentPlan.name})` : "";
        toaster(
          `You already have an active subscription${activeName}. You cannot purchase another plan while your current subscription is active.`,
          "warning",
        );
      } else {
        toaster(rawMsg, "error");
      }
      setInitiatingPlanId(null);
    }
  };

  if (isFetching) {
    return (
      <div className="grid grid-cols-1 gap-5 bg-white dark:bg-slate-900 px-4 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-3 lg:items-end">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm"
          >
            <Skeleton className="mb-6 h-3 w-20 bg-gray-200 dark:bg-slate-700" />
            <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-slate-700" />
            <Skeleton className="mt-2 h-3 w-24 bg-gray-200 dark:bg-slate-700" />
            <div className="space-y-3 py-7">
              <Skeleton className="h-3 w-28 bg-gray-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-full bg-gray-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-4/5 bg-gray-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-3/4 bg-gray-200 dark:bg-slate-700" />
            </div>
            <Skeleton className="h-11 w-full bg-gray-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative my-6 overflow-hidden bg-white dark:bg-slate-900 px-4 py-12 text-gray-900 dark:text-gray-100 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-20 bottom-8 h-56 w-[75%] rounded-[50%] border-t border-gray-300 dark:border-slate-700" />
      <div className="pointer-events-none absolute -right-12 top-2 h-40 w-[70%] rotate-15 rounded-[50%] border-b border-gray-300 dark:border-slate-700" />
      <div className="pointer-events-none absolute left-[12%] top-28 h-36 w-[45%] -rotate-32 rounded-[50%] border-t border-cyan-500/60" />

      {data && data.length > 0 ? (
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-md text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-400">
              
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Our pricing is designed to be affordable, flexible, and tailored to your unique needs.
            </p>
            <div className="mx-auto mt-6 inline-flex rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-1">
              {["monthly", "yearly"].map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`rounded-md px-5 py-2 text-xs font-semibold capitalize transition-colors ${
                    billingCycle === cycle
                      ? "bg-cyan-600 text-white shadow-sm hover:bg-cyan-500"
                      : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </div>

          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-end">
              {filteredPlans.map((plan, index) => {
              const isFeatured = index === 0;
              const isCurrentPlan = Boolean(
                currentPlan?.id != null
                  ? String(currentPlan.id) === String(plan.id)
                  : currentPlan?.name != null &&
                      plan?.name != null &&
                      String(currentPlan.name).trim().toLowerCase() === String(plan.name).trim().toLowerCase()
              );
              const features = parseFeatures(plan.features);
              const price =
                billingCycle === "yearly"
                  ? plan.yearlyPrice
                  : plan.monthlyPrice;
              const userText =
                plan.minUsers != null || plan.maxUsers != null
                  ? `${plan.minUsers ?? 0}${plan.maxUsers ? ` - ${plan.maxUsers}` : "+"}`
                  : null;

              return (
                <article
                  key={plan.id}
                  className={`group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:shadow-none transition-transform duration-300 hover:-translate-y-2 ${
                    isFeatured ? "min-h-[310px] lg:min-h-[390px]" : "lg:min-h-[300px]"
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-400" />
                  )}

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
                        {plan.name}
                      </p>
                      {plan.description && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {isCurrentPlan ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                            currentPlan?.isTrial
                              ? currentPlan?.isExpired
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}
                        >
                          {currentPlan?.isTrial
                            ? currentPlan?.isExpired
                              ? "Current (Trial Expired)"
                              : `Current (Trial • ${currentPlan?.daysRemaining ?? 0}d left)`
                            : "Current Plan"}
                        </span>
                      ) : onToggleStatus ? (
                        <SwitchButton
                          checked={plan.isActive}
                          onChange={() => onToggleStatus(plan)}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="relative z-10 mt-3 flex items-end gap-2">
                    <span className="text-4xl font-light tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                      {formatPrice(price)}
                    </span>
                    <span className="mb-1 text-[10px] text-gray-500 dark:text-gray-400">
                      {plan.currency} / per user {billingCycle}
                    </span>
                  </div>

                  {userText && (
                    <p className="relative z-10 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                      Features for up to {userText} users
                    </p>
                  )}

                  <div className="relative z-10 mt-6 flex-1">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-700 dark:text-gray-300">
                      Features
                    </p>
                    <ul className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {features.length > 0 ? (
                        features.map((feature, featureIndex) => (
                          <li key={`${plan.id}-${featureIndex}`} className="flex items-start gap-2 text-[11px] leading-4 text-gray-700 dark:text-gray-300">
                            <FiCheck className="mt-0.5 shrink-0 text-emerald-500" size={11} />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          {userText && (
                            <li className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                              <FiUsers className="shrink-0 text-emerald-500" size={11} />
                              Up to {userText} users
                            </li>
                          )}
                          {plan.trialDays > 0 && (
                            <li className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                              <FiClock className="shrink-0 text-emerald-500" size={11} />
                              {plan.trialDays} days free trial
                            </li>
                          )}
                          <li className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                            <FiCheck className="shrink-0 text-emerald-500" size={11} />
                            Flexible {billingCycle} billing
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <ButtonTw
                    variant="default"
                    disabled={
                      (isCurrentPlan && !currentPlan?.isTrial) ||
                      initiatingPlanId === plan.id
                    }
                    loading={initiatingPlanId === plan.id}
                    className="relative z-10 mt-7 w-full rounded-lg border-0 bg-linear-to-r from-cyan-600 to-blue-500 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-cyan-950/30 transition-all hover:from-cyan-500 hover:to-blue-400"
                    onClick={() => handleGetStarted(plan)}
                  >
                    {isCurrentPlan
                      ? currentPlan?.isTrial
                        ? "Purchase Plan"
                        : "Current plan"
                      : "Get started"}
                  </ButtonTw>

                  {onDelete && (
                    <div className="relative z-10 mt-3 flex justify-end gap-1 border-t border-gray-200 dark:border-slate-700 pt-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(plan)}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-700 dark:hover:text-gray-300"
                          aria-label="Edit plan"
                        >
                          <FiEdit2 size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(plan.id)}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-cyan-50 hover:text-cyan-500 dark:hover:bg-slate-700/50 dark:hover:text-cyan-400"
                          aria-label="Delete plan"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <FiCheck className="mx-auto mb-4 text-gray-400" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No {billingCycle} subscription plans found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose another billing cycle to view available plans.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 py-16 text-center">
          <FiCheck className="mx-auto mb-4 text-gray-400" size={24} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No subscription plans found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your first subscription plan to get started.</p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;
