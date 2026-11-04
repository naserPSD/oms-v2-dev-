import SubscriptionCheckout from "@/features/subscription/checkout/SubscriptionCheckout";
import { Suspense } from "react";
export const metadata = {
  title: "Subscription Checkout",
  description: "Review your subscription before payment.",
};

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SubscriptionCheckout />
    </Suspense>
  );
}
