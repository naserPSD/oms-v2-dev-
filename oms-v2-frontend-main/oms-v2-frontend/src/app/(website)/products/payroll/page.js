import ProductPage from "@/features/landing/products/ProductPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/products/payroll");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/products/payroll" />
      <ProductPage
        productKey="pay"
        moduleVariant="spec"
        chartVariant="columns"
      />
    </>
  );
}
