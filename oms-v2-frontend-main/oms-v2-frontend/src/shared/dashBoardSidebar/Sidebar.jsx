"use client";

import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
import { handleLogout } from "@/utils/commonApiFunction";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { BiCollapse } from "react-icons/bi";
import { FaAngleLeft, FaCopyright } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { MdAdminPanelSettings } from "react-icons/md";
import { dropDownItems, DynamicDropdownSection } from "./DropdownSection";
import { useAuthStore } from "@/store/useAuthStore";
import { useMenuStore } from "@/store/useMenuStore";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import helpers from "@/utils/helpers";

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileSidebarOpen,
  setMobileSidebarOpen,
  handleAddWorkSpace,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const leftSidebarMenu = useMenuStore((state) => state.leftSidebarMenu);
  const router = useRouter();
  const pathname = usePathname();

  // Admin portal is users.app_use_case = Admin. Company uses the ERP sidebar.
  const isAdminUser = authUser?.appUseCase === "Admin";
  const showAdminSidebar = isAdminUser;

  const { useGetCompanyInfoQuery } = useCompanySettingsQueryApi({});
  const { data: companyInfoRes } = useGetCompanyInfoQuery();
  const companyInfo = companyInfoRes?.data?.data || companyInfoRes?.data;

  const companyLogoUrl = helpers.resolveImageUrl(
    companyInfo?.logoMedia?.fileUrl ||
    authUser?.activeApp?.logoMedia?.fileUrl
  );
  const [sidebarLogoError, setSidebarLogoError] = useState(false);

  useEffect(() => {
    setSidebarLogoError(false);
  }, [companyLogoUrl]);

  // ─── Responsive collapse behaviour ────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        setMobileSidebarOpen(false);
        setIsCollapsed(false);
      } else {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed, setMobileSidebarOpen]);

  const showExpandedContent = !isCollapsed || isMobileSidebarOpen;

  // ─── Workspace list (Company panel only) ──────────────────────────────────
  const { useWorkspaceListSidebarQuery } = useTasksQueryApi({});
  const { data: responseData } = useWorkspaceListSidebarQuery();

  const dataArray = useMemo(() => responseData?.data || [], [responseData?.data]);

  const uniqueWorkspaces = useMemo(() => {
    const seen = new Set();
    return dataArray.filter((workspace) => {
      if (seen.has(workspace.name)) return false;
      seen.add(workspace.name);
      return true;
    });
  }, [dataArray]);

  // ─── Dynamic Admin menu — 100% from backend (accessPanel === 'Admin') ──────
  const adminMenuItems = useMemo(() => {
    return (leftSidebarMenu || []).filter((item) => {
      if (item.accessPanel !== "Admin") return false;
      // Exclude duplicate standalone Subscription Plan List module if present in cached session
      if (
        item.code === "admin_subscription_plans" ||
        (item.name === "Subscription Plan List" && (!item.pages || item.pages.length === 0))
      ) {
        return false;
      }
      return true;
    });
  }, [leftSidebarMenu]);

  // ─── Dynamic menu for Company panel ───────────────────────────────────────
  const dynamicMenuItems = useMemo(() => {
    return (leftSidebarMenu || []).filter(
      (item) =>
        item.accessPanel !== 'Admin' &&
        (!item.permission || (permissions || []).includes(item.permission))
    ).map((item) => ({
      ...item,
      pages: (item.pages || []).filter((page) => page.accessPanel !== 'Admin'),
    }));
  }, [leftSidebarMenu, permissions]);

  // ─── Toggle helper ────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (window.innerWidth >= 768) {
      setIsCollapsed((prev) => !prev);
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  return (
    <aside
      className={`dark:bg-theme-dark bg-theme-light dark:text-theme-light text-theme-dark shadow-md fixed top-0 left-0 h-screen transition-all duration-300 z-50 print:hidden
        ${isCollapsed ? "w-[60px]" : "w-[305px]"}
        ${isMobileSidebarOpen ? "translate-x-0 w-[250px]" : "md:translate-x-0"}`}
    >
      {/* Collapse/Expand Button (collapsed state only) */}
      {!showExpandedContent && (
        <div
          className="absolute -right-4 top-14 bg-gray-700 p-2 rounded-full cursor-pointer block z-50"
          onClick={handleToggle}
        >
          <FaAngleLeft
            className={`text-white text-lg transition-transform duration-300 ${
              isMobileSidebarOpen ? "rotate-0" : "rotate-180"
            }`}
          />
        </div>
      )}

      {/* Logo / Header */}
      <div className="flex items-center justify-between px-4 py-4">
        {showAdminSidebar ? (
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <MdAdminPanelSettings className="text-2xl" />
            </div>
            {showExpandedContent && (
              <Link href="/admin">
                <h3 className="font-bold text-sm md:text-base tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Admin Portal</span>
                 
                </h3>
                <h5 className="text-xs text-gray-500 dark:text-gray-400">Platform Management</h5>
              </Link>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-50 dark:bg-cyan-950/60 border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-xs shrink-0">
              {companyLogoUrl && !sidebarLogoError ? (
                <img
                  src={companyLogoUrl}
                  alt={authUser?.activeApp?.name || "Logo"}
                  className="w-full h-full object-contain p-0.5"
                  onError={() => setSidebarLogoError(true)}
                />
              ) : (
                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                  {helpers.avatarText(authUser?.activeApp?.name || authUser?.fullName)}
                </span>
              )}
            </div>
            {showExpandedContent && (
              <Link href="/">
                <h3 className="font-bold text-sm md:text-base">
                  <span className="text-secondaryColor">Sanzio</span>
                </h3>
                <h5 className="text-xs title-color">{authUser?.activeApp?.name}</h5>
              </Link>
            )}
          </div>
        )}
        <BiCollapse className="title-color text-2xl cursor-pointer" onClick={handleToggle} />
      </div>

      <div className="border-t-[2px] dark:border-gray-800 border-gray-300" />

      {/* Scrollable content */}
      <div className="overflow-y-auto px-3 flex-1 h-[calc(100vh-190px)] sidebar-scroll mt-4">
        {/* ══════════════════════════════════════════════════════════════════════
            CASE A: ADMIN SIDEBAR — 100% dynamic, driven by backend permissions.
            Set accessPanel="Admin" on any permission to show it here.
            ══════════════════════════════════════════════════════════════════════ */}
        {showAdminSidebar ? (
          <>
            {/* Collapsed Admin — icon-only tooltips */}
            {!showExpandedContent && (
              <div className="space-y-2">
                {adminMenuItems.length > 0 ? (
                  adminMenuItems.map((item) => {
                    const isActive =
                      pathname === item.path ||
                      (item.path &&
                        item.path !== "/admin" &&
                        pathname?.startsWith(item.path));
                    return (
                      <SimpleTooltip text={item.name} key={item.id}>
                        <Link
                          href={item.path || "/admin"}
                          className={`flex items-center justify-center w-full p-2.5 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                              : "text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                          }`}
                        >
                          <MdAdminPanelSettings className="text-xl" />
                        </Link>
                      </SimpleTooltip>
                    );
                  })
                ) : (
                  // Fallback — no admin items from backend yet
                  <SimpleTooltip text="Dashboard">
                    <Link
                      href="/admin"
                      className={`flex items-center justify-center w-full p-2.5 rounded-xl transition-all duration-200 ${
                        pathname === "/admin"
                          ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                          : "text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                      }`}
                    >
                      <MdAdminPanelSettings className="text-xl" />
                    </Link>
                  </SimpleTooltip>
                )}
              </div>
            )}

            {/* Expanded Admin — uses same DynamicDropdownSection as subscriber sidebar */}
            {showExpandedContent && (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600/90 dark:text-blue-400/90">
                  Platform Administration
                </div>

                {/* Dynamic items from backend — all admin items rendered the same way as subscriber */}
                {adminMenuItems.length > 0 ? (
                  adminMenuItems.map((menuItem) => (
                    <DynamicDropdownSection
                      key={menuItem.id}
                      menuItem={menuItem}
                      uniqueWorkspaces={[]}
                      handleAddWorkSpace={handleAddWorkSpace}
                    />
                  ))
                ) : (
                  // Fallback if no admin items loaded from backend yet
                  <Link
                    href="/admin"
                    className={`flex items-center gap-3 w-full p-2 px-3 rounded-md transition-all duration-200 ${
                      pathname === "/admin"
                        ? "dark:bg-gray-800 bg-gray-200 text-secondaryColor font-semibold"
                        : "dark:text-gray-300 text-gray-800 hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200"
                    }`}
                  >
                    <MdAdminPanelSettings className="text-xl" />
                    <span className="whitespace-nowrap">Dashboard</span>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          /* ══════════════════════════════════════════════════════════════════════
              CASE B: SUBSCRIBER ERP SIDEBAR — exactly as before, no changes
              ══════════════════════════════════════════════════════════════════════ */
          <>
            {/* Collapsed: icon-only links */}
            {!showExpandedContent &&
              dropDownItems.map((item, index) => (
                <React.Fragment key={index}>
                  {!item.isDropdown && (
                    <SimpleTooltip text={item.name}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-3 w-full p-2 px-3 mt-1 rounded-md transition-all duration-200 justify-center dark:text-gray-300 text-gray-800 hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200`}
                      >
                        <div className="text-[1.3rem]">{item.icon}</div>
                      </Link>
                    </SimpleTooltip>
                  )}
                  {item.isDropdown && (
                    <SimpleTooltip text={item.name}>
                      <Link
                        href={item.path}
                        className="flex items-center gap-3 w-full p-2 mt-1 rounded-md transition-all duration-200 hover:bg-gray-800 text-gray-300 justify-center"
                      >
                        <div className="text-[1.3rem]">{item.icon}</div>
                      </Link>
                    </SimpleTooltip>
                  )}
                </React.Fragment>
              ))}

            {/* Expanded: dynamic menu */}
            {showExpandedContent && (
              <>
                {dynamicMenuItems.map((menuItem) => (
                  <DynamicDropdownSection
                    key={menuItem.id}
                    menuItem={menuItem}
                    uniqueWorkspaces={uniqueWorkspaces}
                    handleAddWorkSpace={handleAddWorkSpace}
                  />
                ))}
              </>
            )}

            {/* Help & Support links (Company panel only) */}
            {showExpandedContent && (
              <div className="py-2 mt-2 border-t dark:border-[#1F2937] border-gray-300">
                <Link
                  href="/help-and-faq"
                  className="flex items-center gap-3 w-full p-2 px-3 mt-1 rounded-md transition-all duration-200 hover:bg-gray-800 dark:text-gray-300 text-gray-800 hover:dark:bg-gray-700 hover:text-gray-200"
                >
                  <p className="text-[1rem]">Help & FAQ</p>
                </Link>
                <Link
                  href="/support-center"
                  className="flex items-center gap-3 w-full p-2 px-3 mt-1 rounded-md transition-all duration-200 hover:bg-gray-800 dark:text-gray-300 text-gray-800 hover:dark:bg-gray-700 hover:text-gray-200"
                >
                  <p className="text-[1rem]">Support Center</p>
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── Logout ────────────────────────────────────────────────────── */}
        <div className="py-2 pb-4 border-t dark:border-[#1F2937] border-gray-300 mt-4">
          <div
            className={`flex items-center gap-3 w-full p-2 mt-1 rounded-md hover:bg-gray-800 dark:text-gray-300 text-gray-800 hover:dark:bg-gray-700 hover:text-gray-200 cursor-pointer ${
              !showExpandedContent ? "justify-center" : "px-3"
            }`}
            onClick={() => handleLogout(router)}
          >
            {!showExpandedContent && <TbLogout2 className="text-[1.3rem]" />}
            {showExpandedContent && (
              <div className="flex items-center justify-between w-full">
                <p className="text-[1rem]">Log Out</p>
                <TbLogout2 className="text-[1.3rem]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`py-4 px-2 my-2 border-t dark:border-[#1F2937] border-gray-300 ${
          showExpandedContent ? "mx-4" : "mx-2"
        }`}
      >
        {showExpandedContent ? (
          <>
            <div className="flex items-center">
              <Image
                src="/images/sanzio-logo.webp"
                alt="Sanzio"
                width={120}
                height={28}
                className="h-7 w-auto dark:hidden"
              />
              <Image
                src="/images/sanzio-logo-white.webp"
                alt="Sanzio"
                width={120}
                height={28}
                className="h-7 w-auto hidden dark:block"
              />
            </div>
            <p className="text-xs mt-2 flex items-center gap-1 text-gray-500">
              <FaCopyright /> Revinr IT Ltd. 2025
            </p>
          </>
        ) : (
          <div className="flex justify-center items-center">
            <Image
              src="/images/sanzio-icon.webp"
              alt="Sanzio"
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
