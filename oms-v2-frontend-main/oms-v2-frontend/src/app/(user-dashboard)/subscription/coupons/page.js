// src/app/(user-dashboard)/subscription/coupons/page.js
import CouponListComponent from "@/features/subscription/coupons/CouponListComponent";
import { Suspense } from "react";

export const metadata = {
  title: "Subscription Coupons | Sanzio",
  description: "Manage subscription offer coupons and promotional discounts.",
};

export default function SubscriptionCouponsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading coupons...</div>}>
      <CouponListComponent />
    </Suspense>
  );
}
