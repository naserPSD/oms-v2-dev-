import ProductPage from "@/features/landing/products/ProductPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/products/workspace");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/products/workspace" />
      <ProductPage
        productKey="work"
        moduleVariant="tiles"
        chartVariant="composition"
      />
    </>
  );
}
