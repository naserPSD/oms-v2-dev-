"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function VerifiedGuard({ children }) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [accessToken, setAccessToken] = useState(undefined);

    useEffect(() => {
        setAccessToken(localStorage.getItem("accessToken"));
    }, []);

    useEffect(() => {
        // ✅ only run when BOTH are ready
        if (accessToken && user && user.emailVerifiedAt === null) {
            router.replace("/email-verification");
        }
    }, [user, accessToken]);

    // ⛔ Wait until user is loaded
    if (!user && accessToken) {
        return null;
    }

    if (user && !user.emailVerifiedAt) {
        return (
            <div className="flex items-center justify-center mt-[150px]">
                <p className="text-2xl">
                    Please verify your email address to continue.
                </p>
            </div>
        );
    }

    return children;
}