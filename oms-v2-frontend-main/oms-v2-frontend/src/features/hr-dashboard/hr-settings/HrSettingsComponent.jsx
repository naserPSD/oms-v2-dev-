"use client";

import { FaList } from "react-icons/fa";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TabItemTw } from "@/components/ui/TabItemTw";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdBlindsClosed } from "react-icons/md";
import HrOffice from "./tabs/hr-office/HrOffice";
import DepartmentsComponent from "./tabs/departments/DepartmentsComponent";
import DesignationsComponent from "./tabs/designations/DesignationsComponent";
import OfficeHolidaysComponent from "./tabs/office-holidays/OfficeHolidaysComponent";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { FcDepartment } from "react-icons/fc";
import HrSetupProgress from "./components/HrSetupProgress";
import SetupGuideBanner from "@/features/setup/SetupGuideBanner";
import {
  fetchOffice,
  fetchWeekend,
  fetchOfficeHoliday,
} from "@/services/hrServiceApi";
import {
  fetchDepartments,
  fetchDesignations,
} from "@/services/companySettingsApi";

const TAB_CONFIG = [
  {
    key: "office",
    label: "Office",
    icon: <HiBuildingOffice2 className="w-4 h-4" />,
    component: <HrOffice />,
  },
  {
    key: "departments",
    label: "Departments",
    icon: <FcDepartment className="w-4 h-4" />,
    component: <DepartmentsComponent />,
  },
  {
    key: "designations",
    label: "Designations",
    icon: <FaList className="w-4 h-4" />,
    component: <DesignationsComponent />,
  },
  {
    key: "office-holidays",
    label: "Office Holidays",
    icon: <MdBlindsClosed className="w-4 h-4" />,
    component: <OfficeHolidaysComponent />,
  },
];

const getPaginationTotal = (response) => {
  if (typeof response?.pagination?.total === "number") {
    return response.pagination.total;
  }
  if (typeof response?.data?.pagination?.total === "number") {
    return response.data.pagination.total;
  }
  if (Array.isArray(response?.data?.data)) return response.data.data.length;
  if (Array.isArray(response?.data)) return response.data.length;
  if (Array.isArray(response)) return response.length;
  return 0;
};

const HrSettingsComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab = TAB_CONFIG.some((t) => t.key === tabParam)
    ? tabParam
    : TAB_CONFIG[0].key;

  const setupOfficeParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const setupCountParams = useMemo(() => ({ page: 1, limit: 1 }), []);
  const setupWeekendParams = useMemo(() => ({ page: 1, limit: 1000 }), []);

  // Lightweight setup queries only (avoid mounting full useHrQueryApi here)
  const { data: officesResponse } = useQuery({
    queryKey: ["office", setupOfficeParams],
    queryFn: () => fetchOffice(setupOfficeParams),
    keepPreviousData: true,
  });
  const { data: weekendsResponse } = useQuery({
    queryKey: ["weekends", setupWeekendParams],
    queryFn: () => fetchWeekend(setupWeekendParams),
    keepPreviousData: true,
  });
  const { data: departmentsResponse } = useQuery({
    queryKey: ["departments", setupCountParams],
    queryFn: () => fetchDepartments(setupCountParams),
    keepPreviousData: true,
  });
  const { data: designationsResponse } = useQuery({
    queryKey: ["designations", setupCountParams],
    queryFn: () => fetchDesignations(setupCountParams),
    keepPreviousData: true,
  });
  const { data: holidaysResponse } = useQuery({
    queryKey: ["office_holiday", setupCountParams],
    queryFn: () => fetchOfficeHoliday(setupCountParams),
    keepPreviousData: true,
  });

  const offices = useMemo(
    () => officesResponse?.data || [],
    [officesResponse],
  );
  const weekends = useMemo(
    () => weekendsResponse?.data || [],
    [weekendsResponse],
  );
  const departmentsTotal = getPaginationTotal(departmentsResponse);
  const designationsTotal = getPaginationTotal(designationsResponse);
  const holidaysTotal = getPaginationTotal(holidaysResponse);

  const handleTabChange = (tabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="my-6">
      <SetupGuideBanner
        showCompany
        dismissKey="hr-settings-company-setup-tip"
      />
      <HrSetupProgress
        offices={offices}
        weekends={weekends}
        departmentsTotal={departmentsTotal}
        designationsTotal={designationsTotal}
        holidaysTotal={holidaysTotal}
      />

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center divide-x divide-gray-400 border-b pb-2.5 text-xs font-bold text-gray-500">
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

export default HrSettingsComponent;
