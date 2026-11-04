// Design tokens from design_handoff_sanzio/nextjs/lib/tokens.ts

export const color = {
  ink: "#1D1B1B",
  muted: "#5C6167",
  /** Secondary copy on #fff — AA for 12px+ (avoid #8A9097 / #A0A6AC on white) */
  mutedLight: "#6B7280",
  /** Small / secondary text on white — WCAG AA (~4.5:1 on #fff) */
  faint: "#6B7280",
  /** 11–12px bold caps on #fff */
  labelOnWhite: "#2C4A82",
  border: "#E6EAED",
  borderFaint: "#F0F1F3",
  bgTint: "#F7F8FA",
  bgSoft: "#FAFBFC",

  brandDeep: "#3B5FA4",
  brandInk: "#2C4A82",
  brandMid: "#7C9FDB",
  brandPale: "#AFC4EA",
  brandTint: "#EEF2FB",

  connectPurple: "#A21CAF",
  connectVioletFrom: "#6D28D9",
  connectPinkTo: "#DB2777",
  connectTint: "#F7F0FF",

  /** Brand accent fills, borders, large UI */
  cyan: "#44BAEB",
  /** Text on #F5FBFE / #fff / light tints — WCAG AA */
  cyanInk: "#156078",
  /** Primary cyan buttons — white label contrast */
  cyanButton: "#117192",

  successBg: "#E3F7E9",
  successFg: "#0F6B32",
  warnBg: "#FDF0DA",
  warnFg: "#B4740E",
  neutralBg: "#EDEEF0",
  neutralFg: "#5C6167",
  infoBg: "#E7F1FD",
  infoFg: "#2B5FA6",
  dangerBg: "#FDE8E8",
  dangerFg: "#B42318",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 26, pill: 999 };

export const maxWidth = { page: 1320, narrow: 1180 };

const LOW_CONTRAST_CYAN_HEX = new Set([
  "#2a93c0",
  "#44baeb",
  "#7fd3f2",
  "#9fddf6",
]);

/** Map legacy light cyans from CMS to WCAG-safe accent text on light backgrounds */
export function readableAccent(hex, fallback = color.cyanInk) {
  if (!hex || typeof hex !== "string") return fallback;
  const normalized = hex.trim().toLowerCase();
  if (LOW_CONTRAST_CYAN_HEX.has(normalized)) return fallback;
  return hex;
}
