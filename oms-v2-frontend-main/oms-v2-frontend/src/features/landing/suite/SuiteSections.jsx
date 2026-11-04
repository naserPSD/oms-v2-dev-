"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { DemoButton } from "@/features/landing/components/DemoButton";
import { color } from "@/features/landing/tokens";

const SuiteProductsSection = dynamic(
  () => import("@/features/landing/suite/SuiteProductsSection"),
  { loading: () => null }
);

const why = [
  {
    t: "One employee record",
    d: "Hire once — the same person flows into HR, payroll and workspace without re-entry.",
  },
  {
    t: "One admin console",
    d: "Roles, permissions and company settings managed once across every product.",
  },
  {
    t: "One price, no add-ons",
    d: "Pick the products you need. Nothing locked behind extra modules or surprise fees.",
  },
];

const connectFlow = [
  {
    n: "1",
    title: "Recruitment",
    d: "A candidate is hired through the pipeline.",
  },
  {
    n: "2",
    title: "HR Management",
    d: "Hiring creates the employee record automatically.",
  },
  {
    n: "3",
    title: "Payroll Management",
    d: "That record drives salary structure and payslips.",
  },
  {
    n: "4",
    title: "Workspace",
    d: "The same person is assigned tasks and ownership.",
  },
];

export default function SuiteSections() {
  return (
    <>
      <section
        className="sanzio-suite-section"
        style={{ padding: "96px 40px" }}
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
            WHY ONE SUITE
          </div>
          <h2
            style={{
              margin: "16px 0 0",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            Four features, no data gaps.
          </h2>
          <div
            className="sanzio-suite-why-grid"
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 22,
            }}
          >
            {why.map((w) => (
              <div
                key={w.t}
                className="sanzio-card-hover"
                style={{
                  padding: 28,
                  borderRadius: 20,
                  border: `1px solid ${color.border}`,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{w.t}</h3>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14.5,
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
        </div>
      </section>

      <SuiteProductsSection />

      <section
        className="sanzio-suite-section"
        style={{ padding: "48px 40px 64px", background: "#fff" }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <p
            className="sanzio-kicker-on-light"
            style={{
              margin: 0,
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: color.labelOnWhite,
            }}
          >
            One employee record
          </p>
          <h2
            style={{
              margin: "14px 0 0",
              fontSize: 40,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            How the Four features connect.
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
            A single person moves through all Four features without ever being
            re-entered.
          </p>
          <div
            className="sanzio-suite-connect-grid"
            style={{
              marginTop: 44,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 32,
            }}
          >
            {connectFlow.map((f) => (
              <div key={f.n}>
                <span
                  aria-hidden
                  style={{
                    display: "inline-flex",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: color.ink,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {f.n}
                </span>
                <h3
                  style={{
                    margin: "16px 0 0",
                    fontSize: 17,
                    fontWeight: 800,
                    letterSpacing: "-.01em",
                  }}
                >
                  {f.title}
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
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="sanzio-suite-section"
        style={{ padding: "0 40px 64px", background: "#fff" }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div
            className="sanzio-suite-cta-banner sanzio-m-flex-stack"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 32,
              flexWrap: "wrap",
              padding: "44px 48px",
              borderRadius: 24,
              background: color.brandDeep,
              color: "#fff",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 36,
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: "-.03em",
                textWrap: "balance",
              }}
            >
              See the whole suite in action.
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <DemoButton variant="white" />
              <Link
                href="/contact"
                className="sanzio-btn-ghost-light"
                style={{
                  padding: "15px 26px",
                  border: "1px solid rgba(255,255,255,.55)",
                  borderRadius: 11,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                }}
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
