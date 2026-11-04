"use client";

import Link from "next/link";
import BlogPostCover from "@/features/landing/blog/BlogPostCover";
import { color } from "@/features/landing/tokens";

export default function BlogIndex({ posts = [] }) {
  if (!posts.length) {
    return (
      <section style={{ padding: "100px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>No posts yet</h1>
        <p style={{ marginTop: 12, color: color.muted, fontWeight: 500 }}>
          Blog articles will appear here once they are published.
        </p>
      </section>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <section className="sanzio-blog-page sanzio-m-section" style={{ padding: "80px 40px 96px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
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
        <h1
          style={{
            margin: "16px 0 0",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-.04em",
          }}
        >
          Notes on running operations.
        </h1>
        <p
          style={{
            margin: "14px 0 0",
            maxWidth: 520,
            fontSize: 17,
            lineHeight: 1.6,
            fontWeight: 500,
            color: color.muted,
          }}
        >
          Product updates and practical advice on HR, payroll, workspace and
          recruitment.
        </p>

        <Link
          href={`/blog/${featured.slug}`}
          className="sanzio-card-hover sanzio-blog-featured"
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 32,
            textDecoration: "none",
            color: color.ink,
            alignItems: "center",
          }}
        >
          <BlogPostCover
            src={featured.coverImage}
            label={featured.title}
            height={320}
            radius={20}
          />
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".08em",
                color: color.brandInk,
              }}
            >
              {featured.category} · {featured.date}
            </div>
            <h2
              style={{
                margin: "12px 0 0",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-.03em",
              }}
            >
              {featured.title}
            </h2>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 16,
                lineHeight: 1.6,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              {featured.excerpt}
            </p>
          </div>
        </Link>

        <div
          className="sanzio-m-grid-2"
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 24,
          }}
        >
          {rest.map((post) => (
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
              <div style={{ padding: 24 }}>
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
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14.5,
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
