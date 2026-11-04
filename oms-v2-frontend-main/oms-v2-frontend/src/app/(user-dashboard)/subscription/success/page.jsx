import { Suspense } from "react";
import SubscriptionPaymentResult from "@/components/payment/SubscriptionPaymentResult";

export const metadata = {
  title: "Subscription Payment Successful | Revinr OMS",
  description: "Your subscription payment was completed successfully with SSLCOMMERZ.",
};

async function SubscriptionSuccessContent({ searchParams }) {
  const params = await searchParams;
  return <SubscriptionPaymentResult status="success" searchParams={params} />;
}

export default function SubscriptionSuccessPage({ searchParams }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">Loading payment confirmation...</div>}>
      <SubscriptionSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
