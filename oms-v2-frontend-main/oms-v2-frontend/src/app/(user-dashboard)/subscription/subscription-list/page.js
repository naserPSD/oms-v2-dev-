import SubscriptionList from "@/features/subscription/subscription-list";
import { Suspense } from "react";

export const metadata = {
  title: "Subscription List",
  description: "View and manage subscriptions.",
};

const SubscriptionListPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionList />
    </Suspense>
  );
};

export default SubscriptionListPage;
