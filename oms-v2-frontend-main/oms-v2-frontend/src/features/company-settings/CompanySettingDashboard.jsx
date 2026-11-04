// src/app/(user-dashboard)/company-setting/CompanySettingDashboard.jsx
"use client";

import React, { Suspense, useMemo } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CompanyBasicInformation from "@/features/company-settings/components/CompanyBasicInformation";

import ServiceListComponent from "@/features/company-settings/components/ServiceListComponent";
import CompanyLogo from "./components/CompanyLogo";
import CompanySetupProgress from "./components/CompanySetupProgress";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import CompanySettingsSkeleton from "./components/CompanySettingsSkeleton";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { fetchOffice } from "@/services/hrServiceApi";
import { useSetupProgressStatus } from "@/features/setup/useSetupProgressStatus";

const CompanySettingDashboard = () => {
  const { useGetCompanyInfoQuery, servicesQuery } = useCompanySettingsQueryApi(
    {},
  );
  const { hasPermission } = useCommonFunctions();
  const { data: responseData, isLoading: isCompanyLoading } =
    useGetCompanyInfoQuery();

  const { data: servicesResponse, isLoading: isServicesLoading } =
    servicesQuery({
      page: 1,
      limit: 1,
    });

  const { hrRequiredComplete, isLoading: isHrLoading } = useSetupProgressStatus({
    fetchCompany: false,
    fetchHr: true,
  });

  const officeParams = useMemo(() => ({ page: 1, limit: 1 }), []);
  const { data: officesResponse, isLoading: isOfficeLoading } = useQuery({
    queryKey: ["office", officeParams],
    queryFn: () => fetchOffice(officeParams),
    keepPreviousData: true,
  });

  // Show loading skeleton first until all primary API responses are retrieved
  const isPageLoading =
    isCompanyLoading || isServicesLoading || isOfficeLoading || isHrLoading;

  if (isPageLoading) {
    return <CompanySettingsSkeleton />;
  }

  const dataArray =
    responseData?.data?.data || responseData?.data || responseData || {};
  const company =
    Array.isArray(dataArray) && dataArray.length > 0 ? dataArray[0] : dataArray;

  const servicesCount = (() => {
    const payload = servicesResponse || {};
    if (typeof payload?.pagination?.total === "number") {
      return payload.pagination.total;
    }
    if (Array.isArray(payload?.data)) return payload.data.length;
    return 0;
  })();

  const hasOffice = (() => {
    const total = officesResponse?.pagination?.total;
    if (typeof total === "number") return total > 0;
    if (Array.isArray(officesResponse?.data)) {
      return officesResponse.data.length > 0;
    }
    return false;
  })();

  return (
    <div className="my-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold title-color">Company Settings</h2>
        <Link
          href="/settings/company-user-list"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Users className="h-4 w-4" />
          Company Users
        </Link>
      </div>

      <CompanySetupProgress
        company={company}
        servicesCount={servicesCount}
        hasOffice={hasOffice}
        hrRequiredComplete={hrRequiredComplete}
      />

      {/* Company logo and basic information */}
      <div className="flex gap-5 items-start flex-wrap">
        <CompanyLogo dataArray={company} hasPermission={hasPermission} />
        <CompanyBasicInformation
          company={company}
          hasPermission={hasPermission}
        />
      </div>

      {/* Service List */}
      <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading services...</div>}>
        <ServiceListComponent hasPermission={hasPermission} />
      </Suspense>
    </div>
  );
};

export default CompanySettingDashboard;
