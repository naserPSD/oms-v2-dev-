"use client";

import AccountsRequisitionsCrmMainDashboardSection from "./AccountsRequisitionsCrmMainDashboardSection";
import AttendanceStatistics from "./AttendanceStatistics";
import CalendarTimeSchedulesSection from "./CalendarTimeSchedulesSection";
import CheckInCheckoutSection from "@/features/main-dashboard/CheckInCheckoutSection";
import SetupIncompleteBanner from "@/features/main-dashboard/SetupIncompleteBanner";
import DashboardSkeleton from "./DashboardSkeleton";
import { useSetupIncompleteStatus } from "./useSetupIncompleteStatus";
import { useDashboardQueryApi } from "@/hooks/queryApi/useDashboardQueryApi";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const MainDashboard = () => {
  const { hasPermission } = useCommonFunctions();

  const {
    useFetchDashboardAttendanceStatisticsQuery,
    useFetchCRMDashboardStatsQuery,
    useFetchAccountsDashboardStatsQuery,
    useMyAttendanceQuery,
  } = useDashboardQueryApi({});

  const {
    data: responseData,
    isLoading: isAttendanceLoading,
    isFetching,
  } = useFetchDashboardAttendanceStatisticsQuery();

  const {
    data: crmResponseData,
    isLoading: isCrmLoading,
  } = useFetchCRMDashboardStatsQuery();

  const {
    data: accountsResponseData,
    isLoading: isAccountsLoading,
  } = useFetchAccountsDashboardStatsQuery();

  const canCheckInOut = hasPermission("dashboard.check_in_and_check_out");
  const { isLoading: isMyAttendanceLoading } = useMyAttendanceQuery();

  const setupStatus = useSetupIncompleteStatus();
  const { isChecking: isSetupChecking } = setupStatus;

  // Show comprehensive loading skeleton first until all primary API responses are retrieved
  const isInitialLoading =
    isAttendanceLoading ||
    isCrmLoading ||
    isAccountsLoading ||
    (canCheckInOut && isMyAttendanceLoading) ||
    isSetupChecking;

  if (isInitialLoading) {
    return <DashboardSkeleton hasPermission={hasPermission} />;
  }

  const requisitionData =
    responseData?.data?.data?.requisitions ||
    responseData?.data?.requisitions ||
    {};
  const attendanceStatistics =
    responseData?.data?.data?.attendanceStatistics ||
    responseData?.data?.attendanceStatistics ||
    {};
  const accountsData =
    accountsResponseData?.data?.data || accountsResponseData?.data || {};

  const crmStats = crmResponseData?.data?.data || crmResponseData?.data || {};
  const crmData = {
    totalContacts: crmStats.totalContacts || crmStats.totalLeads || 0,
    totalLeads: crmStats.totalLeads || crmStats.totalContacts || 0,
    newLeads: {
      total: crmStats.newLeads?.total || crmStats.currentMonthLeads || 0,
      percentage:
        crmStats.newLeads?.percentage ||
        (crmStats.trend === "down" ? -1 : 1) * (crmStats.percentageChange || 0),
    },
    newClients: {
      total:
        crmStats.newClients?.total ?? crmStats.wonDeals ?? crmStats.newClientsLastMonth ?? crmStats.newClientsLast24Hours ?? 0,
      percentage: crmStats.newClients?.percentage || 0,
    },
  };

  return (
    <div className="container mx-auto my-4 space-y-4">
      <SetupIncompleteBanner status={setupStatus} />

      {canCheckInOut && <CheckInCheckoutSection />}

      {hasPermission("dashboard.attendance_statistics") && (
        <AttendanceStatistics
          attendanceStatistics={attendanceStatistics}
          loading={isFetching}
        />
      )}

      <AccountsRequisitionsCrmMainDashboardSection
        requisitionData={requisitionData}
        crmData={crmData}
        accountsData={accountsData}
        loading={isFetching}
        hasPermission={hasPermission}
      />
      <CalendarTimeSchedulesSection hasPermission={hasPermission} />
    </div>
  );
};

export default MainDashboard;
