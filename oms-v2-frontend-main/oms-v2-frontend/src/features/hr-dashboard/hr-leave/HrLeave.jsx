"use client";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCog, FaFileAlt, FaFileExport } from "react-icons/fa";
import { FaChartPie } from "react-icons/fa6";
import LeaveStatisticsTab from "./tabs/LeaveStatisticsTab";
import LeaveApplicationsTab from "./tabs/LeaveApplicationsTab";
import LeaveReportTab from "./tabs/LeaveReportTab";
import LeaveCalendarTab from "./tabs/LeaveCalendarTab";
import LeaveSetupTab from "./tabs/LeaveSetupTab";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import SetupGuideBanner from "@/features/setup/SetupGuideBanner";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { AlertCircle, ArrowRight, RefreshCw, X } from "lucide-react";
import { BiPlus } from "react-icons/bi";
import Link from "next/link";

const HrLeave = () => {
  const { hasPermission } = useCommonFunctions();
  const getTabConfig = () => {
    const allTabs = [
      {
        key: "leaveStatistics",
        label: "Leave Statistics",
        icon: <FaChartPie className="w-4 h-4" />,
        component: <LeaveStatisticsTab hasPermission={hasPermission} />,
        permission: "hr.leave_statistics_list_view",
      },
      {
        key: "leaveApplications",
        label: "Leave Applications",
        icon: <FaFileAlt className="w-4 h-4" />,
        component: <LeaveApplicationsTab />,
        permission: "hr.leave_application_list_view",
      },
      {
        key: "leaveReport",
        label: "Leave Report",
        icon: <FaFileExport className="w-4 h-4" />,
        component: <LeaveReportTab />,
        permission: "hr.yearly_leave_report_view",
      },
      {
        key: "leaveCalendar",
        label: "Leave Calendar",
        icon: <FaCalendarAlt className="w-4 h-4" />,
        component: <LeaveCalendarTab />,
        permission: "",
      },
      {
        key: "leaveSetup",
        label: "Leave Setup",
        icon: <FaCog className="w-4 h-4" />,
        component: <LeaveSetupTab hasPermission={hasPermission} />,
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
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      return tabParam;
    }
    return TAB_CONFIG.length > 0 ? TAB_CONFIG[0]?.key : "";
  });

  const { useAppEmployeeUsersQuery } = useHrQueryApi();
  const {
    data: employeeList = [],
    isLoading: isLoadingEmployees,
    refetch: refetchEmployeeList,
  } = useAppEmployeeUsersQuery();

  const [dismissInstruction, setDismissInstruction] = useState(false);

  // Sync tab on mount
  useEffect(() => {
    if (TAB_CONFIG.length === 0) return;
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && TAB_CONFIG.length > 0) {
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
        You Don't Have Permission to View Any Leave Section.
      </div>
    );
  }

  return (
    <div className="my-6">
      <SetupGuideBanner showHr dismissKey="hr-leave-setup-tip" />

      {/* Instruction to add employee first if not available */}
      {!isLoadingEmployees && employeeList.length === 0 && !dismissInstruction && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    No Employees Available — Please Add Employees First
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Leave management, applications, and allowance tracking require active employees in your organization. Please add employee profiles first before managing leave records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissInstruction(true)}
                  className="rounded-md p-1 text-gray-400 hover:bg-white/70 hover:text-gray-600 dark:hover:bg-gray-800"
                  aria-label="Dismiss instruction"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 rounded-lg border border-amber-200/80 bg-white/70 p-3 text-xs dark:border-amber-900/40 dark:bg-gray-900/60">
                <p className="font-semibold text-gray-900 dark:text-gray-200">
                  Steps to set up Leave Management:
                </p>
                <ol className="mt-1.5 list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    Go to the{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Employees
                    </span>{" "}
                    management page.
                  </li>
                  <li>
                    Create employees with their basic details, designation, and department.
                  </li>
                  <li>
                    Configure annual leave entitlements in{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Leave Setup
                    </span>{" "}
                    and track employee leave balances.
                  </li>
                </ol>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/hr-dashboard/employee?tab=employee-list"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                >
                  <BiPlus className="h-4 w-4" />
                  <span>Go to Employees</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default HrLeave;
