// path: src/app/(user-dashboard)/layout.js
"use client";
import { useState, useEffect, Suspense } from "react";
import Sidebar from "@/shared/dashBoardSidebar/Sidebar";
import DashboardNavbar from "@/shared/navbar/DashboardNavbar";
import ProtectedRoute from "@/utils/ProtectedRoute";
import Loading from "@/components/common/Loading";
import InitialSetup from "@/features/main-dashboard/InitialSetup";
import TransitionWrapper from "@/lib/animations/transition-wrapper";
import AddWorkSpace from "@/shared/dashBoardSidebar/AddWorkSpace";
import { useAuthStore } from "@/store/useAuthStore";
import { VerifiedGuard } from "@/utils/VerifiedGuard";
import { useNetworkStore } from "@/utils/offline/networkStore";
import DashboardFontAwesomeLoader from "@/components/common/DashboardFontAwesomeLoader";
import ClientRootProviders from "@/components/layout/ClientRootProviders";

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTaskStatus, setshowTaskStatus] = useState(false);
  //const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

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

  const handleAddWorkSpace = () => {
    // setSelectedTaskDetails(item);
    setshowTaskStatus(true);
  };

  const handleClose = () => {
    setshowTaskStatus(false);
    // setSelectedTaskDetails(null);
  };

  const user = useAuthStore((state) => state.user);
  const [accessToken, setAccessToken] = useState(undefined); // undefined means "not checked yet"

  const { checkStatus } = useNetworkStore();

  return (
    <ClientRootProviders>
    <ProtectedRoute setLoading={setLoading} loading={loading}>
      <DashboardFontAwesomeLoader />
      {user && user.emailVerifiedAt && (
        <InitialSetup />
      )}

      <div className="min-h-screen flex">
        {/* Sidebar */}
        {loading ? <Loading /> : null}

        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          handleAddWorkSpace={handleAddWorkSpace}
        />

        <AddWorkSpace
          showModal={showTaskStatus}
          onClose={handleClose}
        //selectedTaskDetails={selectedTaskDetails}
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
          className={`w-full bg-background-light dark:bg-background-dark transition-all duration-300 print:!p-0 print:!m-0 print:!bg-white`}
          style={{
            paddingLeft: isDesktop ? (isCollapsed ? "60px" : "305px") : "60px", // Mobile collapsed
          }}
        >
          <header className=" px-4 sticky top-0 z-50 print:hidden ">
            <DashboardNavbar />
          </header>
          <main className=" mx-auto bg-background-light dark:bg-background-dark px-6 print:!p-0 print:!m-0 print:!bg-white">
            {/* {children} */}
            <TransitionWrapper>
            {/* {children} */}
              <Suspense fallback={<Loading />}>
                <VerifiedGuard>{children}</VerifiedGuard>
              </Suspense>
            </TransitionWrapper>
          </main>
        </div>
      </div>
    </ProtectedRoute>
    </ClientRootProviders>
  );
};

export default DashboardLayout;
