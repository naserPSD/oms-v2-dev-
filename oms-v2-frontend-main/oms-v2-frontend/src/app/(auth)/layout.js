"use client"
import ClientRootProviders from "@/components/layout/ClientRootProviders";
import AuthNavbar from "@/shared/navbar/AuthNavbar";
import ProtectedRoute from "@/utils/ProtectedRoute";
import { usePathname } from "next/navigation";
import { useState, Suspense } from "react";

const AuthLayout = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const routerPath = usePathname();
  const isProtectedRoute = routerPath === "/choose-user-app";
  return (
    <ClientRootProviders>
      <div className=" bg-background-light dark:bg-theme-dark text-theme-dark dark:text-theme-light  relative min-h-screen">
        <AuthNavbar />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          {isProtectedRoute ? (
            <ProtectedRoute setLoading={setLoading}>
              <div className="">{children}</div>
            </ProtectedRoute>
          ) : (
            <div className="">{children}</div>
          )}
        </Suspense>
      </div>
    </ClientRootProviders>
  );
};

export default AuthLayout;
