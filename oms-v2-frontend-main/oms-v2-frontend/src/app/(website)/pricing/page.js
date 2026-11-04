import { PricingSectionOnly } from "@/features/landing/home/Home";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";
import { fetchPublicActiveSubscriptionPlans } from "@/services/subscriptionApi";

export function generateMetadata() {
  return buildPageMetadata("/pricing");
}

export default async function PricingPage() {
  const plans = await fetchPublicActiveSubscriptionPlans();

  return (
    <>
      <MarketingJsonLd path="/pricing" />
      <PricingSectionOnly initialPlans={plans} />
    </>
  );
}
