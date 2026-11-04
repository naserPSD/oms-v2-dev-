import { SITE } from "./site";

/** Indexable marketing pages. Redirects such as /suite and /products/hr are omitted. */
export const PUBLIC_ROUTES = [
  {
    path: "/",
    title: "Sanzio",
    metaTitle: "Sanzio — One platform for people, payroll, work and hiring",
    metaDescription:
      "Sanzio brings HR, Payroll, Workspace and Recruitment together on one shared foundation.",
    description:
      "Sanzio brings HR, Payroll, Workspace and Recruitment together on one shared foundation.",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/sanzio-hr-management",
    title: "Sanzio HR Management",
    metaTitle: "Sanzio HR Management — People operations in one place",
    metaDescription:
      "Employee records, attendance, leave and role-based access in one organised HR platform.",
    description:
      "Employee records, attendance, leave and role-based access in one organised HR platform.",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/products/payroll",
    title: "Payroll Management",
    metaTitle: "Payroll Management — Sanzio",
    metaDescription:
      "Structure salaries, run payroll and deliver clear payslips every month.",
    description:
      "Structure salaries, run payroll and deliver clear payslips every month.",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/products/workspace",
    title: "Workspace",
    metaTitle: "Workspace — Sanzio",
    metaDescription:
      "Tasks, ownership and progress in one workspace connected to your people data.",
    description:
      "Tasks, ownership and progress in one workspace connected to your people data.",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/products/recruitment",
    title: "Recruitment",
    metaTitle: "Recruitment — Sanzio",
    metaDescription:
      "Openings, candidates and interview stages in one pipeline that connects to HR.",
    description:
      "Openings, candidates and interview stages in one pipeline that connects to HR.",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/connect",
    title: "Sanzio Connect",
    metaTitle: "Sanzio Connect — Multi-channel communication",
    metaDescription:
      "Manage SMS, Email and WhatsApp marketing from one powerful platform.",
    description:
      "Manage SMS, Email and WhatsApp marketing from one powerful platform.",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/pricing",
    title: "Pricing",
    metaTitle: "Pricing — Sanzio",
    metaDescription: "Simple plans for growing teams on Sanzio.",
    description: "Simple plans for growing teams on Sanzio.",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/about",
    title: "About",
    metaTitle: "About — Sanzio",
    metaDescription:
      "We build one connected platform for the operational side of employing people.",
    description:
      "We build one connected platform for the operational side of employing people.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/contact",
    title: "Contact",
    metaTitle: "Contact — Sanzio",
    metaDescription:
      "Product questions, partnerships or support — we reply within one business day.",
    description:
      "Product questions, partnerships or support — we reply within one business day.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog",
    title: "Blog",
    metaTitle: "Blog — Sanzio",
    metaDescription:
      "Product updates and practical advice on HR, payroll, workspace and recruitment.",
    description:
      "Product updates and practical advice on HR, payroll, workspace and recruitment.",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    path: "/faq",
    title: "FAQ",
    metaTitle: "FAQ — Sanzio",
    metaDescription: "Common questions before moving onto Sanzio.",
    description: "Common questions before moving onto Sanzio.",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/help",
    title: "Help",
    metaTitle: "Help — Sanzio",
    metaDescription: "Guides for setting up and running each Sanzio product.",
    description: "Guides for setting up and running each Sanzio product.",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/privacy",
    title: "Privacy",
    metaTitle: "Privacy — Sanzio",
    metaDescription: "How Sanzio handles the data you keep in the platform.",
    description: "How Sanzio handles the data you keep in the platform.",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    title: "Terms",
    metaTitle: "Terms — Sanzio",
    metaDescription: "The agreement that covers use of the Sanzio platform.",
    description: "The agreement that covers use of the Sanzio platform.",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return SITE.url;
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
