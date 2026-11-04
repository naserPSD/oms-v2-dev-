"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAuthOrPublicBouncePath } from "@/utils/authRedirect";
import { DemoProvider } from "./DemoContext";
import DemoModal from "./DemoModal";
import Header from "./Header";

/** Header + demo modal only — keeps page content outside the client boundary. */
export default function MarketingDemoChrome() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || isAuthOrPublicBouncePath(pathname)) return;
    localStorage.setItem("lastVisitedUrl", pathname);
  }, [pathname]);

  return (
    <DemoProvider>
      <Header />
      <DemoModal />
    </DemoProvider>
  );
}
