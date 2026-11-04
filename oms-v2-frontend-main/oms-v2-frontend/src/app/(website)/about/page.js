import InfoPage from "@/features/landing/components/InfoPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/about");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/about" />
      <InfoPage infoKey="about" />
    </>
  );
}
