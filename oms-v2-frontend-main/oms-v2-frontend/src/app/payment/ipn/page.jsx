import { Suspense } from "react";
import SubscriptionPaymentResult from "@/components/payment/SubscriptionPaymentResult";

export const metadata = {
  title: "Payment Status",
  description: "View the status of your subscription payment.",
};

const getStatus = (searchParams) => {
  const value = String(
    searchParams?.status ||
      searchParams?.payment_status ||
      searchParams?.paymentStatus ||
      searchParams?.transaction_status ||
      "pending",
  ).toLowerCase();

  if (["success", "successful", "paid", "completed", "succeeded"].includes(value)) {
    return "success";
  }

  if (["fail", "failed", "failure", "unpaid", "declined", "rejected"].includes(value)) {
    return "failed";
  }

  if (["cancel", "cancelled", "canceled"].includes(value)) {
    return "cancel";
  }

  return "pending";
};

async function PaymentIpnContent({ searchParams }) {
  const params = await searchParams;
  const status = getStatus(params);
  return <SubscriptionPaymentResult status={status} searchParams={params} />;
}

export default function PaymentIpnPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
          Loading payment status...
        </div>
      }
    >
      <PaymentIpnContent searchParams={searchParams} />
    </Suspense>
  );
}