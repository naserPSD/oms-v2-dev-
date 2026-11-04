"use client";

import Image from "next/image";
import Link from "next/link";
import ImageSlot from "@/features/landing/components/ImageSlot";
import { hrIconImageProps } from "@/features/landing/hrIcon";
import { color, readableAccent } from "@/features/landing/tokens";

export const DEFAULT_BEYOND_SECTION = {
  meta: {
    eyebrow: "BEYOND THE CORE FOUR",
    title: "Other products from Sanzio.",
    ctaLabel: "Talk to our team →",
    ctaHref: "/contact",
    accentColor: color.cyanInk,
  },
  items: [
    {
      slug: "hr-management",
      title: "HR Management",
      description:
        "Keep employee records, attendance and everyday HR operations in one organised place.",
      iconUrl: "/images/sanzio-hr-icon-only.webp",
      previewUrl: null,
      previewBg: "#F5FBFE",
      features: [
        "Employee Management",
        "Attendance & Leave",
        "HR Records",
        "Role-based Access",
      ],
      ctaLabel: "Explore HR Management →",
      ctaHref: "/sanzio-hr-management",
      accentColor: color.cyanInk,
      iconBg: "#F0FAFF",
      external: false,
    },
    {
      slug: "sanzio-connect",
      title: "Sanzio Connect",
      description:
        "A communication platform to manage SMS, Email and WhatsApp marketing from one dashboard.",
      iconUrl: "/images/sanzio-connect-fab-icon.webp",
      previewUrl: "/images/sanzio-connect-dashboard.png",
      previewBg: "#FBF7FF",
      features: [
        "SMS Marketing",
        "Email Campaigns",
        "WhatsApp Messaging",
        "Analytics & Reports",
      ],
      ctaLabel: "Explore Sanzio Connect →",
      ctaHref: "/connect",
      accentColor: "#A21CAF",
      iconBg: "#F7F0FF",
      external: false,
    },
  ],
};

function mapApiSection(section) {
  if (!section?.items?.length) return DEFAULT_BEYOND_SECTION;

  const meta = {
    eyebrow: section.meta?.eyebrow || DEFAULT_BEYOND_SECTION.meta.eyebrow,
    title: section.meta?.title || DEFAULT_BEYOND_SECTION.meta.title,
    ctaLabel: section.meta?.ctaLabel || DEFAULT_BEYOND_SECTION.meta.ctaLabel,
    ctaHref: section.meta?.ctaHref || DEFAULT_BEYOND_SECTION.meta.ctaHref,
    accentColor: readableAccent(
      section.meta?.accentColor || DEFAULT_BEYOND_SECTION.meta.accentColor
    ),
  };

  const items = section.items.map((item, index) => {
    const fallback = DEFAULT_BEYOND_SECTION.items[index] || {};
    const href = item.ctaHref || fallback.ctaHref || "#";
    return {
      slug: item.slug || fallback.slug,
      title: item.title || fallback.title,
      description: item.description || fallback.description,
      iconUrl: item.iconUrl || fallback.iconUrl,
      previewUrl: item.previewUrl || null,
      previewBg: item.previewBg || fallback.previewBg || "#F5FBFE",
      features: Array.isArray(item.features) && item.features.length
        ? item.features
        : fallback.features || [],
      ctaLabel: item.ctaLabel || fallback.ctaLabel,
      ctaHref: href,
      accentColor: readableAccent(
        item.accentColor || fallback.accentColor || color.cyanInk
      ),
      iconBg: item.iconBg || fallback.iconBg || "#F0FAFF",
      external: /^https?:\/\//i.test(href),
    };
  });

  return { meta, items };
}

function ProductCard({ item }) {
  const cardStyle = {
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    padding: 28,
    border: `1px solid ${color.border}`,
    borderRadius: 20,
    background: "#fff",
    textDecoration: "none",
    color: color.ink,
  };

  const body = (
    <>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: item.iconBg,
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        {item.iconUrl ? (
          <Image
            src={item.iconUrl}
            alt=""
            {...hrIconImageProps}
            style={{
              ...hrIconImageProps.style,
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              padding: 6,
              boxSizing: "border-box",
            }}
          />
        ) : null}
      </span>
      <h3
        style={{
          margin: "16px 0 0",
          fontSize: 19,
          letterSpacing: "-.02em",
          fontWeight: 800,
          color: color.ink,
        }}
      >
        {item.title}
      </h3>
      <p
        style={{
          margin: "10px 0 0",
          fontSize: 14.5,
          lineHeight: 1.6,
          fontWeight: 500,
          color: color.muted,
        }}
      >
        {item.description}
      </p>
      <div
        className="sanzio-product-card-checklist"
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 14px",
        }}
      >
        {item.features.map((feature) => (
          <span
            key={feature}
            style={{ fontSize: 12.5, fontWeight: 600, color: color.muted }}
          >
            ✓ {feature}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          borderRadius: 12,
          overflow: "hidden",
          background: item.previewBg,
          aspectRatio: "16/9",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.previewUrl ? (
          <Image
            src={item.previewUrl}
            alt={`${item.title} preview`}
            width={640}
            height={360}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImageSlot
            label="Drop dashboard preview"
            height="100%"
            radius={0}
            style={{ height: "100%", border: 0, borderRadius: 0 }}
          />
        )}
      </div>
      <span
        className="sanzio-card-cta-text"
        style={{
          marginTop: 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 700,
          color: readableAccent(item.accentColor),
        }}
      >
        {item.ctaLabel}
      </span>
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="sanzio-product-card"
        style={cardStyle}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={item.ctaHref} className="sanzio-product-card" style={cardStyle}>
      {body}
    </Link>
  );
}

export default function BeyondProductsSection({ section }) {
  const { meta, items } = mapApiSection(section);

  return (
    <section
      className="sanzio-beyond-section"
      style={{ padding: "48px 40px 64px", background: "#F7F8FA" }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          className="sanzio-beyond-header"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div className="sanzio-beyond-headline" style={{ minWidth: 0, flex: "1 1 280px" }}>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".12em",
                color: meta.accentColor || color.cyanInk,
              }}
            >
              {meta.eyebrow}
            </div>
            <h2
              style={{
                margin: "16px 0 0",
                maxWidth: 520,
                fontSize: 44,
                lineHeight: 1.1,
                letterSpacing: "-.03em",
                fontWeight: 800,
                textWrap: "balance",
              }}
            >
              {meta.title}
            </h2>
          </div>
          <Link
            href={meta.ctaHref || "/contact"}
            className="sanzio-beyond-cta"
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              color: meta.accentColor || color.cyanInk,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {meta.ctaLabel}
          </Link>
        </div>
        <div
          className="sanzio-beyond-grid sanzio-m-grid-2"
          style={{
            marginTop: 44,
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 22,
          }}
        >
          {items.map((item) => (
            <ProductCard key={item.slug || item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
