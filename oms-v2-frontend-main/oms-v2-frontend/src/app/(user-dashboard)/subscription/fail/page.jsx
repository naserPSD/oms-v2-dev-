import { Suspense } from "react";
import SubscriptionPaymentResult from "@/components/payment/SubscriptionPaymentResult";

export const metadata = {
  title: "Subscription Payment Failed | Revinr OMS",
  description: "Your subscription payment could not be completed with SSLCOMMERZ.",
};

async function SubscriptionFailContent({ searchParams }) {
  const params = await searchParams;
  return <SubscriptionPaymentResult status="failed" searchParams={params} />;
}

export default function SubscriptionFailPage({ searchParams }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">Loading payment status...</div>}>
      <SubscriptionFailContent searchParams={searchParams} />
    </Suspense>
  );
}
