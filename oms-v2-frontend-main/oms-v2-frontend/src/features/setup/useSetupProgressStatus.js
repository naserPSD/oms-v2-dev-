"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useAuthStore } from "@/store/useAuthStore";
import { getCompanySetupStatus } from "@/features/company-settings/components/CompanySetupProgress";
import { getHrSetupStatus } from "@/features/hr-dashboard/hr-settings/components/HrSetupProgress";
import {
  fetchOffice,
  fetchWeekend,
  fetchOfficeHoliday,
} from "@/services/hrServiceApi";
import {
  fetchCompanyInfo,
  fetchDepartments,
  fetchDesignations,
  fetchServices,
} from "@/services/companySettingsApi";

export const COMPANY_STEP_LABELS = {
  logo: "upload your company logo",
  basic: "complete basic company information",
  services: "add products or services (optional)",
  office: "finish office setup in HR Settings",
};

export const HR_STEP_LABELS = {
  shifts: "configure office shifts / working hours",
  weekends: "set weekend days",
  departments: "add at least one department",
  designations: "add at least one designation",
  holidays: "add holidays (optional)",
};

export const HR_STEP_TABS = {
  shifts: "office",
  weekends: "office",
  departments: "departments",
  designations: "designations",
  holidays: "office-holidays",
};

