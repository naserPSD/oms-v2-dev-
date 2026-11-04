"use client";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdDashboard, MdOutlinePayments, MdTask, MdAdminPanelSettings, MdOutlineBusiness } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import { HiMiniCalculator, HiUsers } from "react-icons/hi2";
import Link from "next/link";
import { RiPieChart2Fill, RiCoupon2Line } from "react-icons/ri";
import { generateSlug } from "@/utils/generateSlug";
import { usePathname, useRouter } from "next/navigation";
import { FcMoneyTransfer } from "react-icons/fc";
import { GiToken } from "react-icons/gi";
import { IoSettingsOutline } from "react-icons/io5";
import { useAuthStore } from "@/store/useAuthStore";
import { WorkspaceDropdownSection } from "./WorkSpaceDropdownSection";

// Icon map — extend as needed to match your menu `code` values
const ICON_MAP = {
  dashboard: <MdDashboard />,
  admin: <MdAdminPanelSettings />,
  admin_dashboard: <MdAdminPanelSettings />,
  hr: <HiUsers />,
  payroll_management: <FcMoneyTransfer />,
  task_workspaces: <MdTask />,
  crm: <RiPieChart2Fill />,
  subscription: <MdOutlinePayments />,
  subscription_plans: <MdOutlinePayments />,
  coupons: <RiCoupon2Line />,
  subscriber_companies: <MdOutlineBusiness />,
  subscribers_companies: <MdOutlineBusiness />,
  accounts: <HiMiniCalculator />,
  payment: <MdOutlinePayments />,
  payments: <MdOutlinePayments />,
  settings: <IoSettingsOutline />,
  token_management: <GiToken />,
};

// /admin is the dashboard itself. Prefix matching would also light it up
// on every other admin page, including Roles & Permissions.
const isMenuPathActive = (itemPath, currentPath) => {
  if (!itemPath || !currentPath) return false;
  const item = String(itemPath).replace(/\/$/, "") || "/";
  const current = String(currentPath).split("?")[0].replace(/\/$/, "") || "/";
  if (item === "/admin") return current === "/admin";
  if (item === "/crm") return current === "/crm" || current === "/crm/overview";
  return current === item || current.startsWith(`${item}/`);
};

// Collapsed-only icon shortcuts for long-standing modules (not Accounts/Payments)
export const dropDownItems = [
  { path: "/hr-dashboard", name: "HR", icon: <HiUsers />, isDropdown: true },
  { path: "/subscription", name: "Subscription", icon: <HiUsers />, isDropdown: true },
  { path: "/payroll-management", name: "Payroll Management", icon: <FcMoneyTransfer />, isDropdown: true },
  { path: "/tasks", name: "Tasks", icon: <MdTask />, isDropdown: true },
  { path: "/crm", name: "CRM", icon: <RiPieChart2Fill />, isDropdown: true },
];

