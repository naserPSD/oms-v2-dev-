import ProductPage from "@/features/landing/products/ProductPage";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";

export const metadata = {
  title: "HR Management — Sanzio",
  description:
    "Employee records, attendance, leave and everyday HR operations in one place.",
};

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/products/hr" />
      <ProductPage productKey="hr" moduleVariant="cards" chartVariant="bars" />
    </>
  );
}
