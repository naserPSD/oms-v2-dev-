"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/shared/dashBoardSidebar/Sidebar";
import DashboardNavbar from "@/shared/navbar/DashboardNavbar";
import ProtectedRoute from "@/utils/ProtectedRoute";
import Loading from "@/components/common/Loading";
import ClientRootProviders from "@/components/layout/ClientRootProviders";

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This code only runs on the client side
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileSidebarOpen(false);
        setIsCollapsed(false); // Expanded by default on desktop
      } else {
        setIsCollapsed(true); // Collapsed by default on mobile
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [hasToken, setHasToken] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(Boolean(localStorage.getItem("accessToken")));
    }
  }, []);

  return (
    <ClientRootProviders>
    <ProtectedRoute setLoading={setLoading}>
      {!hasToken ? (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 p-4">
          <main className="w-full max-w-2xl">{children}</main>
        </div>
      ) : (
        <div className="min-h-screen flex bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
          {/* Sidebar */}
          {loading ? <Loading /> : null}

          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobileSidebarOpen={isMobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
          />

          {/* Overlay for mobile */}
          {isMobileSidebarOpen && (
            <div
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
          )}

          {/* Main Content */}
          <div
            className={`w-full min-h-screen bg-background-light dark:bg-background-dark transition-all duration-300`}
            style={{
              paddingLeft: isDesktop ? (isCollapsed ? "60px" : "305px") : "60px", // Mobile collapsed
            }}
          >
            <header className="bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4">
              <DashboardNavbar />
            </header>
            <main className="container mx-auto bg-background-light dark:bg-background-dark px-4">{children}</main>
          </div>
        </div>
      )}
    </ProtectedRoute>
    </ClientRootProviders>
  );
};

export default DashboardLayout;
