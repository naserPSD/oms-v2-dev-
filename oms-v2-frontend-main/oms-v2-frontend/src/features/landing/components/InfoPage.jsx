"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ImageSlot from "@/features/landing/components/ImageSlot";
import { DemoButton } from "@/features/landing/components/DemoButton";
import { color } from "@/features/landing/tokens";
import { INFO } from "@/features/landing/data/siteContent";
import RestApi from "@/utils/RestApi";

export default function InfoPage({ infoKey }) {
  const info = INFO[infoKey];
  if (!info) return null;

  const isAbout = infoKey === "about";
  const isContact = infoKey === "contact";

  return (
    <div className="sanzio-info-page">
      <section className="sanzio-m-section-hero" style={{ padding: "80px 40px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: ".12em",
              color: color.brandInk,
            }}
          >
            {info.kicker}
          </div>
          <h1
            style={{
              margin: "16px 0 0",
              fontSize: 48,
              lineHeight: 1.05,
              letterSpacing: "-.04em",
              fontWeight: 800,
            }}
          >
            {info.title}
          </h1>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: 18,
              lineHeight: 1.6,
              fontWeight: 500,
              color: color.muted,
              maxWidth: 560,
            }}
          >
            {info.lead}
          </p>
        </div>
      </section>

      {info.blocks?.length > 0 && (
        <section style={{ padding: "24px 40px 80px" }}>
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "grid",
              gap: 16,
            }}
          >
            {info.blocks.map(([t, d]) => (
              <div
                key={t}
                className="sanzio-faq-card"
                style={{
                  padding: 28,
                  borderRadius: 18,
                  border: `1px solid ${color.border}`,
                  background: color.bgSoft,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t}</h2>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 15,
                    lineHeight: 1.6,
                    fontWeight: 500,
                    color: color.muted,
                  }}
                >
                  {isContact ? (
                    <>
                      {d.includes("@") ? (
                        <>
                          <a
                            href={`mailto:${d.split(" — ")[0] || d.split(" ")[0]}`}
                            style={{ color: color.brandInk, fontWeight: 700 }}
                          >
                            {(d.match(/[\w.-]+@[\w.-]+/) || [])[0]}
                          </a>
                          {d.includes("—") ? ` — ${d.split("—")[1]}` : ""}
                        </>
                      ) : (
                        d
                      )}
                    </>
                  ) : (
                    d
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAbout && (
        <>
          <section style={{ padding: "40px 40px 80px", background: color.bgTint }}>
            <div style={{ maxWidth: 1320, margin: "0 auto" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                }}
              >
                What Sanzio powers, day to day.
              </h2>
              <div
                className="sanzio-m-grid-4"
                style={{
                  marginTop: 32,
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 16,
                }}
              >
                {["HR ops", "Payroll", "Workspace", "Hiring"].map((label) => (
                  <ImageSlot key={label} label={label} height={180} radius={16} />
                ))}
              </div>
            </div>
          </section>

          <section className="sanzio-m-section" style={{ padding: "80px 40px" }}>
            <div
              className="sanzio-m-split"
              style={{
                maxWidth: 1320,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 40,
                alignItems: "center",
              }}
            >
              <div
                className="sanzio-m-grid-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 14,
                }}
              >
                {info.stats.map((s) => (
                  <div
                    key={s.k}
                    style={{
                      padding: 22,
                      borderRadius: 16,
                      background: color.bgSoft,
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{s.v}</div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        color: color.mutedLight,
                      }}
                    >
                      {s.k}
                    </div>
                  </div>
                ))}
              </div>
              <ImageSlot label="Team photo" height={280} radius={20} />
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
                What we care about.
              </h2>
              <div
                className="sanzio-m-grid-2"
                style={{
                  marginTop: 36,
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 18,
                }}
              >
                {info.values.map(([t, d]) => (
                  <div
                    key={t}
                    style={{
                      padding: 28,
                      borderRadius: 18,
                      background: "#fff",
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t}</h3>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 14.5,
                        lineHeight: 1.55,
                        fontWeight: 500,
                        color: color.muted,
                      }}
                    >
                      {d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {isContact && (
        <section style={{ padding: "0 40px 80px" }}>
          <ContactForm />
        </section>
      )}

      <section
        style={{
          padding: "72px 40px",
          background: color.bgTint,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-.02em",
          }}
        >
          Still have a question?
        </h2>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 15,
            fontWeight: 500,
            color: color.muted,
          }}
        >
          Talk to our team or book a product walkthrough.
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <DemoButton style={{ padding: "13px 22px", fontSize: 14.5 }} />
          <Link
            href="/contact"
            style={{
              padding: "13px 22px",
              border: `1px solid ${color.border}`,
              borderRadius: 11,
              fontSize: 14.5,
              fontWeight: 700,
              color: color.ink,
              textDecoration: "none",
              background: "#fff",
            }}
          >
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const generateCaptcha = useCallback(() => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setUserCaptchaAnswer("");
    setCaptchaError("");
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expectedAnswer = String(captchaNum1 + captchaNum2);
    if (userCaptchaAnswer.trim() !== expectedAnswer) {
      setCaptchaError("Security check failed: Incorrect CAPTCHA answer. Please try again.");
      generateCaptcha();
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setCaptchaError("");

    try {
      let resData;
      try {
        const { data } = await RestApi.post("/api/v1/contact/send-message", {
          ...formData,
          captchaToken: userCaptchaAnswer,
        });
        resData = data;
      } catch (restErr) {
        // Fallback to Next.js API route handler if RestApi axios call fails
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            captchaToken: userCaptchaAnswer,
          }),
        });
        resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || resData.message || "Failed to send message.");
        }
      }

      setStatus("success");
      setFormData({ name: "", email: "", mobile: "", company: "", message: "" });
      generateCaptcha();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Something went wrong. Please try again."
      );
      generateCaptcha();
    }
  };

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 32,
        borderRadius: 20,
        border: `1px solid ${color.border}`,
        background: "#fff",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Send a message</h2>

      {status === "success" && (
        <div
          style={{
            marginTop: 20,
            padding: "16px 20px",
            borderRadius: 12,
            background: "#ECFDF5",
            border: "1px solid #10B981",
            color: "#065F46",
            fontSize: 14.5,
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          ✓ Thanks! Your message has been sent to info@domplio.com. We will reply within one business day.
        </div>
      )}

      {status === "error" && (
        <div
          style={{
            marginTop: 20,
            padding: "14px 18px",
            borderRadius: 12,
            background: "#FEF2F2",
            border: "1px solid #EF4444",
            color: "#991B1B",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ✕ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 20, display: "grid", gap: 14 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: color.muted }}>
            Name *
          </span>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            style={{
              height: 46,
              padding: "0 14px",
              borderRadius: 12,
              border: `1px solid ${color.border}`,
              font: "600 15px inherit",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: color.muted }}>
            Work email *
          </span>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            style={{
              height: 46,
              padding: "0 14px",
              borderRadius: 12,
              border: `1px solid ${color.border}`,
              font: "600 15px inherit",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: color.muted }}>
            Mobile *
          </span>
          <input
            required
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Enter mobile number"
            style={{
              height: 46,
              padding: "0 14px",
              borderRadius: 12,
              border: `1px solid ${color.border}`,
              font: "600 15px inherit",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: color.muted }}>
            Company
          </span>
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company name"
            style={{
              height: 46,
              padding: "0 14px",
              borderRadius: 12,
              border: `1px solid ${color.border}`,
              font: "600 15px inherit",
              outline: "none",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: color.muted }}>
            Message *
          </span>
          <textarea
            required
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="How can we help you?"
            style={{
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${color.border}`,
              font: "600 15px inherit",
              outline: "none",
            }}
          />
        </label>

        {/* CAPTCHA Security Verification Widget */}
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            border: `1px dashed ${color.border}`,
            background: "#F8FAFC",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: color.ink }}>
              Security Verification (CAPTCHA) *
            </span>
            <button
              type="button"
              onClick={generateCaptcha}
              title="Refresh Security Code"
              style={{
                background: "transparent",
                border: 0,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                color: color.brandInk,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              🔄 Refresh
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                background: color.ink,
                color: "#fff",
                font: "800 16px monospace",
                letterSpacing: 2,
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {captchaNum1} + {captchaNum2} = ?
            </div>

            <input
              required
              type="text"
              value={userCaptchaAnswer}
              onChange={(e) => {
                setUserCaptchaAnswer(e.target.value);
                setCaptchaError("");
              }}
              placeholder="Enter answer"
              style={{
                height: 44,
                width: "100%",
                padding: "0 14px",
                borderRadius: 10,
                border: captchaError ? "1px solid #EF4444" : `1px solid ${color.border}`,
                font: "600 15px inherit",
                background: "#fff",
                outline: "none",
              }}
            />
          </div>

          {captchaError && (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#DC2626" }}>
              {captchaError}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            height: 48,
            border: 0,
            borderRadius: 12,
            background: color.ink,
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: status === "loading" ? 0.7 : 1,
            transition: "opacity .16s",
          }}
        >
          {status === "loading" ? "Sending..." : "Send message"}
        </button>
      </form>
    </div>
  );
}
