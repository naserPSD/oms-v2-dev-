"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { color } from "@/features/landing/tokens";

const socialLinks = [
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.5 4.78 5.8V21H18.5v-5.7c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.8H10.5V9z" />
      </svg>
    ),
  },
  {
    href: "https://x.com",
    label: "X",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.9 2H22l-7.2 8.2L22.9 22H16.6l-5-6.6-5.7 6.6H2.7l7.7-8.8L2.2 2h6.4l4.6 6.1L18.9 2zm-2.2 18.2h1.7L7.5 3.7H5.7l11 16.5z" />
      </svg>
    ),
  },
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.4 1.4-1.4h1.5V5.2c-.3 0-1.2-.1-2.2-.1-2.3 0-3.8 1.4-3.8 3.9V11H8v2.8h2.4V21h3.1z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const columns = [
  {
    title: "PRODUCTS",
    links: [
      ["HR Management", "/sanzio-hr-management"],
      ["Payroll", "/products/payroll"],
      ["Workspace", "/products/workspace"],
      ["Recruitment", "/products/recruitment"],
    ],
  },
  {
    title: "COMPANY",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "RESOURCES",
    links: [
      ["Help", "/help"],
      ["FAQ", "/faq"],
    ],
  },
  {
    title: "LEGAL",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

function CopyrightYear() {
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer
      className="sanzio-footer"
      style={{
        padding: "80px 40px 44px",
        background: "#fff",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .sanzio-social-link {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            border: 1px solid ${color.border};
            display: grid;
            place-items: center;
            color: ${color.muted};
            text-decoration: none;
            transition: background .16s, color .16s;
          }
          .sanzio-social-link:hover {
            background: ${color.ink};
            color: #fff;
          }
        `,
        }}
      />
      <div className="sanzio-footer-inner">
        <div className="sanzio-footer-brand">
          <Image
            src="/images/sanzio-logo.webp"
            alt="Sanzio"
            height={24}
            width={100}
            style={{ height: 24, width: "auto" }}
          />
          <p
            className="sanzio-footer-tagline"
            style={{
              margin: "16px 0 0",
              fontSize: 13.5,
              lineHeight: 1.55,
              fontWeight: 500,
              color: color.muted,
            }}
          >
            One platform for your people, payroll, work and hiring.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="sanzio-social-link"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="sanzio-footer-cols">
        {columns.map((col) => (
          <div key={col.title} className="sanzio-footer-col">
            <div
              className="sanzio-footer-col-title"
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: ".1em",
                color: color.labelOnWhite,
              }}
            >
              {col.title}
            </div>
            <div style={{ marginTop: 16, display: "grid", gap: 11 }}>
              {col.links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="sanzio-footer-link"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: color.ink,
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
      <div
        className="sanzio-footer-legal"
        style={{
          maxWidth: 1320,
          paddingTop: 24,
          borderTop: `1px solid ${color.border}`,
          fontSize: 12.5,
          fontWeight: 600,
          color: color.muted,
        }}
      >
        <span className="sanzio-footer-legal-item" suppressHydrationWarning>
          ©{" "}
          <Suspense fallback="2026">
            <CopyrightYear />
          </Suspense>{" "}
          Sanzio
        </span>
        <span className="sanzio-footer-legal-item">All rights reserved</span>
      </div>
    </footer>
  );
}
