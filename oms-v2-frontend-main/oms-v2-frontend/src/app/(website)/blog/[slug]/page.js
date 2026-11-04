import BlogArticle from "@/features/landing/blog/BlogArticle";
import { mapBlogArticle } from "@/features/landing/blog/blogMappers";
import { buildBlogArticleMetadata } from "@/features/landing/blog/blogSeo";
import JsonLd from "@/features/landing/seo/JsonLd";
import { blogArticleSchema } from "@/features/landing/seo/schemas";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";
import {
  fetchBlogBySlug,
  fetchBlogSlugs,
} from "@/services/blogApi";

export async function generateStaticParams() {
  try {
    const slugs = await fetchBlogSlugs();
    if (slugs.length > 0) {
      return slugs.map((slug) => ({ slug }));
    }
  } catch (error) {
    console.error("Blog static params unavailable:", error);
  }

  // Cache Components validates this route at build time and rejects an empty
  // list. Other slugs are still rendered when they are requested.
  return [{ slug: "_" }];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  const base = blog
    ? buildBlogArticleMetadata(blog)
    : { title: "Article — Sanzio Blog", description: "" };
  const resolved = await buildPageMetadata(`/blog/${slug}`, {
    title: base.title,
    description: base.description,
  });

  if (!blog) {
    return {
      title: resolved.title,
      description: resolved.description,
    };
  }

  return {
    ...base,
    title: resolved.title,
    description: resolved.description,
    openGraph: {
      ...(base.openGraph || {}),
      title: resolved.title,
      description: resolved.description,
    },
    twitter: {
      ...(base.twitter || {}),
      title: resolved.title,
      description: resolved.description,
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);
  const article = mapBlogArticle(blog);

  return (
    <>
      {article && blog ? (
        <JsonLd
          data={blogArticleSchema({
            slug: article.slug || slug,
            title: blog.seoTitle || article.title,
            description:
              blog.seoDescription || article.lead || article.excerpt,
            date: article.publishedAt || article.date,
            authorName: article.authorName,
            category: article.category,
            image: blog.ogImage || blog.coverImage,
          })}
        />
      ) : null}
      <BlogArticle article={article} />
    </>
  );
}
