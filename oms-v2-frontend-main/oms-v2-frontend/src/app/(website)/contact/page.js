import InfoPage from "@/features/landing/components/InfoPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/contact");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/contact" />
      <InfoPage infoKey="contact" />
    </>
  );
}
