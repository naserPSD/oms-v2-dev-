import { Manrope } from "next/font/google";
import WebsiteShell from "@/features/landing/components/WebsiteShell";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export default function WebsiteLayout({ children }) {
  return (
    <WebsiteShell className={manrope.variable}>{children}</WebsiteShell>
  );
}
