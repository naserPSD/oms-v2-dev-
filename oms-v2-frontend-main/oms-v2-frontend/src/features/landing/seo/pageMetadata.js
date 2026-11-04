import { cache } from "react";
import { fetchWebsiteSection } from "@/services/websiteContentApi";
import { absoluteUrl, PUBLIC_ROUTES } from "./publicRoutes";
import { SITE } from "./site";

export const PAGE_SEO_SECTION = "page_seo";

export function pageSeoSlug(path = "/") {
  if (!path || path === "/") return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.length > 1 && withSlash.endsWith("/")
    ? withSlash.slice(0, -1)
    : withSlash;
}

function collectRows(section) {
  if (!section) return [];
  if (Array.isArray(section)) return section;
  const rows = [];
  if (Array.isArray(section.items)) rows.push(...section.items);
  if (Array.isArray(section.data)) rows.push(...section.data);
  if (section.meta && typeof section.meta === "object") {
    if (Array.isArray(section.meta)) rows.push(...section.meta);
    else if (section.meta.slug || section.meta.title) rows.push(section.meta);
  }
  return rows;
}

export const getPageSeoMap = cache(async () => {
  const section = await fetchWebsiteSection(PAGE_SEO_SECTION);
  const map = new Map();
  for (const row of collectRows(section)) {
    if (row?.isActive === false || row?.isActive === 0) continue;
    const key = pageSeoSlug(row.slug || row.path || "");
    const title = String(row.title || "").trim();
    const description = String(row.description || "").trim();
    if (!key || (!title && !description)) continue;
    map.set(key, { id: row.id, title, description });
  }
  return map;
});

export function fallbackPageMeta(path) {
  const route = PUBLIC_ROUTES.find((item) => item.path === pageSeoSlug(path));
  return {
    title: route?.metaTitle || route?.title || SITE.name,
    description: route?.metaDescription || route?.description || SITE.description,
  };
}

export async function buildPageMetadata(path, extras = {}) {
  const defaults = fallbackPageMeta(path);
  const fallback = {
    title: extras.title || defaults.title,
    description: extras.description || defaults.description,
  };

  let seo = null;
  try {
    const map = await getPageSeoMap();
    seo = map.get(pageSeoSlug(path)) || null;
  } catch {
    seo = null;
  }

  const title = seo?.title || fallback.title;
  const description = seo?.description || fallback.description;
  const url = absoluteUrl(path);

  return {
    ...extras,
    title,
    description,
    openGraph: {
      siteName: SITE.name,
      locale: "en_US",
      type: "website",
      ...(extras.openGraph || {}),
      title,
      description,
      url: extras.openGraph?.url || url,
    },
    twitter: {
      card: "summary_large_image",
      ...(extras.twitter || {}),
      title,
      description,
    },
  };
}
