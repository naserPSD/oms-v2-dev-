// src/app/(user-dashboard)/company-setting/page.js
import React, { Suspense } from "react";
import CompanySettingDashboard from "@/features/company-settings";
//import RestApi from "@/utils/RestApi";

export const metadata = {
  title: "Company Settings | Sanzio",
  description: "View and update your company information.",
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

  // const response = await RestApi.get(`/application/get-app-services`, {
  //   // cache: { next: { revalidate: 3 } }
  //   cache: 'no-store'
  // });

  // console.log("API response", response);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanySettingDashboard />
    </Suspense>
  );
}