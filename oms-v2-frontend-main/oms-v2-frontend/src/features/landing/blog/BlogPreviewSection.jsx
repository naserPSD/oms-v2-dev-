"use client";

import Link from "next/link";
import BlogPostCover from "@/features/landing/blog/BlogPostCover";
import { color } from "@/features/landing/tokens";

export default function BlogPreviewSection({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="sanzio-blog-preview" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div className="sanzio-blog-preview-head">
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".12em",
                color: color.brandInk,
              }}
            >
              BLOG
            </div>
            <h2
              className="sanzio-blog-preview-title"
              style={{
                margin: "16px 0 0",
                fontWeight: 800,
                letterSpacing: "-.03em",
              }}
            >
              Notes on running operations.
            </h2>
          </div>
          <Link
            href="/blog"
            className="sanzio-blog-preview-all"
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              color: color.cyanInk,
              textDecoration: "none",
            }}
          >
            View all posts →
          </Link>
        </div>

        <div className="sanzio-blog-preview-grid">
          {posts.map((post) => (
            <Link
              key={post.slug || post.id}
              href={`/blog/${post.slug}`}
              className="sanzio-card-hover"
              style={{
                display: "block",
                textDecoration: "none",
                color: color.ink,
                border: `1px solid ${color.border}`,
                borderRadius: 20,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <BlogPostCover
                src={post.coverImage}
                label={post.title}
                height={180}
                radius={0}
              />
              <div style={{ padding: 22 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    color: color.brandInk,
                  }}
                >
                  {post.category} · {post.date}
                </div>
                <h3
                  style={{
                    margin: "10px 0 0",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                    lineHeight: 1.25,
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14,
                    lineHeight: 1.55,
                    fontWeight: 500,
                    color: color.muted,
                  }}
                >
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