// ─── Static dropdown (unchanged, used for collapsed icon-only links) ──────────
export const DropdownSection = ({ icon, title, items = [], path }) => {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const router = useRouter();

  const isCrm = title?.toLowerCase() === "crm" || path === "/crm";
  const effectivePath = isCrm ? null : path;
  const basePath = effectivePath || `/${generateSlug(title)}`;
  const isParentActive = basePath ? pathName.startsWith(basePath) : false;

  const itemsWithOverview = useMemo(() => {
    if (!isCrm) return items;
    const hasOverview = items.some(
      (item) => (typeof item === "string" ? item : item.name)?.toLowerCase() === "overview",
    );
    if (!hasOverview) {
      return [{ name: "Overview", path: "/crm" }, ...items];
    }
    return items;
  }, [items, isCrm]);

  const normalizedItems = itemsWithOverview.map((item) =>
    typeof item === "string" ? { name: item } : item,
  );

  useEffect(() => {
    if (!basePath) return;
    const hasActiveRoute = normalizedItems.some((item) => {
      const fullPath = item.path || `${basePath}/${generateSlug(item.name)}`;
      return (
        item.children?.some(
          (child) => pathName === child.path || pathName.startsWith(`${child.path}/`),
        ) ||
        (fullPath === "/crm"
          ? pathName === "/crm" || pathName === "/crm/overview"
          : pathName === fullPath || pathName.startsWith(`${fullPath}/`))
      );
    });
    if (hasActiveRoute) setOpen(true);
  }, [pathName, basePath, normalizedItems]);

  const user = useAuthStore((state) => state.user);
  const [accessToken, setAccessToken] = useState(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccessToken(localStorage.getItem("accessToken"));
    }
  }, []);

  useEffect(() => {
    if (accessToken && user && !user.emailVerifiedAt) {
      router.push("/email-verification");
    }
  }, [accessToken, router, user]);

  return (
    <div className="w-full mt-1.5">
      <div
        className={`flex items-center justify-between w-full p-2 px-3 dark:text-gray-300 text-gray-800 rounded-md transition ${open
          ? "dark:bg-gray-800 bg-gray-200 text-secondaryColor"
          : "hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200"
          }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl text-gray-800 dark:text-gray-300">{icon}</span>
          {effectivePath ? (
            <Link href={effectivePath} className={`${isParentActive ? "text-secondaryColor" : ""} whitespace-nowrap`}>
              {title}
            </Link>
          ) : (
            <button onClick={() => setOpen(!open)} className={`${isParentActive ? "text-secondaryColor" : ""} whitespace-nowrap text-left`}>
              {title}
            </button>
          )}
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Toggle submenu">
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      <div
        className={`overflow-y-auto sidebar-scroll transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <ul className="ml-5 my-1.5 pl-5 border-l-[2px] border-gray-300 dark:border-gray-600 py-1 text-gray-300 space-y-2">
          {normalizedItems.map((item, i) => {
            const fullPath = item.path || `${basePath}/${generateSlug(item.name)}`;
            const isActive =
              fullPath === "/crm"
                ? pathName === "/crm" || pathName === "/crm/overview"
                : pathName === fullPath || pathName.startsWith(`${fullPath}/`);
            const hasChildren = item.children?.length > 0;
            return (
              <li key={item.name || i}>
                {hasChildren ? (
                  <details open={item.children.some((child) => pathName === child.path || pathName.startsWith(`${child.path}/`))}>
                    <summary className="cursor-pointer list-none text-sm text-gray-800 hover:text-secondaryColor dark:text-gray-300">
                      {item.name}
                    </summary>
                    <ul className="ml-3 mt-2 space-y-2 border-l border-gray-300 pl-3 dark:border-gray-600">
                      {item.children.map((child) => {
                        const childActive = pathName === child.path || pathName.startsWith(`${child.path}/`);
                        return (
                          <li key={child.path}>
                            <Link
                              href={child.path}
                              className={`block text-sm transition hover:text-secondaryColor ${childActive ? "font-medium text-secondaryColor" : "text-gray-800 dark:text-gray-300"}`}
                            >
                              {child.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={fullPath}
                    className={`block text-sm transition hover:text-secondaryColor ${isActive ? "font-medium text-secondaryColor" : "text-gray-800 dark:text-gray-300"}`}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

// ─── NEW: Dynamic dropdown — uses path directly from API data ─────────────────
export const DynamicDropdownSection = ({ menuItem, uniqueWorkspaces, handleAddWorkSpace }) => {
  const { name, code, path, pages = [] } = menuItem;
  const normalizedName = name?.toLowerCase();
  const isCrm = code === "crm" || normalizedName === "crm" || path === "/crm";
  const isNoLinkParent = isCrm;
  const [open, setOpen] = useState(false);
  const pathName = usePathname();

  const displayPages = useMemo(() => {

    if (isCrm) {
      const hasOverview = pages.some(
        (page) =>
          page.name?.toLowerCase() === "overview" ||
          page.path === "/crm" ||
          page.path === "/crm/overview",
      );
      if (!hasOverview) {
        return [
          { id: "crm-overview", name: "Overview", path: "/crm" },
          ...pages,
        ];
      }
      return pages;
    }


    return pages;
  }, [code, name, pages, isCrm]);

  const icon = ICON_MAP[code] ?? <MdDashboard />;

  // Auto-open when a child route is active
  useEffect(() => {
    const isChildActive = displayPages.some((page) => {
      const isCurrentActive = isMenuPathActive(page.path, pathName);
      return (
        isCurrentActive ||
        page.children?.some((child) => isMenuPathActive(child.path, pathName))
      );
    });
    if (isChildActive) setOpen(true);
  }, [pathName, displayPages]);

  const isParentActive = isMenuPathActive(path, pathName);
  const hasChildren = displayPages.length > 0;

  return (
    <>
      {code === 'task_workspaces' && (
        <WorkspaceDropdownSection
          workspaces={uniqueWorkspaces}
          handleAddWorkSpace={handleAddWorkSpace}
        />
      )}

      {code !== 'task_workspaces' && (
        <div className="w-full mt-1.5">
          {path && !hasChildren && !isNoLinkParent ? (
            <Link
              href={path}
              className={`flex items-center gap-3 w-full p-2 px-3 rounded-md transition ${
                isParentActive
                  ? "dark:bg-gray-800 bg-gray-200 text-secondaryColor font-semibold"
                  : "dark:text-gray-300 text-gray-800 hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200"
              }`}
            >
              <span className="text-xl text-gray-800 dark:text-gray-300">{icon}</span>
              <span className="whitespace-nowrap">{name}</span>
            </Link>
          ) : (
            <div
              className={`flex items-center justify-between w-full p-2 px-3 dark:text-gray-300 text-gray-800 rounded-md transition ${
                isParentActive
                  ? "dark:bg-gray-800 bg-gray-200 text-secondaryColor"
                  : "hover:bg-gray-400 hover:dark:bg-gray-700 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl text-gray-800 dark:text-gray-300">{icon}</span>
                {path && !isNoLinkParent ? (
                  <Link
                    href={path}
                    className={`${isParentActive ? "text-secondaryColor" : ""} whitespace-nowrap`}
                  >
                    {name}
                  </Link>
                ) : (
                  <button
                    onClick={() => setOpen(!open)}
                    className={`${isParentActive ? "text-secondaryColor" : ""} whitespace-nowrap text-left`}
                  >
                    {name}
                  </button>
                )}
              </div>

              {hasChildren && (
                <button onClick={() => setOpen(!open)} aria-label="Toggle submenu">
                  {open ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              )}
            </div>
          )}

          {hasChildren && (
            <div
              className={`overflow-y-auto sidebar-scroll transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <ul className="ml-5 my-1.5 pl-5 border-l-[2px] border-gray-300 dark:border-gray-600 py-1 space-y-2">
                {displayPages.map((page) => {
                  const isActive = isMenuPathActive(page.path, pathName);
                  const hasChildren = page.children?.length > 0;
                  return (
                    <li key={page.id}>
                      {hasChildren ? (
                        <details open={page.children.some((child) => isMenuPathActive(child.path, pathName))}>
                          <summary className="cursor-pointer list-none text-sm text-gray-800 hover:text-secondaryColor dark:text-gray-300">
                            {page.name}
                          </summary>
                          <ul className="ml-3 mt-2 space-y-2 border-l border-gray-300 pl-3 dark:border-gray-600">
                            {page.children.map((child) => {
                              const childActive = isMenuPathActive(child.path, pathName);
                              return (
                                <li key={child.id || child.path}>
                                  <Link
                                    href={child.path}
                                    className={`block text-sm transition hover:text-secondaryColor ${childActive
                                      ? "font-medium text-secondaryColor"
                                      : "text-gray-800 dark:text-gray-300"
                                      }`}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </details>
                      ) : (
                        <Link
                          href={page.path}
                          className={`block text-sm transition hover:text-secondaryColor ${isActive
                            ? "font-medium text-secondaryColor"
                            : "text-gray-800 dark:text-gray-300"
                            }`}
                        >
                          {page.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DropdownSection;