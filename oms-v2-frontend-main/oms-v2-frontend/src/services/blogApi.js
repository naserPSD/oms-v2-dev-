import { publicApiFetch } from "@/services/publicApiFetch";

function blogFetch(path, { revalidate = 60 } = {}) {
  return publicApiFetch(path, { revalidate });
}

export async function fetchPublishedBlogs(params = {}) {
  const {
    page = 1,
    limit = 50,
    sort = "publishedAt:desc",
    revalidate,
    ...filters
  } = params;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  if (Object.keys(filters).length > 0) {
    query.set("params", JSON.stringify(filters));
  }

  try {
    const res = await blogFetch(`/api/v1/blogs/get-all?${query.toString()}`, {
      revalidate: revalidate ?? 60,
    });
    if (!res.ok) {
      console.error("Failed to fetch blogs:", res.status, await res.text());
      return { data: [], pagination: { page: 1, limit, total: 0, lastPage: 0 } };
    }
    return res.json();
  } catch (error) {
    console.error("Blog list fetch error:", error?.message || error);
    return { data: [], pagination: { page: 1, limit, total: 0, lastPage: 0 } };
  }
}

export async function fetchBlogBySlug(slug) {
  if (!slug) return null;

  try {
    const res = await blogFetch(
      `/api/v1/blogs/get-by-slug/${encodeURIComponent(slug)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error("Failed to fetch blog:", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error("Blog slug fetch error:", error?.message || error);
    return null;
  }
}

export async function fetchBlogSlugs() {
  const result = await fetchPublishedBlogs({ page: 1, limit: 100 });
  return (result?.data || []).map((post) => post.slug).filter(Boolean);
}
