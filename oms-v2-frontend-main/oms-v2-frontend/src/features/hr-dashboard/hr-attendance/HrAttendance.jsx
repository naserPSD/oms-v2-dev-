"use client";

import {
  FaList,
  FaClock as FaPendingClock,
  FaChartBar,
} from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { useRouter, useSearchParams } from "next/navigation";
import HrAttendanceListTab from "./tabs/HrAttendanceListTab";
import HrPendingAttendanceTab from "./tabs/HrPendingAttendanceTab";
import HrAttendanceReconciliationsTab from "./tabs/HrAttendanceReconciliationsTab";
import HrMonthlyAttendanceReportTab from "./tabs/HrMonthlyAttendanceReportTab";
import { MdRule } from "react-icons/md";
import AttendanceRules from "./tabs/AttendanceRules";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useCallback } from "react";

const HrAttendance = () => {
  const { hasPermission } = useCommonFunctions();

  const getTabConfig = useCallback(() => {
    const allTabs = [
      {
        key: "attendance-list",
        label: "Attendance List",
        icon: <FaList className="w-4 h-4" />,
        component: HrAttendanceListTab,
        permission: "hr.attendance_list_view",
      },
      {
        key: "attendance-reconciliations",
        label: "Attendance Reconciliations",
        icon: <FaList className="w-4 h-4" />,
        component: HrAttendanceReconciliationsTab,
        permission: "hr.attendance_reconciliations_view",
      },
      {
        key: "monthly-report",
        label: "Monthly Report",
        icon: <FaChartBar className="w-4 h-4" />,
        component: HrMonthlyAttendanceReportTab,
        permission: "hr.monthly_attendance_report_view",
      },
      {
        key: "attendance-rules",
        label: "Attendance Rules",
        icon: <MdRule className="w-4 h-4" />,
        component: AttendanceRules,
        permission: "",
      },
      {
        key: "pending-attendance",
        label: "Pending Attendance",
        icon: <FaPendingClock className="w-4 h-4" />,
        component: HrPendingAttendanceTab,
        permission: "hr.pending_attendance_view",
      },
    ];

    return allTabs.filter((tab) => {
      if (!tab.permission || tab.permission === "") {
        return true;
      }
      return hasPermission(tab.permission);
    });
  }, [hasPermission]);

  const TAB_CONFIG = useMemo(() => getTabConfig(), [getTabConfig]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => {
    return (
      tabParam ||
      (TAB_CONFIG.length > 0 ? TAB_CONFIG[0]?.key : "attendance-list")
    );
  });

  // Sync tab on mount if needed
  useEffect(() => {
    if (TAB_CONFIG.length === 0) return;
    const currentTab = searchParams.get("tab");
    if (currentTab && TAB_CONFIG.some((tab) => tab.key === currentTab)) {
      setActiveTab(currentTab);
    } else if (!currentTab && TAB_CONFIG.length > 0) {
      setActiveTab(TAB_CONFIG[0].key);
    }
  }, []);

  // Sync tab on browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const currentTab = params.get("tab");
      if (currentTab && TAB_CONFIG.some((tab) => tab.key === currentTab)) {
        setActiveTab(currentTab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [TAB_CONFIG]);

  const handleTabChange = useCallback(
    (tabKey) => {
      setActiveTab(tabKey);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabKey);
      window.history.replaceState(null, "", url.pathname + url.search);
      router.push(url.pathname + url.search, { scroll: false });
    },
    [router],
  );

  if (TAB_CONFIG.length === 0) {
    return (
      <div className="my-6 text-center text-gray-500">
        You Don&apos;t Have Permission to View Any Attendance Section.
      </div>
    );
  }

  const activeTabItem = TAB_CONFIG.find((tab) => tab.key === activeTab) || TAB_CONFIG[0];
  const ActiveComponent = activeTabItem?.component;

  return (
    <div className="my-6">
      {/* Tabs */}

      <div className="flex flex-wrap items-center divide-x text-gray-500 divide-gray-400 font-bold text-xs mb-4 border-b pb-2.5">
        {TAB_CONFIG.map((tab) => (
          <div key={tab.key} className="">
            <TabItemTw
              active={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={activeTab === tab.key ? "border-b" : ""}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabItemTw>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {ActiveComponent && <ActiveComponent hasPermission={hasPermission} />}
      </div>
    </div>
  );
};

export default HrAttendance;
