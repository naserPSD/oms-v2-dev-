// /utils/commonApiFunction.js
"use client";
import RestApi from "@/utils/RestApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommonStore } from "@/store/useCommonStore";
import { useRouter } from "next/navigation";
import { toaster } from "@/utils/helpers";
import helpers from "@/utils/helpers";
import { useMenuStore } from "@/store/useMenuStore";
import { isAuthOrPublicBouncePath } from "@/utils/authRedirect";

export const getAuthUserInfo = async (setLoading, setError = null, router = null) => {
    setLoading && setLoading(true);
    const { setAuth, clearAuth, setPermissions } = useAuthStore.getState();
    const { setLeftSidebarMenu } = useMenuStore.getState();
    try {
        const { data } = await RestApi.get("/api/v1/auth/auth-user-info");
        console.log('auth-user-info response: ', data.data)
        // const { accessToken, tokenType, user, permissions } = data.data;
        const { accessToken, refreshToken, tokenType, sessionId, user, permissions, leftSidebarMenu } = data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("sessionId", sessionId);
        let resolvedAppId = user?.activeAppId || user?.activeApp?.id;
        if (!resolvedAppId && accessToken && typeof accessToken === "string" && accessToken.includes(".")) {
            try {
                const payload = JSON.parse(atob(accessToken.split(".")[1]));
                resolvedAppId = payload?.activeAppId || payload?.appId;
            } catch (e) {}
        }
        if (resolvedAppId) {
            localStorage.setItem("activeAppId", String(resolvedAppId));
        }
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }

        setAuth({ accessToken, tokenType, user, callLoginApi: true });
        setPermissions(permissions);
        setLeftSidebarMenu(leftSidebarMenu);
        return { accessToken, tokenType, user };
    } catch (error) {
        const status = error?.response?.status;
        const serverMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message;

        if (setError) {
            helpers.handleApiValidationError(error, setError);
        }

        // Only treat auth failures as logout — 500 (e.g. DB pool exhausted) keeps the session
        if (status === 401 || status === 403) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("sessionId");
            localStorage.removeItem("activeAppId");
            clearAuth();
            if (router) {
                router.push("/sign-in");
            } else if (typeof window !== "undefined") {
                window.location.href = "/sign-in";
            }
        } else if (typeof window !== "undefined") {
            toaster(
                serverMessage ||
                    "Could not refresh your session. Please try again in a moment.",
                "error"
            );
        }

        throw error;
    } finally {
        setLoading && setLoading(false);
    }
};

export const getCommonDropdownList = async (setLoading, setError = null, router = null) => {
    setLoading && setLoading(true);
    const { setDropdowns, setIsDropdownLoaded } = useCommonStore.getState();
    try {
        const { data } = await RestApi.get("/api/v1/helper/get-common-dropdown-list", {
            cache: { next: { revalidate: 10 } },
        });
        const dropdown = data.data;

        // console.log('dropdown', dropdown)
        setDropdowns(dropdown);
        return { dropdown };
    } catch (error) {
        if (setError) {
            helpers.handleApiValidationError(error, setError);
        }
    } finally {
        setLoading && setLoading(false);
    }
};

export const safeClearLocalStorage = () => {
    if (typeof window === "undefined") return;
    const preserved = {};
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
                key &&
                (key.startsWith("crm_") ||
                 key.startsWith("crm-") ||
                 key.includes("crm_tasks") ||
                 key.includes("tasks_store"))
            ) {
                preserved[key] = localStorage.getItem(key);
            }
        }
    } catch (e) {}

    try {
        localStorage.clear();
    } catch (e) {}

    try {
        Object.entries(preserved).forEach(([k, v]) => {
            if (v !== null) localStorage.setItem(k, v);
        });
    } catch (e) {}
};

export const handleLogout = async (router) => {
    const lastVisitedUrl = localStorage.getItem("lastVisitedUrl");

    // Preserve CRM tasks and company data across logout and user switching
    safeClearLocalStorage();

    // Only keep a safe in-app URL across logout (never auth pages)
    if (lastVisitedUrl && !isAuthOrPublicBouncePath(lastVisitedUrl)) {
        localStorage.setItem("lastVisitedUrl", lastVisitedUrl);
    }

    localStorage.setItem("isLoggedOut", "true");

    const { clearAuth } = useAuthStore.getState();
    await clearAuth();

    toaster("You are logged out successfully");

    router.push("/sign-in");
};