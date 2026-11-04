import { INFO, PAGES, PAGE_NAME } from "@/features/landing/data/siteContent";
import { ORGANIZATION_ID, SITE, WEBSITE_ID } from "./site";

const PRODUCT_PATH = {
  hr: "/sanzio-hr-management",
  pay: "/products/payroll",
  work: "/products/workspace",
  rec: "/products/recruitment",
};

function graphPageSchema({
  path,
  title,
  description,
  type = "WebPage",
  extras = {},
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({ path, title, description, type, extras }),
    ],
  };
}

function absoluteUrl(path = "/") {
  if (!path || path === "/") return SITE.url;
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function toIsoDate(dateStr) {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: SITE.logo,
    },
    image: SITE.icon,
    email: SITE.email,
    description: SITE.description,
    sameAs: SITE.sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE.email,
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
  };
}

function webPageSchema({
  path,
  title,
  description,
  type = "WebPage",
  extras = {},
}) {
  const url = absoluteUrl(path);
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
    ...extras,
  };
}

export function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/",
        title: "Sanzio — One platform for people, payroll, work and hiring",
        description: SITE.description,
        extras: {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: SITE.logo,
          },
        },
      }),
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE.url}/#software`,
        name: "Sanzio",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE.url,
        description: SITE.description,
        offers: {
          "@type": "Offer",
          url: absoluteUrl("/pricing"),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        publisher: { "@id": ORGANIZATION_ID },
      },
      whySchema(),
    ],
  };
}

/** Why Sanzio section lives at /#why (no dedicated route). */
export function whySchema() {
  const url = absoluteUrl("/#why");
  return {
    "@type": "WebPage",
    "@id": `${url}`,
    url,
    name: "Why teams choose Sanzio",
    description:
      "Less manual work, better visibility, and one connected experience for workforce operations.",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      name: "Why teams choose Sanzio",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Less manual work",
          description: "Bring everyday processes into a structured platform.",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Better visibility",
          description: "See the information needed to keep teams moving.",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "One connected experience",
          description:
            "Manage key workforce operations without jumping between disconnected systems.",
        },
      ],
    },
  };
}

export function aboutSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/about",
        title: "About — Sanzio",
        description:
          "We build one connected platform for the operational side of employing people.",
        type: "AboutPage",
      }),
    ],
  };
}

export function contactSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/contact",
        title: "Contact — Sanzio",
        description:
          "Product questions, partnerships or support — we reply within one business day.",
        type: "ContactPage",
        extras: {
          mainEntity: {
            "@type": "Organization",
            "@id": ORGANIZATION_ID,
            email: SITE.email,
            contactPoint: {
              "@type": "ContactPoint",
              email: SITE.email,
              contactType: "customer service",
              availableLanguage: ["English"],
            },
          },
        },
      }),
    ],
  };
}

export function blogIndexSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/blog",
        title: "Blog — Sanzio",
        description:
          "Product updates and practical advice on HR, payroll, workspace and recruitment.",
        type: "CollectionPage",
        extras: {
          mainEntity: {
            "@type": "Blog",
            "@id": `${absoluteUrl("/blog")}#blog`,
            name: "Sanzio Blog",
            description:
              "Product updates and practical advice on HR, payroll, workspace and recruitment.",
            url: absoluteUrl("/blog"),
            publisher: { "@id": ORGANIZATION_ID },
          },
        },
      }),
    ],
  };
}

export function blogArticleSchema({
  slug,
  title,
  description,
  date,
  authorName,
  category,
  image,
}) {
  const url = absoluteUrl(`/blog/${slug}`);
  const datePublished = toIsoDate(date);
  const articleImage = image || SITE.logo;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: title,
        description,
        url,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
        },
        image: articleImage,
        datePublished,
        dateModified: datePublished,
        author: {
          "@type": "Person",
          name: authorName || "Sanzio Team",
        },
        publisher: {
          "@type": "Organization",
          "@id": ORGANIZATION_ID,
          name: SITE.name,
          logo: {
            "@type": "ImageObject",
            url: SITE.logo,
          },
        },
        articleSection: category,
        inLanguage: "en",
        isPartOf: {
          "@type": "Blog",
          "@id": `${absoluteUrl("/blog")}#blog`,
          name: "Sanzio Blog",
        },
      },
    ],
  };
}

export function suiteSchema() {
  const url = absoluteUrl("/sanzio-hr-management");
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/sanzio-hr-management",
        title: "Sanzio HR Management — People operations in one place",
        description:
          "Employee records, attendance, leave and role-based access in one organised HR platform.",
      }),
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#software`,
        name: "Sanzio HR Management",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url,
        description:
          "Employee records, attendance, leave and role-based access in one organised HR platform.",
        featureList: [
          "Employee Management",
          "Attendance & Leave",
          "HR Records",
          "Role-based Access",
        ],
        offers: {
          "@type": "Offer",
          url: absoluteUrl("/pricing"),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#products`,
        name: "Sanzio Suite products",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "HR Management",
            url: absoluteUrl("/sanzio-hr-management"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Payroll Management",
            url: absoluteUrl("/products/payroll"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Workspace",
            url: absoluteUrl("/products/workspace"),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Recruitment",
            url: absoluteUrl("/products/recruitment"),
          },
        ],
      },
    ],
  };
}

