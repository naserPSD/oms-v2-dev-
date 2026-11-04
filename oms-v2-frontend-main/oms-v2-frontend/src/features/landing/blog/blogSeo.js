import { SITE } from "@/features/landing/seo/site";

export function resolveBlogSeo(blog) {
  if (!blog) {
    return {
      title: "Article — Sanzio Blog",
      description: "",
      keywords: [],
      canonical: `${SITE.url}/blog`,
      ogImage: SITE.logo,
      noIndex: false,
    };
  }

  const slug = blog.slug || "";
  const title = blog.seoTitle?.trim() || blog.title || "Blog";
  const description =
    blog.seoDescription?.trim() || blog.excerpt?.trim() || "";
  const ogImage =
    blog.ogImage?.trim() || blog.coverImage?.trim() || SITE.logo;
  const canonical =
    blog.canonicalUrl?.trim() || `${SITE.url}/blog/${slug}`;
  const keywords = (blog.seoKeywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    keywords,
    canonical,
    ogImage,
    noIndex: !!blog.noIndex,
  };
}

export function buildBlogArticleMetadata(blog) {
  const seo = resolveBlogSeo(blog);
  const pageTitle = `${seo.title} — Sanzio Blog`;

  return {
    title: pageTitle,
    description: seo.description,
    keywords: seo.keywords.length ? seo.keywords : undefined,
    alternates: { canonical: seo.canonical },
    robots: seo.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      siteName: SITE.name,
      locale: "en_US",
      type: "article",
      publishedTime: blog?.publishedAt || blog?.createdAt,
      modifiedTime: blog?.updatedAt || blog?.publishedAt,
      authors: blog?.authorName ? [blog.authorName] : undefined,
      section: blog?.category,
      images: [
        {
          url: seo.ogImage,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
  };
}
