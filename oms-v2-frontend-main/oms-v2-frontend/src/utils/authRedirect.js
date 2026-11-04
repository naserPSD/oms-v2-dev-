"use client";

// Shared auth/public route helpers for post-login redirects
const AUTH_PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/signup",
  "/forget-password",
  "/forgot-password",
  "/reset-password",
  "/reset-first-password",
  "/email-verification",
  "/login-success",
  "/unauthorized",
  "/choose-user-app",
];

/** Paths that should never be restored after login. */
export const isAuthOrPublicBouncePath = (pathname) => {
  if (!pathname || typeof pathname !== "string") return true;
  const path = pathname.split("?")[0] || "";
  if (path === "/" || path === "") return true;
  return AUTH_PUBLIC_PREFIXES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
};

/**
 * Returns a safe in-app path to restore after login, or null to use dashboard.
 */
export const getSafeLastVisitedUrl = () => {
  if (typeof window === "undefined") return null;
  const lastUrl = localStorage.getItem("lastVisitedUrl");
  if (!lastUrl || isAuthOrPublicBouncePath(lastUrl)) {
    if (lastUrl) localStorage.removeItem("lastVisitedUrl");
    return null;
  }
  return lastUrl;
};

/**
 * Admin portal users are identified only by users.app_use_case = Admin.
 * Company, Personal, and empty values use the general dashboard.
 */
export const isAdminPortalUser = (user) => user?.appUseCase === "Admin";

/**
 * Checks if a user belongs to the Admin portal.
 */
export const isPureAdminUser = (user) => isAdminPortalUser(user);

/**
 * Admin users go to the admin portal.
 * Everyone else goes to the general dashboard.
 */
export const getPostLoginRedirect = (user, _permissions = [], invitationCode = "") => {
  if (isAdminPortalUser(user)) {
    return "/admin";
  }
  if (invitationCode) {
    return `/hr-dashboard/my-invitation-requests?invitationCode=${invitationCode}`;
  }
  return "/main-dashboard";
};

export const AUTH_PUBLIC_PREFIXES_LIST = AUTH_PUBLIC_PREFIXES;
