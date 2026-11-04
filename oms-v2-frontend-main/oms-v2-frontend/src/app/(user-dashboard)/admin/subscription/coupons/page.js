// src/app/(user-dashboard)/admin/subscription/coupons/page.js
import CouponListComponent from "@/features/subscription/coupons/CouponListComponent";
import { Suspense } from "react";

export const metadata = {
  title: "Subscription Coupons | Admin Portal",
  description: "Manage subscription offer coupons and promotional discounts.",
};

export default function AdminSubscriptionCouponsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading coupons...</div>}>
      <CouponListComponent />
    </Suspense>
  );
}
