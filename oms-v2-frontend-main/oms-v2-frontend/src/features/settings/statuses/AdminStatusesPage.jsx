"use client";

import { TabItemTw } from "@/components/ui/TabItemTw";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaLayerGroup, FaTags } from "react-icons/fa";
import StatusGroupsTab from "./tabs/StatusGroupsTab";
import StatusesTab from "./tabs/StatusesTab";
import ButtonTw2 from "@/components/ui/ButtonTw2";
import { FaFilter } from "react-icons/fa";

const TAB_CONFIG = [
  {
    key: "status-groups",
    label: "Status Groups",
    icon: <FaLayerGroup className="w-4 h-4" />,
  },
  {
    key: "statuses",
    label: "Statuses",
    icon: <FaTags className="w-4 h-4" />,
  },
];

const AdminStatusesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("statusesShowFilter") || "show",
  );

  const toggleFilter = () => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("statusesShowFilter", newValue);
      return newValue;
    });
  };

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      return tabParam;
    }
    return TAB_CONFIG[0].key;
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = useCallback(
    (key) => {
      setActiveTab(key);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const tabContent = useMemo(() => {
    if (activeTab === "statuses") {
      return (
        <StatusesTab showFilter={showFilter === "show"} />
      );
    }
    return <StatusGroupsTab showFilter={showFilter === "show"} />;
  }, [activeTab, showFilter]);

  return (
    <div className="my-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="title-color font-bold text-lg">Statuses</h1>
        <ButtonTw2
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleFilter}
          className="inline-flex items-center gap-2"
        >
          <FaFilter className="h-3.5 w-3.5" />
          {showFilter === "show" ? "Hide filters" : "Show filters"}
        </ButtonTw2>
      </div>

      <div className="flex flex-wrap items-center divide-x text-gray-500 divide-gray-400 font-bold text-xs mb-4 border-b pb-2.5 dark:divide-gray-600">
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

      <div className="mt-4 overflow-visible">{tabContent}</div>
    </div>
  );
};

export default AdminStatusesPage;
