"use client";

import { color } from "@/features/landing/tokens";

/** Shared primary CTA that links to Calendly demo. */
export function DemoButton({
  children = "Book a Demo",
  variant = "ink",
  style = {},
  className = "",
  href = "https://calendly.com/domplio-info/30min",
  target = "_blank",
  rel = "noopener noreferrer",
  onClick,
}) {
  const variants = {
    ink: { background: color.ink, color: "#fff" },
    cyan: {
      background: color.cyanButton,
      color: "#fff",
      boxShadow: "0 10px 24px -12px rgba(17,113,146,.45)",
    },
    white: { background: "#fff", color: "#313131" },
    brand: { background: color.brandDeep, color: "#fff" },
    connect: {
      background: `linear-gradient(90deg,${color.connectVioletFrom},${color.connectPinkTo})`,
      color: "#fff",
    },
    header: {
      padding: "11px 20px",
      borderRadius: 10,
      fontSize: 14.5,
      background: color.ink,
      color: "#fff",
    },
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={`sanzio-btn sanzio-btn--${variant} ${className}`.trim()}
      style={{
        padding: "15px 26px",
        borderRadius: 11,
        fontSize: 15,
        fontWeight: 700,
        border: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background .16s, transform .16s, box-shadow .16s, color .16s",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </a>
  );
}