export const getPaginationTotal = (response) => {
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

export const firstIncompleteKey = (status, keys, optionalSkipped = {}) =>
  keys.find((key) => !status[key] && !optionalSkipped[key]) || null;

export const hrSettingsHref = (nextHrStep) =>
  nextHrStep
    ? `/hr-dashboard/settings?page=1&limit=10&tab=${HR_STEP_TABS[nextHrStep] || "office"}`
    : "/hr-dashboard/settings?page=1&limit=10";

export const useSetupProgressStatus = ({
  fetchCompany = true,
  fetchHr = true,
} = {}) => {
  const { hasPermission } = useCommonFunctions();
  const user = useAuthStore((state) => state.user);

  const canCompany = hasPermission("company-settings");
  const canHr = hasPermission("hr.settings");
  const initialSetupDone = Boolean(user?.appUseCase);

  const servicesSkipped = useMemo(() => {
    try {
      return sessionStorage.getItem("company-setup-services-skipped") === "1";
    } catch {
      return false;
    }
  }, []);

  const loadCompany = Boolean(fetchCompany && canCompany);
  const loadHr = Boolean(fetchHr && canHr);

  const { data: companyResponse, isLoading: companyLoading } = useQuery({
    queryKey: ["company-Info"],
    queryFn: () => fetchCompanyInfo(),
    enabled: loadCompany,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: servicesResponse, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", { page: 1, limit: 1 }],
    queryFn: () => fetchServices({ page: 1, limit: 1 }),
    enabled: loadCompany,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const officeCountParams = useMemo(() => ({ page: 1, limit: 1 }), []);
  const officeListParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const weekendParams = useMemo(() => ({ page: 1, limit: 1000 }), []);
  const countParams = useMemo(() => ({ page: 1, limit: 1 }), []);

  const { data: officeCountResponse, isLoading: officeCountLoading } = useQuery({
    queryKey: ["office", officeCountParams],
    queryFn: () => fetchOffice(officeCountParams),
    enabled: loadCompany,
    keepPreviousData: true,
  });

  const { data: officesResponse, isLoading: officesLoading } = useQuery({
    queryKey: ["office", officeListParams],
    queryFn: () => fetchOffice(officeListParams),
    enabled: loadHr,
    keepPreviousData: true,
  });

  const { data: weekendsResponse, isLoading: weekendsLoading } = useQuery({
    queryKey: ["weekends", weekendParams],
    queryFn: () => fetchWeekend(weekendParams),
    enabled: loadHr,
    keepPreviousData: true,
  });

  const { data: departmentsResponse, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments", countParams],
    queryFn: () => fetchDepartments(countParams),
    enabled: loadHr,
    keepPreviousData: true,
  });

  const { data: designationsResponse, isLoading: designationsLoading } = useQuery({
    queryKey: ["designations", countParams],
    queryFn: () => fetchDesignations(countParams),
    enabled: loadHr,
    keepPreviousData: true,
  });

  const { data: holidaysResponse, isLoading: holidaysLoading } = useQuery({
    queryKey: ["office_holiday", countParams],
    queryFn: () => fetchOfficeHoliday(countParams),
    enabled: loadHr,
    keepPreviousData: true,
  });

  const company = useMemo(() => {
    const raw =
      companyResponse?.data?.data ||
      companyResponse?.data ||
      companyResponse;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
    if (Array.isArray(raw) && raw.length > 0) return raw[0];
    return raw || {};
  }, [companyResponse]);

  const servicesCount = useMemo(() => {
    if (typeof servicesResponse?.pagination?.total === "number") {
      return servicesResponse.pagination.total;
    }
    if (Array.isArray(servicesResponse?.data)) {
      return servicesResponse.data.length;
    }
    return 0;
  }, [servicesResponse]);

  const hasOffice = useMemo(() => {
    const total = officeCountResponse?.pagination?.total;
    if (typeof total === "number") return total > 0;
    if (Array.isArray(officeCountResponse?.data)) {
      return officeCountResponse.data.length > 0;
    }
    if (Array.isArray(officesResponse?.data)) {
      return officesResponse.data.length > 0;
    }
    return false;
  }, [officeCountResponse, officesResponse]);

  const companyStatus = useMemo(
    () => getCompanySetupStatus(company, servicesCount, hasOffice),
    [company, servicesCount, hasOffice],
  );

  const companyCompleted = {
    ...companyStatus,
    services: companyStatus.services || servicesSkipped,
  };

  const companyRequiredComplete = Boolean(
    companyCompleted.logo && companyCompleted.basic,
  );
  const companySetupComplete = Boolean(
    companyRequiredComplete &&
      companyCompleted.office &&
      companyCompleted.services,
  );

  const nextCompanyStep = firstIncompleteKey(companyCompleted, [
    "logo",
    "basic",
    "services",
    "office",
  ]);

  const hrStatus = useMemo(
    () =>
      getHrSetupStatus({
        offices: officesResponse?.data || [],
        weekends: weekendsResponse?.data || [],
        departmentsTotal: getPaginationTotal(departmentsResponse),
        designationsTotal: getPaginationTotal(designationsResponse),
        holidaysTotal: getPaginationTotal(holidaysResponse),
      }),
    [
      officesResponse,
      weekendsResponse,
      departmentsResponse,
      designationsResponse,
      holidaysResponse,
    ],
  );

  const hrRequiredComplete = Boolean(
    hrStatus.shifts &&
      hrStatus.weekends &&
      hrStatus.departments &&
      hrStatus.designations,
  );

  const nextHrStep = firstIncompleteKey(hrStatus, [
    "shifts",
    "weekends",
    "departments",
    "designations",
    "holidays",
  ]);

  const isCompanyLoading = Boolean(
    loadCompany &&
      (companyLoading || servicesLoading || officeCountLoading)
  );
  const isHrLoading = Boolean(
    loadHr &&
      (officesLoading ||
        weekendsLoading ||
        departmentsLoading ||
        designationsLoading ||
        holidaysLoading)
  );
  const isLoading = isCompanyLoading || isHrLoading;

  return {
    initialSetupDone,
    canCompany,
    canHr,
    isLoading,
    company,
    companyCompleted,
    companyRequiredComplete,
    companySetupComplete,
    companyIncomplete: Boolean(
      canCompany &&
        (!companyCompleted.logo ||
          !companyCompleted.basic ||
          !companyCompleted.office),
    ),
    nextCompanyStep,
    hrStatus,
    hrRequiredComplete,
    hrIncomplete: Boolean(canHr && !hrRequiredComplete),
    nextHrStep,
    servicesSkipped,
  };
};
