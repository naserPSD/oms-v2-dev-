import InfoPage from "@/features/landing/components/InfoPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/faq");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/faq" />
      <InfoPage infoKey="faq" />
    </>
  );
}
