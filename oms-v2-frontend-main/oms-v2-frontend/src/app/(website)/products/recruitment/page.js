import ProductPage from "@/features/landing/products/ProductPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/products/recruitment");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/products/recruitment" />
      <ProductPage
        productKey="rec"
        moduleVariant="pipeline"
        chartVariant="funnel"
      />
    </>
  );
}
