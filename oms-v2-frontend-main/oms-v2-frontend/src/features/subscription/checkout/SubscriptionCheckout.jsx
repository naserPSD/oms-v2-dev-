"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiArrowLeft, FiCheck, FiCreditCard, FiShield, FiLoader } from "react-icons/fi";
import { initiatePayment } from "@/services/subscriptionApi";
import { toaster } from "@/utils/helpers";

function formatPrice(value, currency) {
  return `${Number(value || 0).toLocaleString()} ${currency || "BDT"}`;
}

function parseFeatures(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function SubscriptionCheckout() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId") || searchParams.get("id") || searchParams.get("subscriptionPlanId");
  const planName = searchParams.get("planName") || "Subscription plan";
  const billingCycle = searchParams.get("billingCycle") || "monthly";
  const price = searchParams.get("price") || "0";
  const currency = searchParams.get("currency") || "BDT";
  const minUsers = searchParams.get("minUsers");
  const maxUsers = searchParams.get("maxUsers");
  const trialDays = searchParams.get("trialDays") || "0";
  const features = parseFeatures(searchParams.get("features"));
  const userRange = minUsers
    ? `${minUsers}${maxUsers ? ` - ${maxUsers}` : "+"}`
    : null;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clearLoading = () => setLoading(false);
    const onPageShow = (event) => {
      if (event.persisted) {
        clearLoading();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleProceedPayment = async () => {
    if (!planId) {
      toaster("Plan ID is required to initiate payment. Please select a plan.", "error");
      return;
    }

    if (typeof window !== "undefined" && !localStorage.getItem("accessToken")) {
      window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    setLoading(true);
    try {
      const response = await initiatePayment({
        subscriptionPlanId: Number(planId),
        billingCycle,
      });

      const gatewayUrl = response?.data?.gatewayUrl || response?.gatewayUrl;
      if (!gatewayUrl) {
        throw new Error("Payment gateway URL was not returned by the backend");
      }

      window.location.href = gatewayUrl;
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Payment initiation failed. Please try again.";
      toaster(Array.isArray(errorMessage) ? errorMessage.join(", ") : String(errorMessage), "error");
    }
  };


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/subscription/active-subscription-plans"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-cyan-600"
        >
          <FiArrowLeft size={16} />
          Back to plans
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-600">
            Secure checkout
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Review your subscription
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Confirm your plan and billing details before continuing to payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Selected plan
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{planName}</h2>
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold capitalize text-cyan-700">
                {billingCycle}
              </span>
            </div>

            <div className="grid gap-4 border-b border-slate-100 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Billing cycle</p>
                <p className="mt-1 font-semibold capitalize">{billingCycle} subscription</p>
              </div>
              {userRange && (
                <div>
                  <p className="text-xs text-slate-400">User allowance</p>
                  <p className="mt-1 font-semibold">{userRange} users</p>
                </div>
              )}
              {Number(trialDays) > 0 && (
                <div>
                  <p className="text-xs text-slate-400">Trial period</p>
                  <p className="mt-1 font-semibold">{trialDays} days free</p>
                </div>
              )}
            </div>

            {features.length > 0 && (
              <div className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Included features
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <li key={`${feature}-${index}`} className="flex items-start gap-2 text-sm text-slate-600">
                      <FiCheck className="mt-0.5 shrink-0 text-emerald-500" size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600">
                <FiCreditCard size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Payment summary</h2>
                <p className="text-xs text-slate-400">Ready for secure payment</p>
              </div>
            </div>

            <div className="space-y-4 py-6 text-sm">
              <div className="flex justify-between gap-4 text-slate-500">
                <span>{planName}</span>
                <span>{formatPrice(price, currency)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-500">
                <span>Billing</span>
                <span className="capitalize">{billingCycle}</span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-semibold text-cyan-700">
                    {formatPrice(price, currency)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleProceedPayment}
              className={`w-full flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all ${
                loading
                  ? "bg-cyan-400 cursor-wait"
                  : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20 active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-sm" />
                  Connecting to SSLCOMMERZ...
                </>
              ) : (
                "Proceed to payment"
              )}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              <FiShield className="mr-1 inline-block text-emerald-500" size={13} />
              Secured by SSLCOMMERZ 128-bit SSL Encryption
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
