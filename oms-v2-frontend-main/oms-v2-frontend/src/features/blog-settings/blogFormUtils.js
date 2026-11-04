import { z } from "zod";

export const blogFormSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  category: z.string().optional(),
  excerpt: z.string().optional(),
  bodyHtml: z.string().optional(),
  coverImage: z.string().optional(),
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  readTime: z.string().optional(),
  isPublished: z.boolean().default(true),
  publishedAt: z.string().optional(),
  seoTitle: z.string().max(255, "Max 255 characters").optional(),
  seoDescription: z.string().max(320, "Max 320 characters").optional(),
  seoKeywords: z.string().max(500, "Max 500 characters").optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noIndex: z.boolean().default(false),
});

export const BLOG_FORM_INITIAL = {
  id: 0,
  title: "",
  slug: "",
  category: "PRODUCT",
  excerpt: "",
  bodyHtml: "",
  coverImage: "",
  authorName: "Sanzio Team",
  authorRole: "Product",
  readTime: "4 min read",
  isPublished: true,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImage: "",
  canonicalUrl: "",
  noIndex: false,
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isHtmlContent(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("<")) return true;
  return /<(p|div|h[1-6]|ul|ol|blockquote|br|img)\b/i.test(trimmed);
}

/** API `content` → SunEditor HTML */
export function contentToBodyHtml(content) {
  if (!content) return "";

  const raw = String(content).trim();
  if (!raw) return "";

  if (isHtmlContent(raw)) return raw;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((block) => {
          if (block.h) return `<h2>${escapeHtml(block.h)}</h2>`;
          if (block.q) {
            return `<blockquote><p>${escapeHtml(block.q)}</p></blockquote>`;
          }
          if (block.p) return `<p>${escapeHtml(block.p)}</p>`;
          return "";
        })
        .join("");
    }
  } catch {
    // plain text fallback
  }

  return raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

export function bodyHtmlToContent(bodyHtml) {
  const html = (bodyHtml || "").trim();
  if (!html || html === "<p><br></p>" || html === "<p><br /></p>") {
    return undefined;
  }
  return html;
}

export function blogApiToFormValues(blog) {
  if (!blog) return { ...BLOG_FORM_INITIAL };
  return {
    id: blog.id,
    title: blog.title || "",
    slug: blog.slug || "",
    category: blog.category || "",
    excerpt: blog.excerpt || "",
    bodyHtml: contentToBodyHtml(blog.content),
    coverImage: blog.coverImage || "",
    authorName: blog.authorName || "Sanzio Team",
    authorRole: blog.authorRole || "Product",
    readTime: blog.readTime || "4 min read",
    isPublished: !!blog.isPublished,
    publishedAt: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString().slice(0, 16)
      : "",
    seoTitle: blog.seoTitle || "",
    seoDescription: blog.seoDescription || "",
    seoKeywords: blog.seoKeywords || "",
    ogImage: blog.ogImage || "",
    canonicalUrl: blog.canonicalUrl || "",
    noIndex: !!blog.noIndex,
  };
}

export function formValuesToBlogPayload(values) {
  return {
    id: values.id || undefined,
    title: values.title,
    slug: values.slug || undefined,
    category: values.category || undefined,
    excerpt: values.excerpt || undefined,
    content: bodyHtmlToContent(values.bodyHtml),
    coverImage: values.coverImage || undefined,
    authorName: values.authorName || undefined,
    authorRole: values.authorRole || undefined,
    readTime: values.readTime || undefined,
    isPublished: values.isPublished,
    publishedAt: values.publishedAt
      ? new Date(values.publishedAt).toISOString()
      : undefined,
    seoTitle: values.seoTitle?.trim() || undefined,
    seoDescription: values.seoDescription?.trim() || undefined,
    seoKeywords: values.seoKeywords?.trim() || undefined,
    ogImage: values.ogImage?.trim() || undefined,
    canonicalUrl: values.canonicalUrl?.trim() || undefined,
    noIndex: values.noIndex,
  };
}
