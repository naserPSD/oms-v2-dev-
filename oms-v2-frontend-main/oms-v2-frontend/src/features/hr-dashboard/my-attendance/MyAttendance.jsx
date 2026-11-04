"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { FaList, FaUserClock } from "react-icons/fa";
import MyAttendanceTab from "./tabs/MyAttendanceTab";
import AttendanceReconciliationTab from "./tabs/AttendanceReconciliationTab";

const TAB_CONFIG = [
  {
    key: "my-attendance",
    label: "My Attendance",
    icon: <FaUserClock className="w-4 h-4" />,
    component: MyAttendanceTab,
  },
  {
    key: "attendance-reconciliation",
    label: "Attendance Reconciliation",
    icon: <FaList className="w-4 h-4" />,
    component: AttendanceReconciliationTab,
  },
];

const normalizeTabKey = (tabKey) => {
  if (tabKey === "attendance-reconciliations") return "attendance-reconciliation";
  return tabKey;
};

const MyAttendance = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("my-attendance");

  useEffect(() => {
    const rawTab = searchParams.get("tab");
    const currentTab = normalizeTabKey(rawTab);
    if (currentTab && TAB_CONFIG.some((tab) => tab.key === currentTab)) {
      setActiveTab(currentTab);
    } else if (!rawTab) {
      setActiveTab("my-attendance");
    }
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const currentTab = normalizeTabKey(params.get("tab"));
      if (currentTab && TAB_CONFIG.some((tab) => tab.key === currentTab)) {
        setActiveTab(currentTab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  const activeTabItem =
    TAB_CONFIG.find((tab) => tab.key === activeTab) || TAB_CONFIG[0];
  const ActiveComponent = activeTabItem?.component;

  return (
    <div className="my-6">
      {/* 2 Tabs: My Attendance & Attendance Reconciliation */}
      <div className="flex flex-wrap items-center divide-x text-gray-500 divide-gray-400 font-bold text-xs mb-4 border-b pb-2.5">
        {TAB_CONFIG.map((tab) => (
          <div key={tab.key}>
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
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default MyAttendance;