export function connectSchema() {
  const url = absoluteUrl("/connect");
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/connect",
        title: "Sanzio Connect — Multi-channel communication",
        description:
          "Manage SMS, Email and WhatsApp marketing from one powerful platform.",
      }),
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#software`,
        name: "Sanzio Connect",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url,
        description:
          "Manage SMS, Email and WhatsApp marketing from one powerful platform.",
        featureList: [
          "SMS Marketing",
          "Email Marketing",
          "WhatsApp Business Messaging",
          "Contact & Audience Management",
          "Analytics Dashboard",
          "Wallet & Billing System",
        ],
        offers: {
          "@type": "Offer",
          url: absoluteUrl("/contact"),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

export function faqSchema() {
  const info = INFO.faq;
  const mainEntity = (info?.blocks || []).map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  }));

  return graphPageSchema({
    path: "/faq",
    title: "FAQ — Sanzio",
    description: info?.lead || "Common questions before moving onto Sanzio.",
    type: "FAQPage",
    extras: { mainEntity },
  });
}

export function helpSchema() {
  const info = INFO.help;
  const blocks = info?.blocks || [];
  return graphPageSchema({
    path: "/help",
    title: "Help — Sanzio",
    description: info?.lead || "Guides for setting up and running each Sanzio product.",
    extras: {
      mainEntity: {
        "@type": "ItemList",
        name: "Help centre topics",
        itemListElement: blocks.map(([name, description], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          description,
        })),
      },
    },
  });
}

export function privacySchema() {
  const info = INFO.privacy;
  return graphPageSchema({
    path: "/privacy",
    title: "Privacy — Sanzio",
    description: info?.lead || "How Sanzio handles the data you keep in the platform.",
    type: "PrivacyPolicy",
  });
}

export function termsSchema() {
  const info = INFO.terms;
  return graphPageSchema({
    path: "/terms",
    title: "Terms — Sanzio",
    description: info?.lead || "The agreement that covers use of the Sanzio platform.",
    type: "TermsOfService",
  });
}

export function pricingSchema() {
  const url = absoluteUrl("/pricing");
  const plans = [
    {
      name: "Essential",
      price: 990,
      currency: "BDT",
      description: "Start with the one Sanzio product your team needs most.",
    },
    {
      name: "Business",
      price: 1690,
      currency: "BDT",
      description:
        "Both products, one workspace, connected records across HR and outreach.",
    },
    {
      name: "Enterprise",
      description:
        "For larger teams that need dedicated onboarding and support.",
      contactUrl: absoluteUrl("/contact"),
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path: "/pricing",
        title: "Pricing — Sanzio",
        description: "Simple plans for growing teams on Sanzio.",
        extras: {
          mainEntity: {
            "@type": "ItemList",
            name: "Sanzio pricing plans",
            itemListElement: plans.map((plan, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Offer",
                name: plan.name,
                description: plan.description,
                url,
                priceCurrency: plan.currency || "BDT",
                ...(plan.price != null
                  ? {
                      price: plan.price,
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: plan.price,
                        priceCurrency: plan.currency || "BDT",
                        unitText: "user per month",
                      },
                    }
                  : {
                      url: plan.contactUrl || url,
                      availability: "https://schema.org/InStock",
                    }),
                seller: { "@id": ORGANIZATION_ID },
              },
            })),
          },
        },
      }),
    ],
  };
}

/** JSON-LD for a known marketing path. Rendered by each page so the root layout stays static. */
export function schemaForMarketingPath(pathname) {
  const path =
    !pathname || pathname === "/"
      ? "/"
      : pathname.replace(/\/$/, "") || "/";

  switch (path) {
    case "/":
      return homeSchema();
    case "/about":
      return aboutSchema();
    case "/contact":
      return contactSchema();
    case "/connect":
      return connectSchema();
    case "/faq":
      return faqSchema();
    case "/help":
      return helpSchema();
    case "/privacy":
      return privacySchema();
    case "/terms":
      return termsSchema();
    case "/pricing":
      return pricingSchema();
    case "/blog":
      return blogIndexSchema();
    case "/sanzio-hr-management":
      return suiteSchema();
    case "/products/hr":
      return productPageSchema("hr");
    case "/products/payroll":
      return productPageSchema("pay");
    case "/products/workspace":
      return productPageSchema("work");
    case "/products/recruitment":
      return productPageSchema("rec");
    default:
      return null;
  }
}

/** @param {"hr"|"pay"|"work"|"rec"} productKey */
export function productPageSchema(productKey) {
  const path = PRODUCT_PATH[productKey];
  const page = PAGES[productKey];
  const productName = PAGE_NAME[productKey] || "Sanzio";
  if (!path || !page) {
    return graphPageSchema({
      path: "/",
      title: SITE.name,
      description: SITE.description,
    });
  }

  const url = absoluteUrl(path);
  const featureList =
    page.features?.map((f) => f.t) || page.caps || [];

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      webPageSchema({
        path,
        title: `${productName} — Sanzio`,
        description: page.lead,
      }),
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#software`,
        name: `Sanzio ${productName}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url,
        description: page.lead,
        featureList,
        offers: {
          "@type": "Offer",
          url: absoluteUrl("/pricing"),
          priceCurrency: "BDT",
          availability: "https://schema.org/InStock",
        },
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}
