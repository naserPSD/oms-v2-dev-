import InfoPage from "@/features/landing/components/InfoPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/terms");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/terms" />
      <InfoPage infoKey="terms" />
    </>
  );
}
