"use client";

import { color } from "@/features/landing/tokens";

/** Layout-matched placeholder for design image slots without real assets. */
export default function ImageSlot({
  label = "Image",
  height = 220,
  radius = 16,
  style = {},
}) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{
        height,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${color.bgTint} 0%, ${color.brandTint} 100%)`,
        border: `1px dashed ${color.border}`,
        display: "grid",
        placeItems: "center",
        color: color.mutedLight,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: ".04em",
        ...style,
      }}
    >
      {label}
    </div>
  );
}
