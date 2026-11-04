import Link from "next/link";
import { color } from "@/features/landing/tokens";

const DEMO_HREF = "https://calendly.com/domplio-info/30min";

const stats = [
  ["4", "Products, one login"],
  ["600+", "Companies on Sanzio"],
  ["1", "Shared source of truth"],
];

/** Server-rendered LCP hero — paints before client JS hydrates. */
export default function SuiteHero() {
  return (
    <section
      className="sanzio-suite-hero"
      style={{
        padding: "88px 40px",
        background: color.ink,
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: ".12em",
            color: color.brandPale,
          }}
        >
          SANZIO SUITE
        </div>
        <h1
          className="sanzio-suite-hero-title"
          style={{
            margin: "18px 0 0",
            fontSize: 52,
            lineHeight: 1.05,
            letterSpacing: "-.04em",
            fontWeight: 800,
          }}
        >
          One login. Four connected products.
        </h1>
        <p
          className="sanzio-suite-hero-lead"
          style={{
            margin: "20px auto 0",
            maxWidth: 560,
            fontSize: 17,
            lineHeight: 1.6,
            fontWeight: 500,
            color: "rgba(255,255,255,.85)",
          }}
        >
          Sanzio brings HR, Payroll, Workspace and Recruitment together on one
          shared foundation.
        </p>
        <div
          className="sanzio-suite-hero-actions"
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href={DEMO_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="sanzio-btn sanzio-btn--brand"
            style={{
              padding: "15px 26px",
              borderRadius: 11,
              fontSize: 15,
              fontWeight: 700,
              border: 0,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: color.brandDeep,
              color: "#fff",
            }}
          >
            Book a Demo
          </a>
          <Link
            href="/contact"
            className="sanzio-btn-ghost-light"
            style={{
              padding: "15px 26px",
              border: "1px solid rgba(255,255,255,.3)",
              borderRadius: 11,
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Contact us
          </Link>
        </div>
        <div
          className="sanzio-suite-hero-stats"
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {stats.map(([v, k]) => (
            <div
              key={k}
              style={{
                padding: 24,
                borderRadius: 16,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800 }}>{v}</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.72)",
                }}
              >
                {k}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
