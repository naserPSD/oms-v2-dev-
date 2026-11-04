"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { handleLogout } from "@/utils/commonApiFunction";
import {
  Clock,
  LucideNotebookPen,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import moment from "moment";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaClipboardList,
  FaCog,
  FaKey,
  FaPlus,
  FaSignOutAlt,
  FaUser,
  FaUserClock,
  FaGraduationCap,
} from "react-icons/fa";
// import { GiOfficeChair } from "react-icons/gi";
import { MdRequestPage } from "react-icons/md";
import Notification from "./components/notifications/Notification";
import AddRequisitionsModal from "./modals/AddRequisitionsModalInNavbar";
import AddNoteModal from "./modals/AddNoteModal";
import FullscreenButton from "@/components/common/FullscreenButton";
import Avatar from "@/components/ui/Avatar";
import helpers from "@/utils/helpers";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

const DashboardNavbar = () => {
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const { hasPermission } = useCommonFunctions();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const isPureAdmin = user?.appUseCase === "Admin";
  const profileHref = isPureAdmin ? "/admin/my-profile" : "/my-profile";

  const isAdminPanel = isPureAdmin;
  const canSeeMyAttendance = !isAdminPanel && !isPureAdmin;
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loading = !user;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [isRequisitionsOpen, setIsRequisitionsOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // Optional: Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss A"));
  const [currentDate, setCurrentDate] = useState(
    moment().format("dddd, DD MMMM"),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss A"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(moment().format("dddd, DD MMMM"));
    };

    updateDate();

    const now = moment();
    const midnight = moment().endOf("day");
    const msUntilMidnight = midnight.diff(now);

    const timeoutId = setTimeout(() => {
      updateDate();
      const intervalId = setInterval(updateDate, 86400000);
      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  const formatRoles = (roles = []) => {
    if (!roles.length) return "No Role";

    const names = roles.map((r) => r ?? r);

    if (names.length === 1) return names[0];

    if (names.length === 2) {
      return `${names[0]} and ${names[1]}`;
    }

    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-[#0f172a]/85 border-b border-gray-200/80 dark:border-gray-800/80 backdrop-blur-md shadow-xs flex items-center justify-between py-2.5 px-4 md:px-6 dark:text-gray-200 sticky top-0 z-40 transition-colors duration-200">
        {/* Left Section - Avatar + User Info + Live Clock */}
        <div className="flex items-center gap-3">
          <SimpleTooltip text={`View Profile: ${(user?.firstName || "") + " " + (user?.lastName || "")}`}>
            <Link
              href={profileHref}
              className="flex items-center gap-3 p-1 -m-1 rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all group cursor-pointer"
            >
              <div className="relative">
                <Avatar
                  text={helpers.avatarText((user?.firstName || "") + " " + (user?.lastName || ""))}
                  image={user?.profile?.profilePicture?.fileUrl}
                  color="info"
                  size="lg"
                  ring={!user?.profile?.profilePicture?.fileUrl}
                />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f172a]" />
              </div>
              {loading ? (
                <div className="animate-pulse space-y-1">
                  <div className="h-4 w-20 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-3 w-14 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ) : (
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primaryColor dark:group-hover:text-primaryColor-400 transition-colors line-clamp-1 leading-tight">
                    {(user?.firstName || "") + " " + (user?.lastName || "")}
                  </p>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                      isAdminPanel
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-700/60"
                    }`}
                  >
                    {formatRoles(user?.userRole)}
                  </span>
                </div>
              )}
            </Link>
          </SimpleTooltip>

          {/* Divider */}
          <div className="hidden lg:block h-7 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

          {/* Clock & Date Widget */}
          <SimpleTooltip text={`Current System Time: ${currentTime} • ${currentDate}`}>
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50/90 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 shadow-xs backdrop-blur-xs select-none">
              <div className="flex items-center justify-center size-6 rounded-lg bg-pink-500/10 text-pink-500 dark:bg-pink-500/20 dark:text-pink-400">
                <Clock size={13} />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold tracking-wider text-pink-600 dark:text-pink-400 tabular-nums">
                  {currentTime}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                  {currentDate}
                </p>
              </div>
            </div>
          </SimpleTooltip>
        </div>

        {/* Right Section - Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2.5">
          <FullscreenButton />

          {!isAdminPanel && hasPermission("navbar.add_requisitions_add") && (
            <SimpleTooltip text="Create a new requisition request">
              <button
                type="button"
                className="cursor-pointer flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl text-white bg-linear-to-r from-blue-600 via-indigo-600 to-primaryColor hover:from-blue-500 hover:via-indigo-500 hover:to-primaryColor/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 group"
                onClick={() => setIsRequisitionsOpen(true)}
              >
                <span className="bg-white/20 group-hover:bg-white/30 text-white rounded-full size-4.5 flex items-center justify-center transition-transform group-hover:rotate-90 duration-200">
                  <FaPlus size={10} />
                </span>
                <span>Add requisitions</span>
              </button>
            </SimpleTooltip>
          )}

          {!isAdminPanel && hasPermission("navbar.​_add_notes_add") && (
            <SimpleTooltip text="Add quick personal notes">
              <button
                type="button"
                className="flex items-center gap-2 text-xs font-semibold border border-gray-200 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 px-3.5 py-2 rounded-xl text-gray-700 dark:text-gray-200 cursor-pointer shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95"
                onClick={() => setIsNoteOpen(true)}
              >
                <LucideNotebookPen size={13} className="text-primaryColor dark:text-primaryColor-400" />
                <span>Add notes</span>
              </button>
            </SimpleTooltip>
          )}

          {/* Theme Dropdown Toggle */}
          <DropdownMenu open={isThemeOpen} onOpenChange={setIsThemeOpen}>
            <SimpleTooltip text="Switch theme mode" disabled={isThemeOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 flex items-center justify-center transition-all duration-200 active:scale-95 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer shadow-xs relative"
                  aria-label="Toggle theme"
                >
                  <Sun className="h-[1.15rem] w-[1.15rem] scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90 text-amber-500" />
                  <Moon className="absolute h-[1.15rem] w-[1.15rem] scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0 text-cyan-400" />
                  <span className="sr-only">Toggle theme</span>
                </button>
              </DropdownMenuTrigger>
            </SimpleTooltip>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-1 z-50">
              <DropdownMenuItem
                onSelect={() => setTheme("light")}
                onClick={() => setTheme("light")}
                className={`flex items-center justify-between rounded-lg cursor-pointer px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === "light"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="size-4 text-amber-500" />
                  Light Mode
                </span>
                {theme === "light" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setTheme("dark")}
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-between rounded-lg cursor-pointer px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Moon className="size-4 text-cyan-400" />
                  Dark Mode
                </span>
                {theme === "dark" && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setTheme("system")}
                onClick={() => setTheme("system")}
                className={`flex items-center justify-between rounded-lg cursor-pointer px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === "system"
                    ? "bg-gray-200/60 dark:bg-gray-700/60 text-gray-900 dark:text-white font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Settings className="size-4 text-gray-500" />
                  System Default
                </span>
                {theme === "system" && <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notification */}
          <Notification />

          {/* Quick Menu */}
          <div className="relative" ref={userMenuRef}>
            <SimpleTooltip text="Quick Navigation & Menu" disabled={showUserMenu}>
              <button
                type="button"
                onClick={() => setShowUserMenu((v) => !v)}
                className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-xs ${
                  showUserMenu
                    ? "border-primaryColor bg-primaryColor/10 text-primaryColor dark:border-primaryColor-400 dark:text-primaryColor-400 shadow-sm"
                    : "border-gray-200 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                aria-label="Toggle navigation menu"
              >
                <Menu size={18} />
              </button>
            </SimpleTooltip>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-[290px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl z-102 border border-gray-200/80 dark:border-gray-700/80 p-2 divide-y divide-gray-100 dark:divide-gray-700/50">
                <div className="px-3 py-2 text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                    {(user?.firstName || "") + " " + (user?.lastName || "")}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {formatRoles(user?.userRole)}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href={profileHref}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 rounded-xl transition-colors"
                  >
                    <FaUser size={13} className="text-primaryColor" />
                    Profile
                  </Link>

                  {/* Direct quick-access to Admin Console for Admin users */}
                  {isPureAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                    >
                      <FaCog size={13} />
                      Admin Console (/admin)
                    </Link>
                  )}

                  {/* {!isAdminPanel && !isPureAdmin && hasPermission("navbar.my_employee_invitaion_request") && (
                    <Link
                      href="/hr-dashboard/my-invitation-requests"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 rounded-xl transition-colors"
                    >
                      <GiOfficeChair size={15} className="text-teal-500" />
                      Employee Invitation Request
                    </Link>
                  )} */}
                  {!isAdminPanel && !isPureAdmin && hasPermission("navbar.my_leave_request") && (
                    <Link
                      href="/hr-dashboard/leave-request"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 rounded-xl transition-colors"
                    >
                      <MdRequestPage size={14} className="text-blue-500" />
                      My Leave Request
                    </Link>
                  )}
                  {canSeeMyAttendance && (
                    <Link
                      href="/hr-dashboard/my-attendance"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 rounded-xl transition-colors"
                    >
                      <FaUserClock size={13} className="text-emerald-500" />
                      My Attendance
                    </Link>
                  )}
                  {!isAdminPanel && !isPureAdmin && hasPermission("navbar.my_requisitions") && (
                    <Link
                      href="/hr-dashboard/my-requisitions"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 rounded-xl transition-colors"
                    >
                      <FaClipboardList size={13} className="text-indigo-500" />
                      My Requisitions
                    </Link>
                  )}
                  {!isAdminPanel && !isPureAdmin && (
                    <Link
                      href="/hr-dashboard/my-training-requests"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 rounded-xl transition-colors"
                    >
                      <FaGraduationCap size={14} className="text-purple-500" />
                      Training Request
                    </Link>
                  )}

                  <Link
                    href="/password-change"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 rounded-xl transition-colors"
                  >
                    <FaKey size={13} className="text-amber-500" />
                    Change Password
                  </Link>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleLogout(router)}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                  >
                    <FaSignOutAlt size={13} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Icons Row */}
        <div className="flex lg:hidden items-center gap-2">
          <FullscreenButton />
          {!isAdminPanel && (
            <SimpleTooltip text="Add notes">
              <button
                type="button"
                className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 flex items-center justify-center text-gray-700 dark:text-gray-300 cursor-pointer shadow-xs transition-all active:scale-95"
                onClick={() => setIsNoteOpen(true)}
              >
                <LucideNotebookPen size={15} />
              </button>
            </SimpleTooltip>
          )}
          {/* Mobile Time & Date */}
          <div className="sm:block text-right mr-1">
            <p className="text-xs text-pink-500 font-bold tabular-nums">
              {currentTime.split(" ")[0]}
            </p>
            <p className="text-[10px] text-gray-500">{currentDate.split(",")[0]}</p>
          </div>

          <Notification />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-100 dark:hover:bg-gray-700/80 flex items-center justify-center text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer transition-all active:scale-95 shadow-xs"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-101"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="lg:hidden fixed top-16 inset-x-0 bottom-0 bg-white dark:bg-gray-900 z-103 flex flex-col ml-15">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* User Profile Section */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Image
                  src={
                    user?.profile?.profilePicture?.fileUrl ||
                    "/assets/icons/avatar.png"
                  }
                  alt="User"
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-base font-bold text-black dark:text-white">
                    {user?.firstName + " " + user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Super Admin</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-pink-500 font-medium">
                      {currentTime}
                    </p>
                    <span className="text-gray-400">•</span>
                    <p className="text-sm text-gray-500">{currentDate}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isAdminPanel && hasPermission("navbar.add_requisitions_add") && (
                  <button
                    className="w-full flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setIsRequisitionsOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="secondaryColor-light text-white rounded-full size-6 flex items-center justify-center">
                      <FaPlus size={14} />
                    </span>
                    Add requisitions
                  </button>
                )}



                {!isAdminPanel && hasPermission("navbar.​_add_notes_add") && (
                  <button
                    className="w-full flex items-center gap-3 text-sm border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setIsNoteOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LucideNotebookPen size={16} />
                    Add notes
                  </button>
                )}

                <FullscreenButton mobile={true} />
              </div>

              {/* Theme Toggle for Mobile */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTheme("light");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Sun size={16} />
                    Light
                  </button>
                  <button
                    onClick={() => {
                      setTheme("dark");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                  <button
                    onClick={() => {
                      setTheme("system");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    ⚙️ System
                  </button>
                </div>
              </div>

              {/* User Menu Links for Mobile */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <Link
                  href={profileHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FaUser size={16} />
                  Profile
                </Link>

                {/* {hasPermission("navbar.my_employee_invitaion_request") && (
                  <Link
                    href="/hr-dashboard/my-invitation-requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <GiOfficeChair size={20} />
                    My Employee Invitation Request
                  </Link>
                )} */}
                {hasPermission("navbar.my_leave_request") && (
                  <Link
                    href="/hr-dashboard/leave-request"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <MdRequestPage size={16} />
                    My Leave Request
                  </Link>
                )}
                {!isAdminPanel && !isPureAdmin && (
                  <Link
                    href="/hr-dashboard/my-attendance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FaUserClock size={16} />
                    My Attendance
                  </Link>
                )}
                {hasPermission("navbar.my_requisitions") && (
                  <Link
                    href="/hr-dashboard/my-requisition-requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FaClipboardList size={16} />
                    My Requisitions
                  </Link>
                )}
                {!isAdminPanel && !isPureAdmin && (
                  <Link
                    href="/hr-dashboard/my-training-requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FaGraduationCap size={16} />
                    Training Request
                  </Link>
                )}

                <Link
                  href="/password-change"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FaKey size={16} />
                  Change Password
                </Link>

                
                <button
                  type="button"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FaCog size={16} />
                  Account
                </button>
              </div>
            </div>

            {/* Fixed Logout Button at Bottom */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout(router);
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FaSignOutAlt size={16} />
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <AddRequisitionsModal
        showModal={isRequisitionsOpen}
        handleClose={() => setIsRequisitionsOpen(false)}
      />

      <AddNoteModal
        showModal={isNoteOpen}
        handleClose={() => setIsNoteOpen(false)}
      />
    </>
  );
};

export default DashboardNavbar;
