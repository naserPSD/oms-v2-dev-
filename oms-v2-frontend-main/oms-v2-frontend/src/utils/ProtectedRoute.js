// path: src/utils/ProtectedRoute.js

"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthUserInfo, getCommonDropdownList } from "./commonApiFunction";
import { toaster } from "./helpers";
import { useCommonStore } from "@/store/useCommonStore";
import { useMenuStore } from "@/store/useMenuStore";
import { isAuthOrPublicBouncePath } from "@/utils/authRedirect";

const ProtectedRouteContent = ({ children, setLoading, loading }) => {
  const router = useRouter();
  const pathname = usePathname();
  const callLoginApi = useAuthStore((state) => state.callLoginApi);
  const isDropdownLoaded = useCommonStore((state) => state.isDropdownLoaded);
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const [accessToken, setAccessToken] = useState(undefined); // undefined means "not checked yet"
  const [checking, setChecking] = useState(true);

  const leftSidebarMenu = useMenuStore((state) => state.leftSidebarMenu);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("accessToken"));
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken && user && !user.emailVerifiedAt) {
      // toaster('Please verify your email before proceeding', 'error');
      router.push("/email-verification");
    }
  }, [accessToken, router, user]);

  useEffect(() => {
    if (
      !callLoginApi &&
      accessToken &&
      localStorage.getItem("isLoggedOut") !== "true"
    ) {
      getAuthUserInfo(setLoading, null, router);
    }
  }, [callLoginApi, accessToken, setLoading, router]);

  useEffect(() => {
    if (!isDropdownLoaded && accessToken) {
      getCommonDropdownList(setLoading)
    }
  }, [accessToken, isDropdownLoaded, setLoading]);

  useEffect(() => {
    if (!checking && !accessToken) {
      if (typeof window !== "undefined") {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        if (pathname?.startsWith("/email-verification") && params.get("sessionId") && params.get("otp")) {
          return;
        }
      }
      if (pathname && !isAuthOrPublicBouncePath(pathname)) {
        localStorage.setItem("lastVisitedUrl", pathname);
      }
      router.replace("/sign-in");
    }
  }, [accessToken, router, checking, pathname]);

  useEffect(() => {
    // ⛔ WAIT until auth is verified and menu is loaded
    if (accessToken && !callLoginApi) {
      return;
    }

    if (!leftSidebarMenu || leftSidebarMenu.length === 0) {
      return;
    }

    const effectivePermissions = permissions || [];
    const hasTaskPermission =
      effectivePermissions.includes("task_workspaces") ||
      effectivePermissions.some(
        (p) => typeof p === "string" && (p.startsWith("task_workspaces.") || p.startsWith("tasks."))
      );

    const collectPaths = (items = []) => {
      items.forEach((item) => {
        if (item.permission && !effectivePermissions.includes(item.permission)) return;
        if (item.path) allPaths.push(item.path);
        // Special case: Task Workspaces module manages dynamic user workspaces & task boards
        if (
          item.code === "task_workspaces" ||
          item.code === "tasks" ||
          item.path === "/tasks" ||
          item.path === "/task-workspace"
        ) {
          allPaths.push("/task-workspace");
          allPaths.push("/tasks");
        }
        if (item.pages) collectPaths(item.pages);
        if (item.children) collectPaths(item.children);
      });
    };

    let allPaths = [];
    collectPaths(leftSidebarMenu);

    if (hasTaskPermission) {
      allPaths.push("/task-workspace");
      allPaths.push("/tasks");
    }

    const allowedPaths = [
      "/email-verification",
      "/main-dashboard",
      "/my-profile",
      "/admin/my-profile",
      "/password-change",
      "/help-and-faq",
      "/support-center",
      "/subscription/checkout",
      "/subscription/success",
      "/subscription/fail",
      "/subscription/failed",
      "/subscription/cancel",
      "/subscription/active-subscription-plans",
      "/subscription/payment-history",
      "/subscription/payments/payment-history",
      "/admin",
      "/settings/blog-settings",
    ];

    const isAdminUser = user?.appUseCase === "Admin";

    const openedFromMenu = allPaths.some((path) => {
      if (!path || !pathname) return false;
      const base = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
      if (!base || base === "/") return false;
      if (pathname === base || pathname.startsWith(`${base}/`)) return true;
      const rewritten = base.startsWith("/admin/") ? base.slice("/admin".length) : "";
      return rewritten && (pathname === rewritten || pathname.startsWith(`${rewritten}/`));
    });

    if (isAdminUser && (pathname === "/my-profile" || pathname.startsWith("/my-profile/"))) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`/admin/my-profile${search}`);
      return;
    }

    if (isAdminUser) {
      if (
        !openedFromMenu &&
        (pathname === "/" ||
          pathname === "/main-dashboard" ||
          pathname.startsWith("/hr-dashboard") ||
          pathname.startsWith("/payroll-management") ||
          pathname.startsWith("/crm") ||
          pathname.startsWith("/accounts") ||
          pathname.startsWith("/tasks") ||
          pathname.startsWith("/task-workspace") ||
          pathname.startsWith("/inventory") ||
          pathname.startsWith("/procurement") ||
          pathname.startsWith("/invoice"))
      ) {
        router.replace("/admin");
        return;
      }
    } else if (!openedFromMenu && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
      router.replace("/main-dashboard");
      return;
    }

    const isAllowed =
      allowedPaths.some((path) => {
        if (!path || !pathname) return false;
        const base = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
        return pathname === base || pathname.startsWith(`${base}/`);
      }) || openedFromMenu;

    // ✅ NOW safe to check
    if (!isAllowed) {
      router.replace("/unauthorized");
    }
  }, [leftSidebarMenu, pathname, permissions, router, user, accessToken, callLoginApi]);

  if (checking) return null;

  return children;
};

export default function ProtectedRoute(props) {
  return (
    <Suspense fallback={null}>
      <ProtectedRouteContent {...props} />
    </Suspense>
  );
}
