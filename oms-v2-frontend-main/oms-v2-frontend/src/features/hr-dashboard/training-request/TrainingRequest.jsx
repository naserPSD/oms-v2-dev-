"use client";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { FaFileAlt } from "react-icons/fa";
import { FaList } from "react-icons/fa6";
import RequestListTab from "./tabs/RequestListTab";
import RejectedListTab from "./tabs/RejectedListTab";
import helpers from "@/utils/helpers";
import ApprovedListTab from "./tabs/ApprovedListTab";

const TAB_CONFIG = [
  {
    key: "request-list",
    label: "Request List",
    icon: <FaList className="w-4 h-4" />,
    component: <RequestListTab />,
  },
  {
    key: "approved-list",
    label: "Approved List",
    icon: <FaFileAlt className="w-4 h-4" />,
    component: <ApprovedListTab />,
  },
  {
    key: "rejected-list",
    label: "Rejected List",
    icon: <FaFileAlt className="w-4 h-4" />,
    component: <RejectedListTab />,
  },
];
const TrainingRequest = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems();

  // Memoize tab config for better performance
  const tabConfigMap = useMemo(() => {
    const map = {};
    TAB_CONFIG.forEach((tab) => {
      map[tab.key] = tab;
    });
    return map;
  }, []);
  const buildTabUrl = useCallback(
    (tabKey, page = initialPage, limit = initialLimit) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabKey);
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      return `${pathname}?${params.toString()}`;
    },
    [initialLimit, initialPage, pathname, searchParams],
  );

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    return tabConfigMap[tabParam] ? tabParam : TAB_CONFIG[0].key;
  }, [searchParams, tabConfigMap]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (!tabParam || !tabConfigMap[tabParam]) {
      const defaultUrl = buildTabUrl(TAB_CONFIG[0].key, initialPage, initialLimit);
      router.replace(defaultUrl, { scroll: false });
    }
  }, [searchParams, router, tabConfigMap, initialLimit, initialPage, buildTabUrl]);

  const handleTabChange = useCallback(
    (tabKey) => {
      if (activeTab === tabKey) return;
      const tabUrl = buildTabUrl(tabKey, initialPage, initialLimit);
      router.push(tabUrl, { scroll: false });
    },
    [activeTab, buildTabUrl, router, initialLimit, initialPage],
  );
  // Get active tab component
  const activeTabComponent = useMemo(() => {
    return tabConfigMap[activeTab]?.component || null;
  }, [activeTab, tabConfigMap]);

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
      <div className="mt-4">{activeTabComponent}</div>
    </div>
  );
};

export default TrainingRequest;
