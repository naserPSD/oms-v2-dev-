"use client";

import Link from "next/link";
import ImageSlot from "@/features/landing/components/ImageSlot";
import { color } from "@/features/landing/tokens";

export default function BlogArticle({ article }) {
  if (!article) {
    return (
      <section style={{ padding: "100px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Article not found</h1>
        <Link
          href="/blog"
          style={{
            display: "inline-block",
            marginTop: 20,
            fontWeight: 700,
            color: color.brandInk,
          }}
        >
          ← Back to blog
        </Link>
      </section>
    );
  }

  const initials = (article.authorName || "ST")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="sanzio-blog-article sanzio-m-section" style={{ padding: "72px 40px 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/blog"
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: color.brandInk,
            textDecoration: "none",
          }}
        >
          ← Blog
        </Link>
        <div
          style={{
            marginTop: 28,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".08em",
            color: color.brandInk,
          }}
        >
          {article.category} · {article.date} · {article.readTime}
        </div>
        <h1
          style={{
            margin: "16px 0 0",
            fontSize: 44,
            lineHeight: 1.1,
            letterSpacing: "-.035em",
            fontWeight: 800,
          }}
        >
          {article.title}
        </h1>
        <p
          style={{
            margin: "18px 0 0",
            fontSize: 18,
            lineHeight: 1.6,
            fontWeight: 500,
            color: color.muted,
          }}
        >
          {article.lead}
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: color.brandTint,
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 800,
              color: color.brandInk,
            }}
          >
            {initials}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              {article.authorName}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: color.mutedLight,
              }}
            >
              {article.authorRole}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          {article.coverImage ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 320,
                borderRadius: 18,
                overflow: "hidden",
                background: color.bgTint,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt={article.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <ImageSlot label="Article cover" height={320} radius={18} />
          )}
        </div>

        <div style={{ marginTop: 40 }}>
          {article.htmlBody ? (
            <div
              className="blog-article-html"
              style={{
                marginTop: 18,
                fontSize: 16.5,
                lineHeight: 1.7,
                fontWeight: 500,
                color: color.muted,
              }}
              dangerouslySetInnerHTML={{ __html: article.htmlBody }}
            />
          ) : null}
          {!article.htmlBody &&
          (article.body || []).map((block, i) => {
            if (block.h) {
              return (
                <h2
                  key={i}
                  style={{
                    margin: "36px 0 0",
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                  }}
                >
                  {block.h}
                </h2>
              );
            }
            if (block.q) {
              return (
                <blockquote
                  key={i}
                  style={{
                    margin: "28px 0 0",
                    padding: "20px 24px",
                    borderLeft: `4px solid ${color.brandDeep}`,
                    background: color.bgTint,
                    borderRadius: "0 12px 12px 0",
                    fontSize: 17,
                    lineHeight: 1.55,
                    fontWeight: 600,
                    color: color.ink,
                  }}
                >
                  {block.q}
                </blockquote>
              );
            }
            return (
              <p
                key={i}
                style={{
                  margin: "18px 0 0",
                  fontSize: 16.5,
                  lineHeight: 1.7,
                  fontWeight: 500,
                  color: color.muted,
                }}
              >
                {block.p}
              </p>
            );
          })}
        </div>
      </div>
    </article>
  );
}
