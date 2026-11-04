import { Suspense } from "react";
import { preload } from "react-dom";
import HomePageContent from "@/features/landing/home/HomePageContent";
import MarketingJsonLd from "@/features/landing/seo/MarketingJsonLd";
import { buildPageMetadata } from "@/features/landing/seo/pageMetadata";

export async function generateMetadata() {
  return buildPageMetadata("/", {
    icons: {
      icon: "/images/sanzio-icon.webp",
      shortcut: "/images/sanzio-icon.webp",
      apple: "/images/sanzio-icon.webp",
    },
    openGraph: {
      title: "Sanzio — One platform for people, payroll, work and hiring",
      description:
        "Sanzio brings HR, Payroll, Workspace and Recruitment together on one shared foundation.",
      url: "https://sanzio.app",
      siteName: "Sanzio",
      images: [
        {
          url: "https://sanzio.app/images/sanzio-icon.webp",
          width: 512,
          height: 512,
          alt: "Sanzio Logo Icon",
        },
        {
          url: "https://sanzio.app/images/sanzio-logo.webp",
          width: 1200,
          height: 630,
          alt: "Sanzio Platform",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Sanzio — One platform for people, payroll, work and hiring",
      description:
        "Sanzio brings HR, Payroll, Workspace and Recruitment together on one shared foundation.",
      images: ["https://sanzio.app/images/sanzio-icon.webp"],
    },
  });
}

export default async function Page() {
  preload("/images/home-hero-background.webp", {
    as: "image",
    fetchPriority: "high",
  });
  preload("/images/home-hero-dashboard.webp", {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <>
      <MarketingJsonLd path="/" />
      <Suspense fallback={null}>
        <HomePageContent />
      </Suspense>
    </>
  );
}
