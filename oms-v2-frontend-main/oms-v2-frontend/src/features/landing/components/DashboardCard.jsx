import { color } from "@/features/landing/tokens";

export default function DashboardCard({ title, tag, kpis, rows, chart }) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px solid ${color.border}`,
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 36px 70px -48px rgba(29,27,27,.3)",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${color.borderFaint}`,
        }}
      >
        <span style={{ fontSize: 14.5, fontWeight: 800 }}>{title}</span>
        <span
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            background: "#F4F6FC",
            fontSize: 11.5,
            fontWeight: 800,
            color: color.brandInk,
          }}
        >
          {tag}
        </span>
      </div>
      <div
        className="sanzio-dashboard-kpis"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${kpis.length},1fr)`,
          gap: 1,
          background: color.borderFaint,
        }}
      >
        {kpis.map((k) => (
          <div key={k.k} style={{ padding: "18px 20px", background: "#fff" }}>
            <span
              style={{
                display: "block",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-.02em",
              }}
            >
              {k.v}
            </span>
            <span
              style={{
                display: "block",
                marginTop: 4,
                fontSize: 11.5,
                fontWeight: 700,
                color: color.mutedLight,
              }}
            >
              {k.k}
            </span>
          </div>
        ))}
      </div>
      {chart}
      <div
        style={{
          padding: "16px 24px 22px",
          marginTop: 8,
          borderTop: `1px solid ${color.borderFaint}`,
        }}
      >
        {rows.map((r) => (
          <div
            key={r.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "13px 0",
              borderBottom: `1px solid ${color.borderFaint}`,
            }}
          >
            <span
              style={{
                flex: "none",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#F4F6FC",
                color: color.brandInk,
                display: "grid",
                placeItems: "center",
                fontSize: 11.5,
                fontWeight: 800,
              }}
            >
              {r.ini}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 800 }}>
                {r.name}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: color.mutedLight,
                }}
              >
                {r.role}
              </span>
            </span>
            <span
              style={{
                flex: "none",
                fontSize: 12.5,
                fontWeight: 700,
                color: color.muted,
              }}
            >
              {r.time}
            </span>
            <span
              style={{
                flex: "none",
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 800,
                background: r.bg,
                color: r.fg,
              }}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
