"use client";

import Image from "next/image";
import Link from "next/link";
import { hrIconImageProps } from "@/features/landing/hrIcon";
import { color, readableAccent } from "@/features/landing/tokens";

const HIGHLIGHTS = [
  "One account for both products — shared login and shared data",
  "Guided onboarding and data migration from your current sheets",
  "Start with one product, add the other without rebuilding anything",
];

const PILLARS = [
  {
    n: "01",
    t: "Less manual work",
    d: "Attendance, leave, records and campaigns move out of spreadsheets and into a structured platform.",
  },
  {
    n: "02",
    t: "Better visibility",
    d: "Who is in, who is on leave, what went out to customers — visible without asking three people.",
  },
  {
    n: "03",
    t: "One connected experience",
    d: "HR and communication run side by side, so teams stop jumping between disconnected tools.",
  },
  {
    n: "04",
    t: "Room to grow",
    d: "Role-based access and clean records mean the setup still works when the team doubles.",
  },
];

const PRODUCT_CARDS = [
  {
    title: "Sanzio HR Management",
    subtitle: "People operations",
    description:
      "Employee records, attendance, leave and role-based access in one organised place — so HR spends time on people instead of paperwork.",
    iconUrl: "/images/sanzio-hr-icon-only.webp",
    iconBg: "#E8F7FC",
    accentColor: color.cyanInk,
    bullets: [
      {
        lead: "One employee record.",
        text: "Profiles, documents and history stay in a single source instead of scattered files.",
      },
      {
        lead: "Attendance and leave without chasing.",
        text: "Requests, approvals and balances handled in the same flow.",
      },
      {
        lead: "Access that fits the org.",
        text: "Managers see their team, HR sees everything, employees see themselves.",
      },
    ],
    ctaLabel: "Explore HR Management →",
    ctaHref: "/sanzio-hr-management",
    external: false,
  },
  {
    title: "Sanzio Connect",
    subtitle: "Customer communication",
    description:
      "SMS, Email and WhatsApp campaigns from one dashboard — with the contact list, sending and reporting in the same place.",
    iconUrl: "/images/sanzio-connect-fab-icon.webp",
    iconBg: color.connectTint,
    accentColor: color.connectPurple,
    bullets: [
      {
        lead: "Three channels, one dashboard.",
        text: "No separate tool and separate invoice for every channel.",
      },
      {
        lead: "Campaigns you can repeat.",
        text: "Reusable templates and segments instead of rebuilding each send.",
      },
      {
        lead: "Reporting after every send.",
        text: "Delivery and engagement in plain numbers, ready to act on.",
      },
    ],
    ctaLabel: "Explore Sanzio Connect →",
    ctaHref: "/connect",
    external: false,
  },
];

function CheckIcon() {
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: color.cyan,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6L5 8.5L9.5 3.5"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function WhyProductCard({ item }) {
  const accent = readableAccent(item.accentColor);
  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    padding: 32,
    border: `1px solid ${color.border}`,
    borderRadius: 20,
    background: "#fff",
    textDecoration: "none",
    color: color.ink,
    height: "100%",
  };

  const body = (
    <>
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: item.iconBg,
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Image src={item.iconUrl} alt="" {...hrIconImageProps} />
      </span>
      <h3
        style={{
          margin: "18px 0 0",
          fontSize: 22,
          letterSpacing: "-.02em",
          fontWeight: 800,
        }}
      >
        {item.title}
      </h3>
      <p
        className="sanzio-card-kicker"
        style={{
          margin: "8px 0 0",
          fontSize: 11.5,
          fontWeight: 800,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {item.subtitle}
      </p>
      <p
        style={{
          margin: "14px 0 0",
          fontSize: 15,
          lineHeight: 1.6,
          fontWeight: 500,
          color: color.muted,
        }}
      >
        {item.description}
      </p>
      <ul
        style={{
          margin: "22px 0 0",
          padding: 0,
          listStyle: "none",
          display: "grid",
          gap: 16,
        }}
      >
        {item.bullets.map((bullet) => (
          <li
            key={bullet.lead}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              fontSize: 14.5,
              lineHeight: 1.55,
              color: color.muted,
            }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: accent,
                marginTop: 8,
              }}
            />
            <span>
              <strong style={{ fontWeight: 700, color: color.ink }}>
                {bullet.lead}
              </strong>{" "}
              {bullet.text}
            </span>
          </li>
        ))}
      </ul>
      <span
        className="sanzio-card-cta-text"
        style={{
          marginTop: "auto",
          paddingTop: 28,
          display: "inline-flex",
          alignItems: "center",
          fontSize: 14.5,
          fontWeight: 700,
          color: accent,
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

export default function WhySanzioSection() {
  return (
    <section id="why" className="sanzio-why-section">
      <div className="sanzio-why-inner">
        <div className="sanzio-why-split">
          <div className="sanzio-why-split-copy">
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: color.cyanInk,
              }}
            >
              Why Sanzio
            </p>
            <h2
              className="sanzio-why-title"
              style={{
                margin: "14px 0 0",
                maxWidth: 560,
                fontSize: 44,
                lineHeight: 1.08,
                letterSpacing: "-.03em",
                fontWeight: 800,
              }}
            >
              Why teams choose Sanzio.
            </h2>
            <p
              className="sanzio-why-lead"
              style={{
                margin: "20px 0 0",
                maxWidth: 560,
                fontSize: 16.5,
                lineHeight: 1.6,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              Two products, one platform. Sanzio HR Management keeps your people
              operations organised, and Sanzio Connect keeps your customer
              communication in one place — set up with you, not handed over as a
              login.
            </p>
          </div>

          <div
            className="sanzio-why-highlights"
            style={{
              background: "#F0FAFF",
              borderRadius: 16,
            }}
          >
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "grid",
                gap: 18,
              }}
            >
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="sanzio-why-highlight-item"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    fontSize: 15,
                    lineHeight: 1.55,
                    fontWeight: 600,
                    color: color.ink,
                    minWidth: 0,
                  }}
                >
                  <CheckIcon />
                  <span style={{ minWidth: 0, flex: 1 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="sanzio-pillar-grid"
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: `1px solid ${color.border}`,
          }}
        >
          {PILLARS.map((w, i) => (
            <div
              key={w.n}
              style={{
                padding:
                  i === 0
                    ? "38px 40px 0 0"
                    : i === PILLARS.length - 1
                      ? "38px 0 0 40px"
                      : "38px 40px 0",
                borderRight:
                  i < PILLARS.length - 1
                    ? `1px solid ${color.border}`
                    : undefined,
              }}
            >
              <div
                className="sanzio-pillar-num"
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                }}
              >
                {w.n}
              </div>
              <h3
                style={{
                  margin: "16px 0 0",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-.02em",
                }}
              >
                {w.t}
              </h3>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 15.5,
                  lineHeight: 1.55,
                  fontWeight: 500,
                  color: color.muted,
                }}
              >
                {w.d}
              </p>
            </div>
          ))}
        </div>

        <div
          className="sanzio-why-product-grid"
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 24,
          }}
        >
          {PRODUCT_CARDS.map((item) => (
            <WhyProductCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
