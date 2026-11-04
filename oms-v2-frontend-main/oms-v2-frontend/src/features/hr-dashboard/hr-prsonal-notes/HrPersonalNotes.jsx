"use client";

import { TabItemTw } from "@/components/ui/TabItemTw";
import { ArchiveIcon, NotepadText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import PersonalNotesTab from "./components/PersonalNotesTab";
import ArchivePersonalNotesTab from "./components/ArchivePersonalNotesTab";
import helpers from "@/utils/helpers";

const TAB_CONFIG = [
  {
    key: "personal-notes",
    label: "Personal Notes",
    icon: <NotepadText className="w-4 h-4" />,
    component: <PersonalNotesTab />,
  },
  {
    key: "archive-notes",
    label: "Archive Notes",
    icon: <ArchiveIcon className="w-4 h-4" />,
    component: <ArchivePersonalNotesTab />,
  },
];
const HrPersonalNotes = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0].key);
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
  // Initialize active tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabConfigMap[tabParam]) {
      setActiveTab(tabParam);
    } else {
      // Set default tab
      const params = new URLSearchParams(window.location.search);
      params.set("tab", TAB_CONFIG[0].key);
      params.set("page", initialPage.toString());
      params.set("limit", initialLimit.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
      setActiveTab(TAB_CONFIG[0].key);
    }
  }, [searchParams, router, tabConfigMap]);

  const handleTabChange = useCallback(
    (tabKey) => {
      setActiveTab(tabKey);
      const params = new URLSearchParams(window.location.search);
      params.set("tab", tabKey);
      params.set("page", initialPage.toString());
      params.set("limit", initialLimit.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router]
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

export default HrPersonalNotes;
