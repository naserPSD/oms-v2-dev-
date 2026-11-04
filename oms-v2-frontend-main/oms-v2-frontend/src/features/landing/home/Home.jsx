"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { fetchPublicActiveSubscriptionPlans } from "@/services/subscriptionApi";
import { DemoButton } from "@/features/landing/components/DemoButton";
import ImageSlot from "@/features/landing/components/ImageSlot";
import { HR_ICON_WEBP, HR_ICON_W, HR_ICON_H } from "@/features/landing/hrIcon";

const BeyondProductsSection = dynamic(
  () => import("@/features/landing/home/BeyondProductsSection"),
  { loading: () => null }
);
const WhySanzioSection = dynamic(
  () => import("@/features/landing/home/WhySanzioSection"),
  { loading: () => null }
);
const WhyBuyFromSanzioSection = dynamic(
  () => import("@/features/landing/home/WhyBuyFromSanzioSection"),
  { loading: () => null }
);
const BlogPreviewSection = dynamic(
  () => import("@/features/landing/blog/BlogPreviewSection"),
  { loading: () => null }
);
import { color } from "@/features/landing/tokens";
import { TABS, BOARD } from "@/features/landing/data/siteContent";

const TAB_ORDER = ["hr", "pay", "work", "rec"];
const TAB_LABELS = { hr: "HR", pay: "Payroll", work: "Workspace", rec: "Recruitment" };
const PAGE_NAME = {
  hr: "HR Management",
  pay: "Payroll Management",
  work: "Workspace",
  rec: "Recruitment",
};

const FLOW = [
  { name: "Recruitment", word: "HIRING", r: "3px", href: "/products/recruitment", arrow: true },
  { name: "HR", word: "PEOPLE", r: "50%", href: "/sanzio-hr-management", arrow: true },
  { name: "Payroll", word: "PAY", r: "4px", href: "/products/payroll", arrow: true },
  { name: "Workspace", word: "WORK", r: "2px", href: "/products/workspace", arrow: false },
];

const SUITE = [
  {
    href: "/sanzio-hr-management",
    title: "HR Management",
    desc: "Employee records, attendance and everyday HR operations in one organised place.",
    icon: "hr",
  },
  {
    href: "/products/payroll",
    title: "Payroll Management",
    desc: "Salary structure, payroll runs and payslips — configured once, repeated cleanly.",
    icon: "pay",
  },
  {
    href: "/products/workspace",
    title: "Workspace",
    desc: "Tasks, ownership and progress brought into one organised workspace.",
    icon: "work",
  },
  {
    href: "/products/recruitment",
    title: "Recruitment",
    desc: "Candidates organised from application to first day, without losing visibility.",
    icon: "rec",
  },
];

const PLANS = [
  {
    name: "Essential",
    popular: false,
    customPrice: false,
    priceMonthly: 990,
    line: "Start with the one Sanzio product your team needs most.",
    items: [
      "Any one Sanzio product",
      "Guided setup & data import",
      "Up to 50 users",
      "Standard support (24h reply)",
    ],
    cta: "Get Pricing",
  },
  {
    name: "Business",
    popular: true,
    customPrice: false,
    priceMonthly: 1690,
    line: "Both products, one workspace, connected records across HR and outreach.",
    items: [
      "Sanzio HR Management + Connect",
      "Unlimited users",
      "Role-based access & approvals",
      "Priority support (4h reply)",
    ],
    cta: "Contact Sales",
  },
  {
    name: "Enterprise",
    popular: false,
    customPrice: true,
    line: "For larger teams that need dedicated onboarding and support.",
    items: [
      "Everything in Business",
      "Dedicated onboarding manager",
      "Custom roles & data migration",
      "SLA-backed support",
    ],
    cta: "Talk to Sales",
  },
];

const PRICING_FOOTNOTES = [
  "No setup fees on any plan — onboarding is included, not billed separately",
  "Switch or cancel any time — no long-term contract required",
  "Free training for admins and staff, included on every tier",
];

