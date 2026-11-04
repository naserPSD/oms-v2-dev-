"use client";

import Image from "next/image";
import Link from "next/link";
import DashboardCard from "@/features/landing/components/DashboardCard";
import ImageSlot from "@/features/landing/components/ImageSlot";
import { DemoButton } from "@/features/landing/components/DemoButton";
import { HR_ICON_PNG, hrIconImageProps } from "@/features/landing/hrIcon";
import { color } from "@/features/landing/tokens";
import {
  PAGES,
  PRODUCT_DETAIL,
  PAGE_ORDER,
  PAGE_NAME,
  PAGE_LINE,
} from "@/features/landing/data/siteContent";

const SLUG = { hr: "hr", pay: "payroll", work: "workspace", rec: "recruitment" };
const TAG = { hr: "Aug 2026", pay: "FY 2026", work: "This week", rec: "Frontend Developer" };

const ICONS = {
  hr: HR_ICON_PNG,
};

function parsePct(v) {
  if (typeof v === "number") return v;
  return parseInt(String(v).replace("%", ""), 10) || 0;
}

function ChartBars({ detail, variant }) {
  if (variant === "funnel" && detail.funnel) {
    return (
      <div style={{ padding: "20px 24px 4px", display: "grid", gap: 10 }}>
        {detail.funnel.map((f) => (
          <div key={f.stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 72, fontSize: 11.5, fontWeight: 700, color: color.mutedLight }}>
              {f.stage}
            </span>
            <span
              style={{
                flex: 1,
                height: 22,
                borderRadius: 6,
                background: "#F2F5F7",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: f.w,
                  borderRadius: 6,
                  background: color.brandDeep,
                }}
              />
            </span>
            <span style={{ width: 28, textAlign: "right", fontSize: 12, fontWeight: 700 }}>
              {f.n}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "columns") {
    return (
      <div
        style={{
          padding: "20px 24px 8px",
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          height: 160,
        }}
      >
        {detail.chart.map((c) => (
          <div
            key={c.d}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                width: "70%",
                display: "flex",
                alignItems: "flex-end",
                gap: 3,
                height: "100%",
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: `${parsePct(c.on)}%`,
                  borderRadius: "4px 4px 0 0",
                  background: color.brandDeep,
                }}
              />
              <span
                style={{
                  flex: 1,
                  height: `${parsePct(c.late)}%`,
                  borderRadius: "4px 4px 0 0",
                  background: color.brandPale,
                }}
              />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: color.mutedLight }}>{c.d}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "composition") {
    const parts = [
      { label: detail.legA || "To do", pct: 28, bg: "#C9D0D6" },
      { label: detail.legB || "In progress", pct: 36, bg: color.brandMid },
      { label: "Done", pct: 36, bg: color.brandDeep },
    ];
    return (
      <div style={{ padding: "20px 24px 8px" }}>
        <div style={{ display: "flex", height: 18, borderRadius: 9, overflow: "hidden" }}>
          {parts.map((p) => (
            <span key={p.label} style={{ width: `${p.pct}%`, background: p.bg }} />
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {parts.map((p) => (
            <span
              key={p.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                color: color.muted,
              }}
            >
              <span
                style={{ width: 10, height: 10, borderRadius: 3, background: p.bg }}
              />
              {p.label} {p.pct}%
            </span>
          ))}
        </div>
      </div>
    );
  }

  // horizontal bars (hr default)
  return (
    <div style={{ padding: "20px 24px 4px", display: "grid", gap: 12 }}>
      {detail.chart.map((c) => (
        <div key={c.d} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 60, fontSize: 11.5, fontWeight: 700, color: color.mutedLight }}>
            {c.d}
          </span>
          <span
            style={{
              flex: 1,
              height: 8,
              borderRadius: 5,
              background: "#F2F5F7",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: c.on,
                borderRadius: 5,
                background: color.brandDeep,
              }}
            />
          </span>
          <span
            style={{
              width: 34,
              textAlign: "right",
              fontSize: 12,
              fontWeight: 700,
              color: color.muted,
            }}
          >
            {c.on}
          </span>
        </div>
      ))}
    </div>
  );
}

function ModuleSection({ productKey, detail, variant }) {
  if (variant === "tiles") {
    const tiles = detail.modGroups.flatMap((g) =>
      g.items.map((item) => ({ ...item, group: g.name }))
    );
    return (
      <div
        className="sanzio-m-grid-5"
        style={{
          marginTop: 44,
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 12,
        }}
      >
        {tiles.map((item) => (
          <div
            key={item.t}
            style={{
              padding: 16,
              borderRadius: 14,
              border: `1px solid ${color.border}`,
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: color.faint }}>{item.k}</div>
            <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700 }}>{item.t}</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                fontWeight: 500,
                color: color.mutedLight,
              }}
            >
              {item.d}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "spec") {
    return (
      <div style={{ marginTop: 44, display: "grid", gap: 18 }}>
        {detail.modGroups.map((g) => (
          <div
            key={g.name}
            className="sanzio-prod-module-row sanzio-m-split"
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr",
              gap: 20,
              padding: 24,
              borderRadius: 18,
              border: `1px solid ${color.border}`,
              background: "#fff",
            }}
          >
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".08em" }}>
                {g.name}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: color.faint }}>
                {g.count}
              </div>
            </div>
            <div
              className="sanzio-m-grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
              }}
            >
              {g.items.map((item) => (
                <div key={item.t}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{item.t}</div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: color.mutedLight,
                    }}
                  >
                    {item.d}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "pipeline") {
    return (
      <div style={{ marginTop: 44, display: "grid", gap: 22 }}>
        {detail.modGroups.map((g, i) => (
          <div
            key={g.name}
            style={{
              padding: 28,
              borderRadius: 20,
              border: `1px solid ${color.border}`,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: color.brandTint,
                  color: color.brandInk,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {i + 1}
              </span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{g.name}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: color.faint }}>
                  {g.count}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {g.items.map((item) => (
                <span
                  key={item.t}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: color.bgTint,
                    border: `1px solid ${color.border}`,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                  title={item.d}
                >
                  {item.t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // cards (hr)
  return (
    <div
      className="sanzio-m-grid-3"
      style={{
        marginTop: 44,
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 22,
      }}
    >
      {detail.modGroups.map((g) => (
        <div
          key={g.name}
          style={{
            padding: "30px 28px",
            border: `1px solid ${color.border}`,
            borderRadius: 20,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: 16,
              borderBottom: `1px solid ${color.borderFaint}`,
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".08em" }}>
              {g.name}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: color.faint }}>
              {g.count}
            </span>
          </div>
          {g.items.map((item) => (
            <div
              key={item.t}
              style={{
                display: "flex",
                gap: 12,
                padding: "15px 0",
                borderBottom: `1px solid ${color.borderFaint}`,
              }}
            >
              <span
                style={{
                  marginTop: 3,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color.brandDeep,
                  flex: "none",
                }}
              />
              <span>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700 }}>
                  {item.t}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 3,
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: color.mutedLight,
                  }}
                >
                  {item.d}
                </span>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * @param {"hr"|"pay"|"work"|"rec"} productKey
 * @param {"cards"|"spec"|"tiles"|"pipeline"} moduleVariant
 * @param {"bars"|"columns"|"composition"|"funnel"} chartVariant
 */
export default function ProductPage({
  productKey,
  moduleVariant = "cards",
  chartVariant = "bars",
}) {
  const page = PAGES[productKey];
  const detail = PRODUCT_DETAIL[productKey];
  const slug = SLUG[productKey];
  const others = PAGE_ORDER.filter((k) => k !== productKey);

  return (
    <div className="sanzio-product-page">
      <section className="sanzio-m-section-hero" style={{ padding: "72px 40px 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              fontSize: 12.5,
              fontWeight: 700,
              color: color.faint,
            }}
          >
            <Link href="/" style={{ color: color.faint }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/#products" style={{ color: color.faint }}>
              Products
            </Link>
            <span>/</span>
            <span style={{ color: color.ink }}>{PAGE_NAME[productKey]}</span>
          </div>
          <div style={{ marginTop: 28, maxWidth: 760 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: color.brandTint,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {ICONS[productKey] ? (
                  <Image src={ICONS[productKey]} alt="" {...hrIconImageProps} />
                ) : (
                  <span style={{ fontWeight: 800, color: color.brandInk, fontSize: 14 }}>
                    {page.kicker.slice(0, 2)}
                  </span>
                )}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 13px 6px 10px",
                  borderRadius: 999,
                  background: "#F4F6FC",
                  border: "1px solid #D6E1F5",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: color.brandDeep,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".09em",
                    color: color.brandInk,
                  }}
                >
                  {page.kicker}
                </span>
              </span>
            </div>
            <h1
              style={{
                margin: "24px 0 0",
                fontSize: 52,
                lineHeight: 1.02,
                letterSpacing: "-.04em",
                fontWeight: 800,
              }}
            >
              {page.title}
            </h1>
            <p
              style={{
                margin: "22px 0 0",
                maxWidth: 520,
                fontSize: 18,
                lineHeight: 1.6,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              {page.lead}
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <DemoButton className="sanzio-btn--brand-hover" />
              <Link
                href="/sign-in"
                className="sanzio-btn-outline"
                style={{
                  padding: "15px 22px",
                  border: `1px solid ${color.border}`,
                  borderRadius: 11,
                  fontSize: 15,
                  fontWeight: 700,
                  color: color.ink,
                  textDecoration: "none",
                }}
              >
                Log in
              </Link>
            </div>
          </div>
          <div
            className="sanzio-prod-kpi-grid sanzio-m-grid-4"
            style={{
              marginTop: 56,
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 14,
            }}
          >
            {page.stats.map((s) => (
              <div
                key={s.k}
                style={{
                  padding: "22px 20px",
                  borderRadius: 16,
                  background: color.bgSoft,
                  border: "1px solid #EEF1F4",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 32,
                    fontWeight: 800,
                    letterSpacing: "-.03em",
                  }}
                >
                  {s.v}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 6,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: color.mutedLight,
                  }}
                >
                  {s.k}
                </span>
              </div>
            ))}
            <div
              style={{
                padding: "22px 20px",
                borderRadius: 16,
                background: color.ink,
                color: "#fff",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: color.brandMid,
                }}
              >
                Included in every plan
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.6)",
                }}
              >
                No add-on pricing
              </span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 40px 0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <ImageSlot label={`app.sanzio.com/${slug} screenshot`} height={320} radius={20} />
        </div>
      </section>

      <section className="sanzio-m-section" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <h2
            style={{
              margin: 0,
              maxWidth: 560,
              fontSize: 36,
              lineHeight: 1.1,
              letterSpacing: "-.03em",
              fontWeight: 800,
            }}
          >
            {page.featureHead}
          </h2>
          <p
            style={{
              margin: "14px 0 0",
              maxWidth: 560,
              fontSize: 16,
              lineHeight: 1.6,
              fontWeight: 500,
              color: color.muted,
            }}
          >
            {page.featureLine}
          </p>
          <div
            className="sanzio-m-grid-3"
            style={{
              marginTop: 48,
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 22,
            }}
          >
            {page.features.map((f, i) => (
              <div
                key={f.t}
                style={{
                  border: `1px solid ${color.border}`,
                  borderRadius: 22,
                  padding: 24,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: color.brandTint,
                    color: color.brandInk,
                    fontSize: 11,
                    fontWeight: 800,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  style={{
                    margin: "14px 0 0",
                    fontSize: 19,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                  }}
                >
                  {f.t}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: 500,
                    color: color.muted,
                  }}
                >
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sanzio-m-section" style={{ padding: "96px 40px", background: color.bgSoft }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: ".12em",
              color: color.brandInk,
            }}
          >
            {detail.modKicker}
          </div>
          <h2
            style={{
              margin: "16px 0 0",
              fontSize: 36,
              lineHeight: 1.1,
              letterSpacing: "-.03em",
              fontWeight: 800,
            }}
          >
            {detail.modHead}
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              maxWidth: 640,
              fontSize: 15.5,
              lineHeight: 1.6,
              fontWeight: 500,
              color: color.muted,
            }}
          >
            {detail.modLine}
          </p>
          <ModuleSection
            productKey={productKey}
            detail={detail}
            variant={moduleVariant}
          />
        </div>
      </section>

      <section className="sanzio-m-section" style={{ padding: "96px 40px", background: color.bgTint }}>
        <div
          className="sanzio-m-split"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".12em",
                color: color.brandInk,
              }}
            >
              {detail.dashKicker}
            </div>
            <h2
              style={{
                margin: "16px 0 0",
                maxWidth: 440,
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: "-.03em",
                fontWeight: 800,
              }}
            >
              {detail.dashHead}
            </h2>
            <p
              style={{
                margin: "16px 0 0",
                maxWidth: 430,
                fontSize: 15.5,
                lineHeight: 1.65,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              {detail.dashLine}
            </p>
            <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
              {detail.bullets.map((b) => (
                <span key={b} style={{ fontSize: 14, fontWeight: 600, color: color.ink }}>
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
          <DashboardCard
            title={detail.cardTitle}
            tag={TAG[productKey]}
            kpis={detail.kpis}
            rows={detail.rows}
            chart={<ChartBars detail={detail} variant={chartVariant} />}
          />
        </div>
      </section>

      <section className="sanzio-m-section" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            {page.flowHead}
          </h2>
          <div
            className="sanzio-m-grid-3"
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 22,
            }}
          >
            {page.steps.map((s) => (
              <div
                key={s.n}
                style={{
                  padding: 28,
                  borderRadius: 20,
                  border: `1px solid ${color.border}`,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: color.brandTint,
                    color: color.brandInk,
                    fontSize: 14,
                    fontWeight: 800,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.n}
                </span>
                <h3 style={{ margin: "16px 0 0", fontSize: 18, fontWeight: 800 }}>{s.t}</h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    fontWeight: 500,
                    color: color.muted,
                  }}
                >
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sanzio-m-section" style={{ padding: "80px 40px", background: color.bgTint }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            Works better with the rest of Sanzio.
          </h2>
          <div
            className="sanzio-m-grid-3"
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 18,
            }}
          >
            {others.map((k) => (
              <Link
                key={k}
                href={`/products/${SLUG[k]}`}
                className="sanzio-card-hover"
                style={{
                  padding: 24,
                  borderRadius: 18,
                  background: "#fff",
                  border: `1px solid ${color.border}`,
                  textDecoration: "none",
                  color: color.ink,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800 }}>{PAGE_NAME[k]}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    color: color.muted,
                  }}
                >
                  {PAGE_LINE[k]}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: color.brandInk,
                  }}
                >
                  Explore →
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/sanzio-hr-management"
            style={{
              display: "inline-block",
              marginTop: 24,
              fontSize: 14.5,
              fontWeight: 700,
              color: color.brandInk,
            }}
          >
            See all products →
          </Link>
        </div>
      </section>

      <section
        style={{
          padding: "88px 40px",
          background: color.brandDeep,
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            {page.ctaHead}
          </h2>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 16,
              fontWeight: 500,
              color: "rgba(255,255,255,.8)",
            }}
          >
            See it running on your own data in a 30-minute walkthrough.
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <DemoButton variant="white" className="sanzio-btn--brand-hover" />
            <Link
              href="/contact"
              className="sanzio-btn-ghost-light"
              style={{
                padding: "15px 26px",
                border: "1px solid rgba(255,255,255,.45)",
                borderRadius: 11,
                fontSize: 15.5,
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
