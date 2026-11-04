// src/features/hr-dashboard/hr-requisition-request/MyRequisitions.jsx
"use client";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaList } from "react-icons/fa6";
import { RotateCcw } from "lucide-react";
import RequisitionsListTab from "./tabs/RequisitionsListTab";
import RefundableTab from "./tabs/RefundableTab";
import helpers from "@/utils/helpers";

const TAB_CONFIG = [
  {
    key: "my-requisitions-list",
    label: "My Requisitions List",
    icon: <FaList className="w-4 h-4" />,
    component: RequisitionsListTab,
  },
  {
    key: "refundable",
    label: "Refundable",
    icon: <RotateCcw className="w-4 h-4" />,
    component: RefundableTab,
  },
];

const MyRequisitions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(() => {
    return tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)
      ? tabParam
      : TAB_CONFIG[0].key;
  });

  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems();

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && TAB_CONFIG.some((tab) => tab.key === currentTab)) {
      setActiveTab(currentTab);
    } else if (!currentTab) {
      setActiveTab(TAB_CONFIG[0].key);
    }
  }, [searchParams]);

  const handleTabChange = useCallback(
    (tabKey) => {
      setActiveTab(tabKey);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tabKey);
        url.searchParams.set("page", "1");
        if (!url.searchParams.has("limit")) {
          url.searchParams.set("limit", String(initialLimit));
        }
        router.push(url.pathname + url.search, { scroll: false });
      }
    },
    [router, initialLimit]
  );

  const CurrentTabComponent =
    TAB_CONFIG.find((tab) => tab.key === activeTab)?.component || RequisitionsListTab;

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
        <CurrentTabComponent />
      </div>
    </div>
  );
};

export default MyRequisitions;
