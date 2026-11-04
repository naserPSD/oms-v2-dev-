// src/app/(user-dashboard)/company-setting/page.js
import CompanyDocuments from "@/features/Documents/Company-Documents/CompanyDocuments";
import React, { Suspense } from "react";

export const metadata = {
  title: "Company Documents | Sanzio",
  description: "View and update your company documents.",
  // keywords: ["about", "company", "team"],
  // openGraph: {
  //   title: "About Us - My Website",
  //   description: "Learn more about our company and team.",
  //   url: "https://example.com/about",
  //   siteName: "My Website",
  //   images: [
  //     {
  //       url: "https://example.com/images/about.png",
  //       width: 800,
  //       height: 600,
  //     },
  //   ],
  //   locale: "en_US",
  //   type: "website",
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "About Us - My Website",
  //   description: "Learn more about our company and team.",
  //   images: ["https://example.com/images/about.png"],
  // },
};

export default async function CompanySettingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyDocuments />
    </Suspense>
  );
}
