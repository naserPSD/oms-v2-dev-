export function formatBlogDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isHtmlContent(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("<")) return true;
  return /<(p|div|h[1-6]|ul|ol|blockquote|br|img)\b/i.test(trimmed);
}

export function getBlogHtmlBody(content) {
  if (!content || typeof content !== "string") return null;
  const trimmed = content.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return null;
    } catch {
      /* not JSON */
    }
  }
  return isHtmlContent(trimmed) ? trimmed : null;
}

export function parseBlogContent(content) {
  if (!content) return [];

  if (Array.isArray(content)) return content;

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) return [];
    if (getBlogHtmlBody(trimmed)) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // plain text fallback
    }

    return [{ p: trimmed }];
  }

  return [];
}

export function mapBlogListItem(blog) {
  if (!blog) return null;

  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || "",
    category: blog.category || "BLOG",
    coverImage: blog.coverImage || "",
    authorName: blog.authorName || "Sanzio Team",
    authorRole: blog.authorRole || "Product",
    readTime: blog.readTime || "4 min read",
    date: formatBlogDate(blog.publishedAt || blog.createdAt),
    publishedAt: blog.publishedAt || blog.createdAt,
  };
}

export function mapBlogArticle(blog) {
  if (!blog) return null;

  const listItem = mapBlogListItem(blog);
  const htmlBody = getBlogHtmlBody(blog.content);
  return {
    ...listItem,
    lead: blog.excerpt || "",
    htmlBody,
    body: htmlBody ? [] : parseBlogContent(blog.content),
  };
}
