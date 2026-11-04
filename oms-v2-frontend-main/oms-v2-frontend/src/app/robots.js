import { SITE } from "@/features/landing/seo/site";

const PRIVATE_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forget-password",
  "/reset-password",
  "/reset-first-password",
  "/login-success",
  "/choose-user-app",
  "/email-verification",
  "/main-dashboard",
  "/hr-dashboard",
  "/payroll-management",
  "/crm",
  "/accounts",
  "/tasks",
  "/task-workspace",
  "/inventory",
  "/procurement",
  "/invoice",
  "/admin",
  "/settings",
  "/my-profile",
  "/profile",
  "/subscription",
  "/recruitment",
  "/token-management",
  "/password-change",
  "/help-and-faq",
  "/support-center",
  "/unauthorized",
  "/api/",
];

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PREFIXES,
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
