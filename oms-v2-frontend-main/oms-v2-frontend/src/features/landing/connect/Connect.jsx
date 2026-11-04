"use client";

import Image from "next/image";
import Link from "next/link";
import ImageSlot from "@/features/landing/components/ImageSlot";
import { DemoButton } from "@/features/landing/components/DemoButton";
import { color } from "@/features/landing/tokens";

const features = [
  {
    t: "SMS Marketing",
    d: "Send promotional and transactional SMS at scale with delivery tracking.",
  },
  {
    t: "Email Marketing",
    d: "Design campaigns, manage lists and measure opens and clicks.",
  },
  {
    t: "WhatsApp Business Messaging",
    d: "Reach customers on WhatsApp with templates and conversation tools.",
  },
  {
    t: "Contact & Audience Management",
    d: "Segment audiences and keep contact data organised across channels.",
  },
  {
    t: "Analytics Dashboard",
    d: "See campaign performance, spend and engagement in one view.",
  },
  {
    t: "Wallet & Billing System",
    d: "Prepay credits, track usage and manage billing per company.",
  },
];

const architecture = [
  "Super Admin",
  "Companies",
  "Users",
  "SMS / Email / WhatsApp",
];

const benefits = [
  {
    t: "One Platform",
    d: "Manage every customer channel without switching tools.",
  },
  {
    t: "Better Customer Engagement",
    d: "Reach people where they already respond — SMS, email and WhatsApp.",
  },
  {
    t: "Complete Visibility",
    d: "Track delivery, spend and performance across every campaign.",
  },
  {
    t: "Scalable Infrastructure",
    d: "Built for agencies and organisations that communicate at volume.",
  },
];

export default function Connect() {
  return (
    <div className="sanzio-connect-page">
      <section
        className="sanzio-m-section-hero"
        style={{ padding: "80px 40px", background: color.connectTint }}
      >
        <div
          className="sanzio-connect-hero"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Image
                src="/images/sanzio-connect-fab-icon.webp"
                alt=""
                width={44}
                height={44}
                style={{ borderRadius: 12 }}
              />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  color: color.connectPurple,
                }}
              >
                SANZIO CONNECT
              </span>
            </div>
            <h1
              style={{
                margin: "22px 0 0",
                fontSize: 48,
                lineHeight: 1.05,
                letterSpacing: "-.04em",
                fontWeight: 800,
              }}
            >
              Connect with customers across every channel.
            </h1>
            <p
              style={{
                margin: "18px 0 0",
                maxWidth: 480,
                fontSize: 17,
                lineHeight: 1.6,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              Sanzio Connect helps businesses manage SMS, Email and WhatsApp
              communication from one powerful platform.
            </p>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <DemoButton variant="connect" />
              <Link
                href="#connect-features"
                className="sanzio-btn-outline"
                style={{
                  padding: "15px 22px",
                  border: `1px solid ${color.border}`,
                  borderRadius: 11,
                  fontSize: 15,
                  fontWeight: 700,
                  color: color.ink,
                  textDecoration: "none",
                  background: "#fff",
                }}
              >
                Explore Features
              </Link>
            </div>
          </div>
          <ImageSlot label="Connect campaign mockup" height={360} radius={20} />
        </div>
      </section>

      <section id="connect-features" className="sanzio-m-section" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            Everything needed for smarter communication.
          </h2>
          <div
            className="sanzio-m-grid-3"
            style={{
              marginTop: 44,
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
            }}
          >
            {features.map((f) => (
              <div
                key={f.t}
                className="sanzio-connect-card"
                style={{
                  padding: 26,
                  borderRadius: 18,
                  border: `1px solid ${color.border}`,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{f.t}</h3>
                <p
                  style={{
                    margin: "10px 0 0",
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

      <section style={{ padding: "80px 40px", background: color.bgTint }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            Built for scalable business communication.
          </h2>
          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            {architecture.map((a, i) => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    padding: "14px 20px",
                    borderRadius: 14,
                    background: "#fff",
                    border: `1px solid ${color.border}`,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {a}
                </span>
                {i < architecture.length - 1 && (
                  <span style={{ color: color.faint, fontWeight: 800 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <ImageSlot label="Connect dashboard" height={360} radius={20} />
        </div>
      </section>

      <section className="sanzio-m-section" style={{ padding: "96px 40px", background: color.bgSoft }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <h2
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-.03em",
            }}
          >
            Built for businesses that communicate at scale.
          </h2>
          <div
            className="sanzio-m-grid-2"
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 18,
            }}
          >
            {benefits.map((b) => (
              <div
                key={b.t}
                style={{
                  padding: 28,
                  borderRadius: 18,
                  background: "#fff",
                  border: `1px solid ${color.border}`,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{b.t}</h3>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    fontWeight: 500,
                    color: color.muted,
                  }}
                >
                  {b.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sanzio-m-section" style={{ padding: "96px 40px" }}>
        <div
          className="sanzio-m-split"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-.03em",
              }}
            >
              Your own communication platform.
            </h2>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 16,
                lineHeight: 1.6,
                fontWeight: 500,
                color: color.muted,
              }}
            >
              Sanzio Connect can be customised and branded for businesses,
              agencies, telecom providers and organisations.
            </p>
          </div>
          <ImageSlot label="White-label preview" height={280} radius={20} />
        </div>
      </section>

      <section
        style={{
          padding: "88px 40px",
          background: `linear-gradient(90deg,${color.connectVioletFrom},${color.connectPinkTo})`,
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
            Ready to simplify business communication?
          </h2>
          <div style={{ marginTop: 28 }}>
            <DemoButton variant="white" />
          </div>
        </div>
      </section>
    </div>
  );
}
