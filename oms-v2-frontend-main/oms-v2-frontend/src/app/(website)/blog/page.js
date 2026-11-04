import { Suspense } from "react";
import BlogIndex from "@/features/landing/blog/BlogIndex";
import { mapBlogListItem } from "@/features/landing/blog/blogMappers";
import { fetchPublishedBlogs } from "@/services/blogApi";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export function generateMetadata() {
  return buildPageMetadata("/blog");
}

export default function Page() {
  return (
    <>
      <MarketingJsonLd path="/blog" />
      <Suspense fallback={null}>
        <BlogIndexContent />
      </Suspense>
    </>
  );
}

async function BlogIndexContent() {
  const result = await fetchPublishedBlogs({
    page: 1,
    limit: 50,
    revalidate: 60,
  });
  const posts = (result?.data || []).map(mapBlogListItem).filter(Boolean);

  return <BlogIndex posts={posts} />;
}
