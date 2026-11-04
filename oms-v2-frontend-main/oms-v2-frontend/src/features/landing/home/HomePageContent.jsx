import Home from "@/features/landing/home/Home";
import { mapBlogListItem } from "@/features/landing/blog/blogMappers";
import { fetchPublishedBlogs } from "@/services/blogApi";
import { fetchWebsiteSection } from "@/services/websiteContentApi";
import { fetchPublicActiveSubscriptionPlans } from "@/services/subscriptionApi";

export default async function HomePageContent() {
  const [beyondSection, blogResult, activePlans] = await Promise.all([
    fetchWebsiteSection("home_beyond_products"),
    fetchPublishedBlogs({ page: 1, limit: 3, revalidate: 120 }),
    fetchPublicActiveSubscriptionPlans(),
  ]);
  const blogPosts = (blogResult?.data || [])
    .map(mapBlogListItem)
    .filter(Boolean);

  return (
    <Home
      beyondSection={beyondSection}
      blogPosts={blogPosts}
      initialPlans={activePlans}
    />
  );
}
