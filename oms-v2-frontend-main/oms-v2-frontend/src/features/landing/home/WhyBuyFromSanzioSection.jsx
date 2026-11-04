"use client";

import Link from "next/link";
import { DemoButton } from "@/features/landing/components/DemoButton";
import { color } from "@/features/landing/tokens";

const FEATURES = [
  {
    title: "Set up with you",
    text: "We configure your structure, import existing data and train the people who will use it daily.",
  },
  {
    title: "One vendor, one invoice",
    text: "HR and communication from the same team, so nobody gets passed between support desks.",
  },
  {
    title: "Support you can reach",
    text: "Named contacts and direct replies instead of a ticket queue and a template response.",
  },
  {
    title: "Priced for your size",
    text: "Take the products you need now and expand later — no enterprise bundle you won't use.",
  },
];

export default function WhyBuyFromSanzioSection() {
  return (
    <section className="sanzio-why-buy-section">
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          className="sanzio-why-buy-banner"
          style={{
            position: "relative",
            overflow: "hidden",
            background: color.ink,
            color: "#fff",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              pointerEvents: "none",
            }}
          />

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
            Why buy from Sanzio
          </p>

          <div className="sanzio-why-buy-split">
            <h2
              style={{
                margin: 0,
                letterSpacing: "-.03em",
                fontWeight: 800,
                textWrap: "balance",
              }}
            >
              Software is easy to buy. Getting it running is the hard part.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.65,
                fontWeight: 500,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              We stay involved after the purchase — configuring, migrating and
              training until your team is actually using it.
            </p>
          </div>

          <div className="sanzio-why-buy-features">
            {FEATURES.map((item) => (
              <div key={item.title}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    letterSpacing: "-.01em",
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
                    color: "rgba(255,255,255,0.58)",
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="sanzio-why-buy-actions">
            <DemoButton variant="cyan">Book a Demo</DemoButton>
            <Link
              href="/contact"
              className="sanzio-btn"
              style={{
                padding: "15px 26px",
                borderRadius: 11,
                fontSize: 15,
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.28)",
                background: "transparent",
                color: "#fff",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background .16s, border-color .16s",
              }}
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