function parsePlanFeatures(value) {
  if (!value) return [];
  if (typeof value === "object") {
    if (Array.isArray(value)) return value;
    const items = [];
    if (value.storage) items.push(`${value.storage} Storage`);
    if (value.projects) items.push(value.projects === "Unlimited" ? "Unlimited Projects" : `${value.projects} Projects`);
    if (Array.isArray(value.features)) items.push(...value.features);
    return items.length > 0 ? items : value.features || [];
  }

  const str = String(value).trim();
  try {
    const stripped = str.replace(/<[^>]*>/g, "").trim();
    const parsed = JSON.parse(stripped);
    if (parsed) {
      const items = [];
      if (parsed.storage) items.push(`${parsed.storage} Storage`);
      if (parsed.projects) items.push(parsed.projects === "Unlimited" ? "Unlimited Projects" : `${parsed.projects} Projects`);
      if (Array.isArray(parsed.features)) items.push(...parsed.features);
      if (items.length > 0) return items;
    }
  } catch {
    // fallback to HTML parsing below
  }

  const text = str
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapRawPlanToPricing(rawPlan, isPopularPlan) {
  const parsedFeatures = parsePlanFeatures(rawPlan.features);
  const items = [];

  if (rawPlan.minUsers != null || rawPlan.maxUsers != null) {
    const userRange = rawPlan.maxUsers
      ? `${rawPlan.minUsers ?? 1} - ${rawPlan.maxUsers} Users`
      : `${rawPlan.minUsers ?? 1}+ Users`;
    items.push(`Team: ${userRange}`);
  }

  if (rawPlan.trialDays) {
    items.push(`${rawPlan.trialDays}-day free trial included`);
  }

  items.push(...parsedFeatures);

  const monthlyPrice = Number(rawPlan.monthlyPrice) || 0;
  const yearlyPrice = Number(rawPlan.yearlyPrice) || 0;

  const isPopular = Boolean(isPopularPlan);

  return {
    id: rawPlan.id,
    name: rawPlan.name,
    popular: isPopular,
    customPrice: monthlyPrice <= 0 && yearlyPrice <= 0,
    priceMonthly: monthlyPrice,
    priceYearly: yearlyPrice,
    currency: rawPlan.currency || "BDT",
    line: rawPlan.description || "Scales with your team, not with feature lockouts.",
    items: items.length > 0 ? items : [
      "Full platform access",
      "Guided setup & data import",
      "Standard support",
    ],
    cta: isPopular
      ? "Contact Sales"
      : rawPlan.name?.toLowerCase().includes("enterprise")
      ? "Talk to Sales"
      : "Get Started",
  };
}

function formatPlanPrice(amount, currency = "BDT") {
  if (amount == null) return "Custom";
  const symbol = currency === "USD" ? "$" : "৳";
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

function getPlanPrice(plan, billing) {
  if (plan.customPrice) return null;
  if (billing === "annual") {
    if (plan.priceYearly && plan.priceYearly > 0) {
      return plan.priceYearly;
    }
    return Math.round(plan.priceMonthly * 12 * 0.85);
  }
  return plan.priceMonthly;
}

const LOGO_SLOTS = [
  "customer-logo-1",
  "customer-logo-2",
  "customer-logo-3",
  "customer-logo-4",
  "customer-logo-1",
  "customer-logo-2",
  "customer-logo-3",
  "customer-logo-4",
];

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

function statusPill(status) {
  return /review|leave|screening/i.test(status)
    ? { bg: "#F7F8FA", fg: "#6B7076" }
    : { bg: "#F0FAFF", fg: color.cyanInk };
}

function SuiteIcon({ type }) {
  if (type === "hr") {
    return (
      <span
        style={{
          flex: "none",
          width: 46,
          height: 46,
          borderRadius: 13,
          background: "#F0FAFF",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Image
          src={HR_ICON_WEBP}
          alt=""
          width={HR_ICON_W}
          height={HR_ICON_H}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: 7,
            display: "block",
            boxSizing: "border-box",
          }}
        />
      </span>
    );
  }
  if (type === "pay") {
    return (
      <span
        style={{
          flex: "none",
          width: 46,
          height: 46,
          borderRadius: 13,
          background: "#F0FAFF",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            width: 17,
            height: 13,
            borderRadius: 3,
            border: "2.5px solid #44BAEB",
          }}
        />
      </span>
    );
  }
  if (type === "work") {
    return (
      <span
        style={{
          flex: "none",
          width: 46,
          height: 46,
          borderRadius: 13,
          background: "#F0FAFF",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            border: "2.5px solid #44BAEB",
            borderRadius: 3,
          }}
        />
      </span>
    );
  }
  return (
    <span
      style={{
        flex: "none",
        width: 46,
        height: 46,
        borderRadius: 13,
        background: "#F0FAFF",
        display: "grid",
        placeItems: "center",
      }}
    >
      <span
        style={{
          width: 18,
          height: 3,
          background: "#44BAEB",
          boxShadow: "0 6px 0 #44BAEB, 0 -6px 0 #9FDDF6",
        }}
      />
    </span>
  );
}

function BrowserMock({ tab, tabKey }) {
  const isPay = tabKey === "pay";
  const isBoard = tab.view === "board";
  const isTable = tab.view === "table";

  return (
    <div
      className="sanzio-browser-mock"
      style={{
        borderRadius: 22,
        background: "#fff",
        border: `1px solid ${color.border}`,
        boxShadow: "0 34px 74px -40px rgba(29,27,27,.4)",
        overflow: "hidden",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          height: 38,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 15px",
          borderBottom: "1px solid #EEF1F4",
          background: "#FCFDFE",
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E6EAED" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E6EAED" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E6EAED" }} />
        <span
          style={{
            marginLeft: 14,
            padding: "4px 12px",
            borderRadius: 7,
            background: "#F2F5F7",
            fontSize: 11,
            fontWeight: 600,
            color: "#8A9097",
          }}
        >
          app.sanzio.com/{tab.slug}
        </span>
      </div>

      <div className="sanzio-browser-mock-body" style={{ display: "flex" }}>
        <div
          className="sanzio-browser-mock-sidebar"
          style={{
            flex: "none",
            width: 184,
            borderRight: "1px solid #EEF1F4",
            padding: "18px 14px",
            background: "#FCFDFE",
          }}
        >
          <Image
            className="sanzio-browser-mock-sidebar-logo"
            src="/images/sanzio-logo.webp"
            alt="Sanzio"
            width={80}
            height={16}
            style={{
              height: 16,
              width: "auto",
              display: "block",
              margin: "2px 0 22px 6px",
            }}
          />
          {tab.nav.map((label, i) => (
            <div
              key={label}
              className="sanzio-browser-mock-nav-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 600,
                background: i === tab.navActive ? "#F0FAFF" : "transparent",
                color: i === tab.navActive ? color.cyanInk : "#6B7076",
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 13,
                  height: 13,
                  borderRadius: 4,
                  border: "2px solid currentColor",
                  opacity: 0.5,
                }}
              />
              {label}
            </div>
          ))}
        </div>

        <div
          className="sanzio-browser-mock-main"
          style={{ flex: 1, minWidth: 0, padding: "22px 24px", overflow: "hidden" }}
        >
          <div
            className="sanzio-browser-mock-toolbar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>
              {tab.appTitle}
            </div>
            <div className="sanzio-browser-mock-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <span
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${color.border}`,
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#6B7076",
                }}
              >
                Filter
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: color.cyan,
                  color: "#fff",
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                {tab.action}
              </span>
            </div>
          </div>

          {isPay ? (
            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 14,
                background: color.ink,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: ".09em",
                    color: "rgba(255,255,255,.5)",
                  }}
                >
                  CURRENT RUN
                </div>
                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800 }}>
                  August 2026 · in review
                </div>
                <div
                  style={{
                    marginTop: 12,
                    height: 6,
                    borderRadius: 99,
                    background: "rgba(255,255,255,.16)",
                  }}
                >
                  <div
                    style={{
                      width: "82%",
                      height: "100%",
                      borderRadius: 99,
                      background: color.cyan,
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>
                  82%
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.55)",
                  }}
                >
                  APPROVED
                </div>
              </div>
            </div>
          ) : null}

          <div
            className="sanzio-browser-mock-tiles"
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 11,
            }}
          >
            {tab.tiles.map(([label, value, sub]) => (
              <div
                key={label}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "#FAFBFC",
                  border: "1px solid #EEF1F4",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: ".07em",
                    color: color.muted,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 21,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#8A9097",
                  }}
                >
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {isBoard ? (
            <div
              className="sanzio-browser-mock-board sanzio-m-grid-3"
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
              }}
            >
              {BOARD.map((col) => (
                <div
                  key={col.name}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "#FAFBFC",
                    border: "1px solid #EEF1F4",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: ".07em",
                      color: "#6B7076",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: col.dot,
                      }}
                    />
                    {col.name}
                  </div>
                  <div style={{ marginTop: 10, display: "grid", gap: 9 }}>
                    {col.cards.map((c) => (
                      <div
                        key={c.t}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          background: "#fff",
                          border: "1px solid #EEF1F4",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1.35,
                          }}
                        >
                          {c.t}
                        </div>
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: "#F5FBFE",
                              color: color.cyanInk,
                              fontSize: 8.5,
                              fontWeight: 800,
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {c.i}
                          </span>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: color.muted,
                            }}
                          >
                            {c.d}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {isTable ? (
            <div className="sanzio-browser-mock-table-wrap">
              <div
                className="sanzio-browser-mock-table-head"
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: ".07em",
                  color: color.muted,
                  paddingBottom: 9,
                  borderBottom: "1px solid #EEF1F4",
                  minWidth: 320,
                }}
              >
                <span style={{ flex: "none", width: 28 }} />
                <span className="sanzio-browser-mock-col-name" style={{ width: 150 }}>
                  {tab.cols[0]}
                </span>
                <span style={{ flex: 1, minWidth: 80 }}>{tab.cols[1]}</span>
                <span style={{ flex: "none" }}>{tab.cols[2]}</span>
              </div>
              {tab.rows.map((r) => {
                const pill = statusPill(r[2]);
                const avBg = tabKey === "rec" ? "#F7F8FA" : "#F5FBFE";
                const avFg = tabKey === "rec" ? color.muted : color.cyanInk;
                return (
                  <div
                    key={r[0]}
                    className="sanzio-browser-mock-table-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 0",
                      borderBottom: "1px solid #F2F5F7",
                      minWidth: 320,
                    }}
                  >
                    <span
                      style={{
                        flex: "none",
                        width: 28,
                        height: 28,
                        borderRadius: 9,
                        background: avBg,
                        color: avFg,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 10.5,
                        fontWeight: 800,
                      }}
                    >
                      {initials(r[0])}
                    </span>
                    <span
                      className="sanzio-browser-mock-col-name"
                      style={{ width: 150, fontSize: 12.5, fontWeight: 700 }}
                    >
                      {r[0]}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#8A9097",
                      }}
                    >
                      {r[1]}
                    </span>
                    <span
                      style={{
                        padding: "4px 9px",
                        borderRadius: 6,
                        fontSize: 10.5,
                        fontWeight: 800,
                        background: pill.bg,
                        color: pill.fg,
                      }}
                    >
                      {r[2]}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PricingSection({ headingTag = "h2", initialPlans = null }) {
  const Heading = headingTag;
  const [billing, setBilling] = useState("monthly");
  const [plansData, setPlansData] = useState(
    Array.isArray(initialPlans) && initialPlans.length > 0 ? initialPlans : []
  );
  const isAnnual = billing === "annual";

  useEffect(() => {
    if (Array.isArray(initialPlans) && initialPlans.length > 0) {
      setPlansData(initialPlans);
      return;
    }
    fetchPublicActiveSubscriptionPlans()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlansData(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load active plans dynamically:", err);
      });
  }, [initialPlans]);

  const activePlansList = useMemo(() => {
    if (!plansData || plansData.length === 0) return PLANS;

    // Strictly sort by sortOrder ascending (1st is 1st, 2nd is 2nd, etc.)
    const sorted = [...plansData].sort((a, b) => {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.id ?? 0) - (b.id ?? 0);
    });

    // Exactly one plan is marked Most Popular:
    // 1) Explicit isPopular from database / admin toggle
    // 2) Fallback to 'growth' plan
    // 3) Fallback to middle plan in list
    const explicitPopular = sorted.find(
      (p) => p.isPopular === true || p.isPopular === 1 || p.is_popular === 1
    );
    const growthPlan = sorted.find(
      (p) => p.slug === "growth" || p.name?.toLowerCase().includes("growth")
    );
    const middlePlan =
      sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : null;

    const popularId =
      explicitPopular?.id ?? growthPlan?.id ?? middlePlan?.id ?? null;

    return sorted.map((p) => mapRawPlanToPricing(p, p.id === popularId));
  }, [plansData]);

  return (
    <section
      id="pricing"
      className="sanzio-pricing-section"
      style={{ padding: "48px 40px 64px", background: "#F5FBFE" }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: color.cyanInk,
              }}
            >
              Pricing
            </p>
            <Heading
              style={{
                margin: "14px 0 0",
                fontSize: 44,
                lineHeight: 1.08,
                letterSpacing: "-.03em",
                fontWeight: 800,
              }}
            >
              Simple plans for growing teams.
            </Heading>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 17,
                lineHeight: 1.55,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              Choose Sanzio HR Management, Sanzio Connect, or both — pricing scales
              with your headcount, not with feature lockouts.
            </p>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: 5,
              borderRadius: 999,
              background: "#fff",
              border: `1px solid ${color.border}`,
            }}
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: 0,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                background: !isAnnual ? color.ink : "transparent",
                color: !isAnnual ? "#fff" : color.ink,
                transition: "background .16s, color .16s",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: 0,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                background: isAnnual ? color.ink : "transparent",
                color: isAnnual ? "#fff" : color.ink,
                transition: "background .16s, color .16s",
              }}
            >
              Annual
            </button>
            <span
              style={{
                marginRight: 8,
                padding: "4px 8px",
                borderRadius: 6,
                background: color.successBg,
                color: color.successFg,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".04em",
              }}
            >
              SAVE 15%
            </span>
          </div>
        </div>

        <div
          className="sanzio-pricing-grid"
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns:
              activePlansList.length <= 3
                ? "repeat(3, 1fr)"
                : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          {activePlansList.map((plan) => {
            const price = getPlanPrice(plan, billing);

            return (
              <div
                key={plan.id || plan.name}
                style={{
                  position: "relative",
                  padding: 32,
                  background: plan.popular ? color.ink : "#fff",
                  color: plan.popular ? "#fff" : color.ink,
                  border: plan.popular ? "none" : `1px solid ${color.border}`,
                  borderRadius: 22,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: plan.popular
                    ? "0 30px 60px -34px rgba(29,27,27,.55)"
                    : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 19, fontWeight: 800 }}>{plan.name}</div>
                  {plan.popular ? (
                    <div
                      style={{
                        padding: "5px 11px",
                        borderRadius: 7,
                        background: color.cyan,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: ".06em",
                      }}
                    >
                      MOST POPULAR
                    </div>
                  ) : null}
                </div>

                {plan.customPrice ? (
                  <div
                    style={{
                      marginTop: 18,
                      fontSize: 34,
                      lineHeight: 1.1,
                      letterSpacing: "-.03em",
                      fontWeight: 800,
                    }}
                  >
                    Custom pricing
                  </div>
                ) : (
                  <div>
                    <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 34,
                          lineHeight: 1.1,
                          letterSpacing: "-.03em",
                          fontWeight: 800,
                        }}
                      >
                        {formatPlanPrice(price, plan.currency)}
                      </span>
                      <span
                        style={{
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: plan.popular ? "rgba(255,255,255,.66)" : color.muted,
                        }}
                      >
                        / {isAnnual ? "year" : "month"}
                      </span>
                    </div>
                    {isAnnual && plan.priceYearly > 0 && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          color: plan.popular ? "rgba(255,255,255,.75)" : color.cyanInk,
                        }}
                      >
                        ৳{Math.round(plan.priceYearly / 12).toLocaleString("en-US")}/mo equivalent
                      </div>
                    )}
                  </div>
                )}

                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    fontWeight: 500,
                    color: plan.popular ? "rgba(255,255,255,.88)" : color.muted,
                  }}
                >
                  {plan.line}
                </p>
                <div style={{ margin: "24px 0 28px", display: "grid", gap: 10 }}>
                  {plan.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        gap: 9,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: plan.popular ? "rgba(255,255,255,.92)" : "#3F4449",
                      }}
                    >
                      <span
                        style={{
                          color: plan.popular ? "#E8F7FC" : color.cyanInk,
                          fontWeight: 800,
                        }}
                      >
                        ·
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
                <Link
                  href="/contact"
                  className={`sanzio-pricing-cta ${plan.popular ? "sanzio-pricing-cta--popular" : ""}`}
                  style={{
                    marginTop: "auto",
                    textAlign: "center",
                    padding: 13,
                    borderRadius: 11,
                    fontSize: 14.5,
                    fontWeight: 700,
                    textDecoration: "none",
                    background: plan.popular ? color.cyanButton : "transparent",
                    color: plan.popular ? "#fff" : color.ink,
                    border: plan.popular ? "none" : `1px solid ${color.border}`,
                    transition: "border-color .16s, background .16s, color .16s, transform .16s",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div
          className="sanzio-m-grid-3"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {PRICING_FOOTNOTES.map((note) => (
            <div
              key={note}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "18px 20px",
                borderRadius: 14,
                background: "#fff",
                border: `1px solid ${color.border}`,
              }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#F0FAFF",
                  color: color.cyanInk,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  fontWeight: 600,
                  color: color.muted,
                }}
              >
                {note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home({ beyondSection = null, blogPosts = [], initialPlans = null }) {
  const [tabKey, setTabKey] = useState("hr");
  const tab = TABS[tabKey];

  return (
    <>
      <style>{`@keyframes logoMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>

      <section
        id="top"
        className="sanzio-hero-top"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "40px 40px 64px",
          backgroundColor: "#F5FBFE",
        }}
      >
        <Image
          src="/images/home-hero-background.webp"
          alt=""
          aria-hidden
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={80}
          className="sanzio-hero-bg"
          style={{
            objectFit: "cover",
            objectPosition: "right bottom",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          className="sanzio-hero-grid"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1320,
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "minmax(420px,1fr) minmax(520px,1.05fr)",
            gap: 72,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 14px 7px 11px",
                border: `1px solid ${color.border}`,
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: ".1em",
                color: "#6B7076",
                background: "#fff",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color.cyan,
                }}
              />
              THE CONNECTED WORKFORCE PLATFORM
            </div>
            <h1
              style={{
                margin: "26px 0 0",
                fontSize: 63,
                lineHeight: 1.03,
                letterSpacing: "-.035em",
                fontWeight: 800,
                textWrap: "balance",
              }}
            >
              Run your people, payroll, work and hiring from{" "}
              <span style={{ color: color.cyanInk }}>one place.</span>
            </h1>
            <p
              style={{
                margin: "26px 0 0",
                maxWidth: 470,
                fontSize: 18,
                lineHeight: 1.55,
                fontWeight: 500,
                color: color.muted,
                textWrap: "pretty",
              }}
            >
              Sanzio brings the essential parts of workforce management together in one
              simple, connected platform.
            </p>
            <div
              style={{
                marginTop: 38,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <DemoButton variant="cyan" style={{ fontSize: 15.5 }} />
              <Link
                href="#products"
                className="sanzio-btn-outline"
                style={{
                  padding: "15px 24px",
                  border: "1px solid #4F9AD1",
                  borderRadius: 11,
                  fontSize: 15.5,
                  fontWeight: 700,
                  color: color.ink,
                  textDecoration: "none",
                  transition: "border-color .16s, background .16s",
                }}
              >
                Explore Products
              </Link>
            </div>
          </div>

          <div
            className="sanzio-hero-dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
            }}
          >
            <Image
              src="/images/home-hero-dashboard.webp"
              alt="Sanzio HR dashboard on a tablet"
              width={760}
              height={570}
              priority
              fetchPriority="high"
              sizes="(max-width: 900px) 100vw, 52vw"
              quality={80}
              style={{
                width: "min(760px, 52vw)",
                maxWidth: "none",
                height: "auto",
                display: "block",
                mixBlendMode: "multiply",
                transform: "translate(40px, 0) scale(1.04)",
              }}
            />
          </div>
        </div>
      </section>

      <section
        id="products"
        className="sanzio-products-section"
        style={{ background: "#F5FBFE", padding: "48px 40px 64px" }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            className="sanzio-products-section-head"
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            <div className="sanzio-products-section-headline">
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".11em",
                  color: color.cyanInk,
                }}
              >
                EVERYTHING NEEDED TO MANAGE THE MODERN WORKFORCE
              </div>
              <h2
                style={{
                  margin: "16px 0 0",
                  fontSize: 44,
                  lineHeight: 1.08,
                  letterSpacing: "-.03em",
                  fontWeight: 800,
                }}
              >
                Four features. One Sanzio.
              </h2>
            </div>
            <div
              className="sanzio-products-tabs"
              style={{
                display: "flex",
                gap: 8,
                padding: 6,
                maxWidth: "100%",
                overflowX: "auto",
                background: "#fff",
                border: `1px solid ${color.border}`,
                borderRadius: 14,
              }}
            >
              {TAB_ORDER.map((key) => {
                const active = tabKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className="sanzio-products-tab-btn"
                    onClick={() => setTabKey(key)}
                    style={{
                      padding: "11px 18px",
                      border: 0,
                      borderRadius: 10,
                      fontFamily: "inherit",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background .18s, color .18s",
                      background: active ? color.ink : "transparent",
                      color: active ? "#fff" : color.muted,
                    }}
                  >
                    {TAB_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="sanzio-products-tab-layout"
            style={{
              marginTop: 44,
              display: "grid",
              gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div className="sanzio-products-tab-copy">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 13px 6px 10px",
                  borderRadius: 999,
                  background: "#fff",
                  border: "1px solid #CFE9F6",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: color.cyan,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".09em",
                    color: color.cyanInk,
                  }}
                >
                  {PAGE_NAME[tabKey].toUpperCase()}
                </span>
              </div>
              <h3
                style={{
                  margin: "18px 0 0",
                  fontSize: 32,
                  lineHeight: 1.12,
                  letterSpacing: "-.025em",
                  fontWeight: 800,
                  textWrap: "balance",
                }}
              >
                {tab.title}
              </h3>
              <p
                style={{
                  margin: "14px 0 0",
                  maxWidth: 420,
                  fontSize: 16,
                  lineHeight: 1.6,
                  fontWeight: 500,
                  color: color.muted,
                }}
              >
                {tab.line}
              </p>
              <div
                style={{
                  marginTop: 26,
                  paddingTop: 22,
                  borderTop: "1px solid #E1EEF5",
                  display: "grid",
                  gap: 14,
                }}
              >
                {tab.caps.map((cap) => (
                  <div
                    key={cap}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      fontSize: 14.5,
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        flex: "none",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#fff",
                        border: "1px solid #CFE9F6",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: color.cyan,
                        }}
                      />
                    </span>
                    {cap}
                  </div>
                ))}
              </div>
              <DemoButton
                variant="ink"
                className="sanzio-arrow-btn"
                style={{
                  marginTop: 32,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "14px 22px",
                  fontSize: 14.5,
                }}
              >
                {tab.cta} <span className="sanzio-arrow-icon" style={{ transition: "transform .18s ease", display: "inline-block" }}>→</span>
              </DemoButton>
            </div>
            <div className="sanzio-products-tab-mock">
              <BrowserMock tab={tab} tabKey={tabKey} />
            </div>
          </div>
        </div>
      </section>

      <section
        className="sanzio-suite-intro-section"
        style={{
          padding: "48px 40px 40px",
          background: "linear-gradient(180deg,#fff 0%,#F7FBFD 100%)",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            className="sanzio-m-split"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr minmax(300px,400px)",
              gap: 72,
              alignItems: "end",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  color: color.cyanInk,
                }}
              >
                THE SANZIO SUITE
              </div>
              <h2
                style={{
                  margin: "16px 0 0",
                  maxWidth: 620,
                  fontSize: 44,
                  lineHeight: 1.08,
                  letterSpacing: "-.03em",
                  fontWeight: 800,
                  textWrap: "balance",
                }}
              >
                A product for every part of the employee journey.
              </h2>
            </div>
            <p
              style={{
                margin: 0,
                maxWidth: 400,
                fontSize: 16,
                lineHeight: 1.6,
                fontWeight: 500,
                color: color.muted,
                textWrap: "pretty",
              }}
            >
              Four features built on one shared foundation — so people data, work and
              payroll never drift apart.
            </p>
          </div>
          <div style={{ marginTop: 52, borderTop: `1px solid ${color.border}` }}>
            {SUITE.map((p, i) => (
              <Link
                key={p.href}
                href={p.href}
                className="sanzio-suite-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: "30px 4px",
                  borderBottom: i < SUITE.length - 1 ? `1px solid ${color.border}` : 0,
                  textDecoration: "none",
                  color: color.ink,
                }}
              >
                <SuiteIcon type={p.icon} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 20,
                      letterSpacing: "-.02em",
                      fontWeight: 800,
                      color: color.ink,
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      margin: "6px 0 0",
                      maxWidth: 520,
                      fontSize: 14.5,
                      lineHeight: 1.5,
                      fontWeight: 500,
                      color: color.muted,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>
                <span
                  className="sanzio-suite-cta"
                  style={{
                    flex: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: color.ink,
                    transition: "color .16s",
                  }}
                >
                  Explore <span className="sanzio-arrow-icon" style={{ transition: "transform .18s ease", display: "inline-block" }}>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="sanzio-flow-section"
        style={{
          padding: "48px 40px 64px",
          background: "#F7F8FA",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 44,
              letterSpacing: "-.03em",
              fontWeight: 800,
            }}
          >
            Better together.
          </h2>
          <p
            style={{
              margin: "16px auto 0",
              maxWidth: 560,
              fontSize: 17,
              lineHeight: 1.55,
              fontWeight: 500,
              color: color.muted,
            }}
          >
            From hiring a person to managing their work and payroll, Sanzio keeps
            essential workforce operations connected.
          </p>
          <div className="sanzio-flow-row">
            {FLOW.map((f) => (
              <div key={f.name} className="sanzio-flow-step">
                <Link
                  href={f.href}
                  className="sanzio-flow-card"
                  style={{
                    display: "block",
                    padding: "22px 16px",
                    background: "#fff",
                    border: `1px solid ${color.border}`,
                    borderRadius: 18,
                    color: color.ink,
                    textDecoration: "none",
                    textAlign: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      margin: "0 auto",
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "#F5FBFE",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: 13,
                        height: 13,
                        border: "2.5px solid #44BAEB",
                        borderRadius: f.r,
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 12, fontSize: 14.5, fontWeight: 800 }}>
                    {f.name}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      color: color.muted,
                    }}
                  >
                    {f.word}
                  </div>
                </Link>
                {f.arrow ? (
                  <div className="sanzio-flow-connector" aria-hidden>
                    <span className="sanzio-flow-connector-dot" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>


      <BeyondProductsSection section={beyondSection} />


      <WhySanzioSection />

      <WhyBuyFromSanzioSection />

      <PricingSection initialPlans={initialPlans} />

      <BlogPreviewSection posts={blogPosts} />

      <section
        id="resources"
        className="sanzio-resources-section"
        style={{ padding: "48px 40px 64px", background: "#F7F8FA" }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 44,
              lineHeight: 1.12,
              letterSpacing: "-.03em",
              fontWeight: 800,
              textWrap: "balance",
            }}
          >
            Built for teams that take their operations seriously.
          </h2>
          <p
            style={{
              margin: "16px auto 0",
              maxWidth: 520,
              fontSize: 16,
              lineHeight: 1.6,
              fontWeight: 500,
              color: color.muted,
            }}
          >
            Trusted by operations, HR and finance teams running Sanzio every day.
          </p>
          <Link
            href="/contact"
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14.5,
              fontWeight: 700,
              color: color.cyanInk,
            }}
          >
            Talk to our team →
          </Link>
          <div
            style={{
              marginTop: 52,
              overflow: "hidden",
              width: "100%",
              maskImage:
                "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
            }}
          >
            <div
              className="sanzio-logo-marquee-track"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 64,
                width: "max-content",
                animation: "logoMarquee 22s linear infinite",
              }}
            >
              {LOGO_SLOTS.map((id, i) => (
                <div
                  key={`${id}-${i}`}
                  className="sanzio-logo-slot-wrap"
                  style={{
                    flex: "none",
                    width: 150,
                    height: 56,
                  }}
                >
                  <ImageSlot
                    label="Customer logo"
                    height={56}
                    radius={10}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="sanzio-demo-section" style={{ padding: 40 }}>
        <div
          className="sanzio-demo-banner"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            position: "relative",
            borderRadius: 28,
            background: color.cyanButton,
            padding: "96px 64px",
            overflow: "hidden",
          }}
        >
          <div
            className="sanzio-demo-orb sanzio-demo-orb-a"
            aria-hidden
            style={{
              position: "absolute",
              right: -80,
              top: -80,
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "rgba(255,255,255,.12)",
            }}
          />
          <div
            className="sanzio-demo-orb sanzio-demo-orb-b"
            aria-hidden
            style={{
              position: "absolute",
              right: 120,
              bottom: -140,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
            }}
          />
          <div style={{ position: "relative", maxWidth: 640 }}>
            <h2
              className="sanzio-demo-title"
              style={{
                margin: 0,
                fontSize: 52,
                lineHeight: 1.05,
                letterSpacing: "-.035em",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              Ready to run work better?
            </h2>
            <p
              className="sanzio-demo-lead"
              style={{
                margin: "18px 0 0",
                fontSize: 18,
                lineHeight: 1.5,
                fontWeight: 600,
                color: "rgba(255,255,255,.95)",
              }}
            >
              See how Sanzio can bring people, payroll, work and hiring together.
            </p>
            <div style={{ marginTop: 36, display: "flex", gap: 14 }}>
              <DemoButton variant="white" style={{ fontSize: 15.5 }} />
              <Link
                href="/contact"
                className="sanzio-btn-ghost-light"
                style={{
                  padding: "15px 24px",
                  border: "1px solid rgba(255,255,255,.5)",
                  color: "#fff",
                  borderRadius: 11,
                  fontSize: 15.5,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "background .16s",
                }}
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function PricingSectionOnly({ initialPlans = null }) {
  return <PricingSection headingTag="h1" initialPlans={initialPlans} />;
}
