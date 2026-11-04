import { Suspense } from "react";
import SubscriptionPaymentResult from "@/components/payment/SubscriptionPaymentResult";

export const metadata = {
  title: "Payment Failed",
  description: "Your subscription payment could not be completed.",
};

async function PaymentFailedContent({ searchParams }) {
  const params = await searchParams;
  return <SubscriptionPaymentResult status="failed" searchParams={params} />;
}

export default function PaymentFailedPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
          Loading payment status...
        </div>
      }
    >
      <PaymentFailedContent searchParams={searchParams} />
    </Suspense>
  );
}