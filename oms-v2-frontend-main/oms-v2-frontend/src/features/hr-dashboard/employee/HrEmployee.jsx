// src/features/hr-dashboard/employee/HrEmployee.jsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaBirthdayCake, FaLaptop, FaUsers } from "react-icons/fa";

import { TabItemTw } from "@/components/ui/TabItemTw";
import BirthdayCalendarTab from "./tabs/BirthdayCalendarTab";
import EmployeeRefundRequestsTab from "./tabs/EmployeeRefundRequestsTab";
//import EmployeeConfigurationTab from "./tabs/EmployeeConfigurationTab";
import EmployeeAssetAllocationTab from "./tabs/EmployeeAssetAllocationTab";
import EmployeeListTab from "./tabs/EmployeeListTab";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import SetupGuideBanner from "@/features/setup/SetupGuideBanner";
import { RotateCcw } from "lucide-react";

const HrEmployee = () => {
  const { hasPermission } = useCommonFunctions();

  const getTabConfig = () => {
    const allTabs = [
      {
        key: "employee-list",
        label: "Employee List",
        icon: <FaUsers className="w-4 h-4" />,
        component: <EmployeeListTab />,
        permission: "",
      },
      {
        key: "employee-asset-allocation",
        label: "Employee Asset Allocation",
        icon: <FaLaptop className="w-4 h-4" />,
        component: <EmployeeAssetAllocationTab />,
        permission: "",
      },
      {
        key: "birthday-calendar",
        label: "Birthday Calendar",
        icon: <FaBirthdayCake className="w-4 h-4" />,
        component: <BirthdayCalendarTab />,
        permission: "hr.birthday_calender_view",
      },
      {
        key: "refund-requests",
        label: "Refund Requests",
        icon: <RotateCcw className="w-4 h-4" />,
        component: <EmployeeRefundRequestsTab />,
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
      router.push(`?tab=${tabKey}`, { scroll: false });
    },
    [router],
  );

  if (TAB_CONFIG.length === 0) {
    return (
      <div className="my-6 text-center text-gray-500">
        You Don't Have Permission to View Any Attendance Section.
      </div>
    );
  }

  return (
    <div className="my-6">
      <SetupGuideBanner showHr dismissKey="hr-employee-setup-tip" />
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

export default HrEmployee;
