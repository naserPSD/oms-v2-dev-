import Link from "next/link";

const RESULT_STYLES = {
  success: {
    icon: "✓",
    label: "Payment successful",
    title: "Your subscription payment is complete.",
    description:
      "Your payment has been received. You can return to the dashboard to continue using your account.",
    iconClass: "bg-emerald-100 text-emerald-600",
    labelClass: "text-emerald-600",
  },
  failed: {
    icon: "!",
    label: "Payment failed",
    title: "Your payment could not be completed.",
    description:
      "The payment gateway did not approve this transaction. You can return to the plans and try again.",
    iconClass: "bg-rose-100 text-rose-600",
    labelClass: "text-rose-600",
  },
  cancel: {
    icon: "×",
    label: "Payment cancelled",
    title: "Your payment was cancelled.",
    description:
      "No subscription was activated. You can return to the plans whenever you are ready to try again.",
    iconClass: "bg-amber-100 text-amber-600",
    labelClass: "text-amber-600",
  },
  pending: {
    icon: "...",
    label: "Payment pending",
    title: "We are still confirming your payment.",
    description:
      "The payment gateway has not returned a final status yet. Please check your payment history shortly.",
    iconClass: "bg-sky-100 text-sky-600",
    labelClass: "text-sky-600",
  },
};

export default function PaymentResult({ status, searchParams }) {
  const result = RESULT_STYLES[status];
  const transactionId = searchParams?.tran_id;
  const message = searchParams?.message || searchParams?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${result.iconClass}`}>
          {result.icon}
        </div>
        <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.25em] ${result.labelClass}`}>
          {result.label}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{result.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{result.description}</p>

        {(transactionId || message) && (
          <div className="mt-6 space-y-2 rounded-lg bg-slate-50 px-4 py-3 text-left text-xs text-slate-500">
            {transactionId && (
              <p>
                Transaction ID: <span className="font-semibold text-slate-700">{transactionId}</span>
              </p>
            )}
            {message && <p>Gateway message: <span className="text-slate-700">{message}</span></p>}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {status !== "success" && (
            <Link
              href={status === "pending" ? "/subscription/payments/payment-history" : "/subscription/active-subscription-plans"}
              className="inline-flex justify-center rounded-lg bg-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-cyan-700"
            >
              {status === "pending" ? "View payment history" : "Try again"}
            </Link>
          )}
          <Link
            href="/main-dashboard"
            className="inline-flex justify-center rounded-lg border border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}