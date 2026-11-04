import { fetchPublishedBlogs } from "@/services/blogApi";
import { absoluteUrl, PUBLIC_ROUTES } from "@/features/landing/seo/publicRoutes";

export default async function sitemap() {
  const staticEntries = PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let posts = [];
  try {
    const result = await fetchPublishedBlogs({ page: 1, limit: 100, revalidate: 3600 });
    posts = Array.isArray(result?.data) ? result.data : [];
  } catch {
    posts = [];
  }

  const blogEntries = posts
    .filter((post) => post?.slug)
    .map((post) => {
      const published = post.publishedAt || post.updatedAt || post.createdAt;
      const lastModified = published ? new Date(published) : undefined;
      return {
        url: absoluteUrl(`/blog/${post.slug}`),
        changeFrequency: "monthly",
        priority: 0.6,
        ...(lastModified && !Number.isNaN(lastModified.getTime())
          ? { lastModified }
          : {}),
      };
    });

  return [...staticEntries, ...blogEntries];
}
