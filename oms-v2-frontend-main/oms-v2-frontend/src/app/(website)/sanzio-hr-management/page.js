import dynamic from "next/dynamic";
import SuiteHero from "@/features/landing/suite/SuiteHero";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

const SuiteSections = dynamic(
  () => import("@/features/landing/suite/SuiteSections"),
  { loading: () => null }
);

export function generateMetadata() {
  return buildPageMetadata("/sanzio-hr-management");
}

export default function SanzioHrManagementPage() {
  return (
    <>
      <MarketingJsonLd path="/sanzio-hr-management" />
      <SuiteHero />
      <SuiteSections />
    </>
  );
}
