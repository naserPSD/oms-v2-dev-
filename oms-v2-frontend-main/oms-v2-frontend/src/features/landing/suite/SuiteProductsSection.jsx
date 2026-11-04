"use client";

import Image from "next/image";
import ProductCard from "@/features/landing/components/ProductCard";
import { HR_ICON_PNG, hrIconImageProps } from "@/features/landing/hrIcon";
import { color } from "@/features/landing/tokens";
import { PAGES } from "@/features/landing/data/siteContent";

const products = [
  {
    key: "hr",
    href: "/sanzio-hr-management",
    icon: HR_ICON_PNG,
    iconBg: color.brandTint,
    accent: color.brandInk,
  },
  {
    key: "pay",
    href: "/products/payroll",
    icon: null,
    iconBg: color.brandTint,
    accent: color.brandInk,
    glyph: "P",
  },
  {
    key: "work",
    href: "/products/workspace",
    icon: null,
    iconBg: color.bgTint,
    accent: color.brandInk,
    glyph: "W",
  },
  {
    key: "rec",
    href: "/products/recruitment",
    icon: null,
    iconBg: color.warnBg,
    accent: color.brandInk,
    glyph: "R",
  },
];

export default function SuiteProductsSection() {
  return (
    <section
      className="sanzio-suite-section"
      style={{ padding: "96px 40px", background: color.bgTint }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: ".12em",
            color: color.brandInk,
          }}
        >
          THE Four features
        </div>
        <h2
          style={{
            margin: "16px 0 0",
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-.03em",
          }}
        >
          Pick where you start. They all connect.
        </h2>
        <div
          className="sanzio-suite-products-grid"
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 20,
          }}
        >
          {products.map((p) => {
            const page = PAGES[p.key];
            return (
              <ProductCard
                key={p.key}
                href={p.href}
                iconBg={p.iconBg}
                icon={
                  p.icon ? (
                    <Image src={p.icon} alt="" {...hrIconImageProps} />
                  ) : (
                    <span style={{ fontWeight: 800, color: color.brandInk }}>
                      {p.glyph}
                    </span>
                  )
                }
                kicker={page.kicker}
                title={
                  p.key === "hr"
                    ? "HR Management"
                    : p.key === "pay"
                      ? "Payroll Management"
                      : p.key === "work"
                        ? "Workspace"
                        : "Recruitment"
                }
                description={page.lead}
                checklist={page.caps.slice(0, 4)}
                accent={p.accent}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
