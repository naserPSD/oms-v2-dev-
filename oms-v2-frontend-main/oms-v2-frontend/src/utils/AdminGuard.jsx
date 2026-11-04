"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminGuard({ children }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const [accessToken, setAccessToken] = useState(undefined);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const isAuthorized = useMemo(() => {
    return user?.appUseCase === "Admin";
  }, [user]);

  useEffect(() => {
    if (mounted && user && !isAuthorized) {
      // Redirect unauthorized users after a short delay
      const timer = setTimeout(() => {
        router.replace("/main-dashboard");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [mounted, user, isAuthorized, router]);

  if (!mounted || (!user && accessToken)) {
    return (
      <div className="py-10 space-y-6">
        <Skeleton className="h-14 w-80 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (user && !isAuthorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
          You do not have administrative privileges to view the Admin Dashboard.
          Redirecting to main dashboard...
        </p>
        <Link
          href="/main-dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Main Dashboard
        </Link>
      </div>
    );
  }

  return children;
}

export default AdminGuard;
