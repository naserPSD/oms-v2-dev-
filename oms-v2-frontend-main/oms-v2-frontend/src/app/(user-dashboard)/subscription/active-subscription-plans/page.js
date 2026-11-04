import ActiveSubscriptionPlan from "@/features/subscription/actve-subscription-plans/ActiveSubscriptionPlan";
import { Suspense } from "react";

export const metadata = {
  title: "Subscription List",
  description: "View and manage subscriptions.",
};

const ActiveSubscriptionPlanPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActiveSubscriptionPlan />
    </Suspense>
  );
};

export default ActiveSubscriptionPlanPage;
