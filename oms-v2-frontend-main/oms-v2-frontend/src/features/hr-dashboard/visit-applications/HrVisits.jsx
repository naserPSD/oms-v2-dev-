"use client";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { FaChartPie } from "react-icons/fa6";
import HrVisitApplications from "./HrVisitApplications";
import ApplyVisitors from "./ApplyVisitors";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const HrVisits = () => {
  const { hasPermission } = useCommonFunctions();
  const getTabConfig = () => {
    const allTabs = [
      {
        key: "requested-visitors",
        label: "Visitor Requests",
        icon: <FaChartPie className="w-4 h-4" />,
        component: <HrVisitApplications hasPermission={hasPermission} />,
        permission: "hr.visit_application_list_view",
      },
      {
        key: "apply-visitors",
        label: "Apply For Visit",
        icon: <FaFileAlt className="w-4 h-4" />,
        component: <ApplyVisitors hasPermission={hasPermission} />,
        permission: "",
      },
    ];

    return allTabs.filter((tab) => {
      if (!tab.permission || tab.permission === "") {
        return true;
      }
      return hasPermission(tab.permission);
    });
  };
  const TAB_CONFIG = useMemo(() => getTabConfig(), [hasPermission]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return TAB_CONFIG.length > 0 ? TAB_CONFIG[0]?.key : "";
  });

  useEffect(() => {
    if (TAB_CONFIG.length === 0) return;
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && TAB_CONFIG.length > 0) {
      setActiveTab(TAB_CONFIG[0].key);
    }
  }, []);

  const handleTabChange = useCallback(
    (tabKey) => {
      setActiveTab(tabKey);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabKey);
      router.push(url.pathname + url.search, { scroll: false });
    },
    [router],
  );

  if (TAB_CONFIG.length === 0) {
    return (
      <div className="my-6 text-center text-gray-500">
        You Don't Have Permission to View Any Leave Section.
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* Tabs */}

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
        {TAB_CONFIG.find((tab) => tab.key === activeTab)?.component}
      </div>
    </div>
  );
};

export default HrVisits;
