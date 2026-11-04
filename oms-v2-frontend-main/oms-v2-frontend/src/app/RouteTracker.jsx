// /src/app/RouteTracker.jsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, Suspense } from "react";
import { isAuthOrPublicBouncePath } from "@/utils/authRedirect";

function RouteTrackerContent() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Never persist auth/public pages as "come back here after login"
    if (isAuthOrPublicBouncePath(pathname)) return;

    localStorage.setItem("lastVisitedUrl", pathname);
  }, [pathname]);

  return null;
}

export default function RouteTracker({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <RouteTrackerContent />
      </Suspense>
      {children}
    </>
  );
}
