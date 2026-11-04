/** Brand color tokens — always use CSS vars so Tailwind never falls back to blue-* */
export const pc = {
  bg: "bg-[var(--color-primaryColor)]",
  bgHover: "hover:bg-[var(--color-primaryColor-700)]",
  bgSoft: "bg-[var(--color-primaryColor)]/10 dark:bg-[var(--color-primaryColor)]/20",
  bgSofter: "bg-[var(--color-primaryColor)]/15 dark:bg-[var(--color-primaryColor)]/25",
  text: "text-[var(--color-primaryColor)] dark:text-[var(--color-primaryColor-400)]",
  textHover: "hover:text-[var(--color-primaryColor)] dark:hover:text-[var(--color-primaryColor-400)]",
  border: "border-[var(--color-primaryColor)]",
  borderSoft: "border-[var(--color-primaryColor)]/40",
  ring: "ring-[var(--color-primaryColor)]/15",
  focusRing: "focus:ring-[var(--color-primaryColor)]/30",
};

export const meetingBtnSolid = [
  "inline-flex items-center justify-center rounded-md text-xs font-semibold whitespace-nowrap text-white",
  "bg-[var(--color-primaryColor)] hover:bg-[var(--color-primaryColor-700)]",
  "dark:bg-[var(--color-primaryColor-600)] dark:hover:bg-[var(--color-primaryColor-700)]",
].join(" ");

export const meetingBtnOutline = [
  "inline-flex items-center justify-center rounded-md text-xs font-semibold whitespace-nowrap",
  "border border-[var(--color-primaryColor)] text-[var(--color-primaryColor)]",
  "dark:border-[var(--color-primaryColor-400)] dark:text-[var(--color-primaryColor-400)]",
  "hover:bg-[var(--color-primaryColor)]/5 dark:hover:bg-[var(--color-primaryColor)]/10",
].join(" ");
