"use client";

import { useEffect } from "react";

const FA_HREF =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css";
const FA_INTEGRITY =
  "sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==";

/** Loads Font Awesome only on dashboard routes (not public marketing pages). */
export default function DashboardFontAwesomeLoader() {
  useEffect(() => {
    if (document.getElementById("dashboard-font-awesome")) return;

    const link = document.createElement("link");
    link.id = "dashboard-font-awesome";
    link.rel = "stylesheet";
    link.href = FA_HREF;
    link.integrity = FA_INTEGRITY;
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    document.head.appendChild(link);
  }, []);

  return null;
}
