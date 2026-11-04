import { Suspense } from "react";
import SubscriptionPaymentResult from "@/components/payment/SubscriptionPaymentResult";

export const metadata = {
  title: "Subscription Payment Cancelled | Revinr OMS",
  description: "Your subscription payment was cancelled on SSLCOMMERZ.",
};

async function SubscriptionCancelContent({ searchParams }) {
  const params = await searchParams;
  return <SubscriptionPaymentResult status="cancel" searchParams={params} />;
}

export default function SubscriptionCancelPage({ searchParams }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">Loading payment status...</div>}>
      <SubscriptionCancelContent searchParams={searchParams} />
    </Suspense>
  );
}
