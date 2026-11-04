import JsonLd from "@/features/landing/seo/JsonLd";
import { schemaForMarketingPath } from "@/features/landing/seo/schemas";

export default function MarketingJsonLd({ path }) {
  const data = schemaForMarketingPath(path);
  if (!data) return null;
  return <JsonLd data={data} />;
}
