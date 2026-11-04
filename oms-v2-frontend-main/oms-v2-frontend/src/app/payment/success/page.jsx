import { Suspense } from "react";
import SubscriptionPaymentResult from "@/components/payment/SubscriptionPaymentResult";

export const metadata = {
  title: "Payment Successful",
  description: "Your subscription payment was completed successfully.",
};

async function PaymentSuccessContent({ searchParams }) {
  const params = await searchParams;
  return <SubscriptionPaymentResult status="success" searchParams={params} />;
}

export default function PaymentSuccessPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
          Loading payment confirmation...
        </div>
      }
    >
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}