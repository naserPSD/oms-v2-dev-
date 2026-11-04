import Connect from "@/features/landing/connect/Connect";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/connect");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/connect" />
      <Connect />
    </>
  );
}
