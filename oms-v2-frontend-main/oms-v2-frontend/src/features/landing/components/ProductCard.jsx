import Link from "next/link";
import { color } from "@/features/landing/tokens";

export default function ProductCard({
  href,
  iconBg,
  icon,
  kicker,
  title,
  description,
  checklist,
  dark,
  accent,
  children,
}) {
  return (
    <Link
      href={href}
      className="sanzio-card-hover sanzio-product-card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 28,
        border: `1px solid ${color.border}`,
        borderRadius: 20,
        background: dark ? color.ink : "#fff",
        color: dark ? "#fff" : color.ink,
        transition: "box-shadow .22s, transform .22s",
        textDecoration: "none",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: iconBg,
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </span>
      {kicker ? (
        <div
          style={{
            marginTop: 16,
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: ".12em",
            color: accent,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <h3
        style={{
          margin: kicker ? "10px 0 0" : "16px 0 0",
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "-.02em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 14,
          lineHeight: 1.5,
          fontWeight: 500,
          color: dark ? "rgba(255,255,255,.66)" : color.muted,
        }}
      >
        {description}
      </p>
      {checklist ? (
        <div
          className="sanzio-product-card-checklist"
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 14px",
          }}
        >
          {checklist.map((c) => (
            <span
              key={c}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: dark ? "rgba(255,255,255,.66)" : color.muted,
              }}
            >
              ✓ {c}
            </span>
          ))}
        </div>
      ) : null}
      {children}
      <span
        style={{
          marginTop: "auto",
          paddingTop: 20,
          fontSize: 14,
          fontWeight: 700,
          color: accent || (dark ? "#fff" : color.brandInk),
        }}
      >
        Explore →
      </span>
    </Link>
  );
}
