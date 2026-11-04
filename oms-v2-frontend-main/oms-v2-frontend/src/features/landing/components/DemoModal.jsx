"use client";

import Link from "next/link";
import { useState } from "react";
import { color } from "@/features/landing/tokens";
import { useDemo } from "./DemoContext";

const fieldStyle = {
  height: 46,
  padding: "0 14px",
  border: `1px solid ${color.border}`,
  borderRadius: 12,
  font: "600 15px var(--font-manrope), Manrope, sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function DemoModal() {
  const { demoOpen, closeDemo } = useDemo();
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("");
  const [notes, setNotes] = useState("");

  if (!demoOpen) return null;

  const handleClose = () => {
    setDone(false);
    setName("");
    setEmail("");
    setCompany("");
    setSize("");
    setNotes("");
    closeDemo();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(15,26,32,.45)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        overflow: "auto",
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 1040,
          background: "#fff",
          borderRadius: 26,
          overflow: "hidden",
          boxShadow: "0 50px 90px -40px rgba(15,26,32,.5)",
          display: "grid",
          gridTemplateColumns: "1.15fr .85fr",
        }}
        className="sanzio-demo-modal"
      >
        <div style={{ padding: "44px 44px 48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".12em",
                color: color.cyanInk,
              }}
            >
              BOOK A DEMO
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: `1px solid ${color.border}`,
                background: "#fff",
                color: color.muted,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {!done ? (
            <div>
              <h2
                style={{
                  margin: "22px 0 0",
                  fontSize: 32,
                  lineHeight: 1.1,
                  letterSpacing: "-.03em",
                  fontWeight: 800,
                  color: color.ink,
                }}
              >
                See Sanzio on your own workflow.
              </h2>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 15,
                  lineHeight: 1.55,
                  fontWeight: 500,
                  color: color.muted,
                }}
              >
                30 minutes, walked through by a product specialist. No
                preparation needed.
              </p>
              <form
                onSubmit={handleSubmit}
                style={{ marginTop: 26, display: "grid", gap: 14 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <label style={{ display: "grid", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: color.muted,
                      }}
                    >
                      Full name
                    </span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      style={fieldStyle}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: color.muted,
                      }}
                    >
                      Work email
                    </span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      style={fieldStyle}
                    />
                  </label>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <label style={{ display: "grid", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: color.muted,
                      }}
                    >
                      Company
                    </span>
                    <input
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company name"
                      style={fieldStyle}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: color.muted,
                      }}
                    >
                      Team size
                    </span>
                    <select
                      required
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      style={{ ...fieldStyle, background: "#fff" }}
                    >
                      <option value="">Select</option>
                      <option value="1-50">1–50</option>
                      <option value="51-200">51–200</option>
                      <option value="201-1000">201–1,000</option>
                      <option value="1000+">1,000+</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: "grid", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: color.muted,
                    }}
                  >
                    What would you like to see?
                  </span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Payroll runs, attendance, hiring pipeline…"
                    style={{
                      ...fieldStyle,
                      height: "auto",
                      padding: "12px 14px",
                      resize: "vertical",
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="sanzio-btn sanzio-btn--ink"
                  style={{
                    marginTop: 6,
                    height: 50,
                    border: 0,
                    borderRadius: 12,
                    background: color.ink,
                    color: "#fff",
                    font: "800 15.5px var(--font-manrope), Manrope, sans-serif",
                    cursor: "pointer",
                    transition: "background .16s, transform .16s",
                  }}
                >
                  Request my demo
                </button>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: color.mutedLight,
                  }}
                >
                  We reply within one business day. Already a customer?{" "}
                  <Link href="/sign-in" style={{ color: color.cyanInk }}>
                    Log in
                  </Link>
                </p>
              </form>
            </div>
          ) : (
            <div style={{ padding: "40px 0 10px" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: "#F0FAFF",
                  color: color.cyanInk,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                ✓
              </div>
              <h2
                style={{
                  margin: "24px 0 0",
                  fontSize: 30,
                  lineHeight: 1.12,
                  letterSpacing: "-.03em",
                  fontWeight: 800,
                  color: color.ink,
                }}
              >
                Thanks, {name || "there"} — request received.
              </h2>
              <p
                style={{
                  margin: "12px 0 0",
                  maxWidth: 420,
                  fontSize: 15.5,
                  lineHeight: 1.6,
                  fontWeight: 500,
                  color: color.muted,
                }}
              >
                A product specialist will email you three time slots within one
                business day. Anything urgent can go to hello@sanzio.com.
              </p>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  marginTop: 28,
                  height: 48,
                  padding: "0 26px",
                  border: `1px solid ${color.border}`,
                  borderRadius: 12,
                  background: "#fff",
                  font: "700 15px var(--font-manrope), Manrope, sans-serif",
                  cursor: "pointer",
                  color: color.ink,
                }}
              >
                Back to site
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "48px 44px",
            background: color.ink,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 22,
              lineHeight: 1.35,
              letterSpacing: "-.02em",
              fontWeight: 800,
            }}
          >
            What the 30 minutes covers.
          </p>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              "Your current HR, payroll and hiring setup",
              "A live walkthrough on your use cases",
              "Rollout plan, migration and pricing",
            ].map((text, i) => (
              <div key={text} style={{ display: "flex", gap: 12 }}>
                <span
                  style={{
                    flex: "none",
                    width: 26,
                    height: 26,
                    borderRadius: 9,
                    background: "rgba(255,255,255,.1)",
                    color: "#7FD3F2",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11.5,
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    fontWeight: 600,
                    color: "rgba(255,255,255,.72)",
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 6,
              paddingTop: 22,
              borderTop: "1px solid rgba(255,255,255,.12)",
              fontSize: 13.5,
              lineHeight: 1.55,
              fontWeight: 600,
              color: "rgba(255,255,255,.6)",
            }}
          >
            “We moved four tools into Sanzio in a month.” — Head of People, 340
            employees
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 800px) {
            .sanzio-demo-modal { grid-template-columns: 1fr !important; }
            .sanzio-demo-modal > div:last-child { display: none !important; }
          }
        `,
        }}
      />
    </div>
  );
}
