import React from "react";
import { EmployeeDashboardOverview } from "./components/EmployeeDashboardOverview";
import { AttendanceOverview } from "./components/AttendanceOverview";
import { LeaveOverview } from "./components/LeaveOverview";
import { Hierarchy } from "./components/Hierarchy";
import BigCalenderEvents from "@/components/big-calender/BigCalenderEvents";
import { QuickStats } from "./components/QuickStats";
import { UpcomingEvents } from "./components/UpcomingEvents";
import { RecentActivities } from "./components/RecentActivities";
import { TeamPerformance } from "./components/TeamPerformance";
import { useParams } from "next/navigation";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

const EmployeeDashboardTab = () => {
  const { id } = useParams();
  const {
    useFetchEmployeeDashboardDataQuery,
    useFetchEmployeeEventCalendarQuery,
    useFetchEmployeeHierarchyByEmployeeIdQuery,
    useFetchEmployeeDashboardUpcomingEvents,
  } = useHrQueryApi({});

  const { data: upcomingEvents, isLoading: isLoadingEvents } =
    useFetchEmployeeDashboardUpcomingEvents(id);
  const { data: responseData, isLoading } =
    useFetchEmployeeDashboardDataQuery(id);
  const { data: eventData, isLoading: isFetching } =
    useFetchEmployeeEventCalendarQuery(id);

  // console.log(eventData);
  const { data: hierarchyData, isLoading: hierarchyLoading } =
    useFetchEmployeeHierarchyByEmployeeIdQuery(id);

  const dashboardData = responseData?.data || {};
  const employeeOverView = dashboardData.employeeOverView || {};
  const attendanceOverview = dashboardData.attendanceOverview || {};
  const leaveOverview = dashboardData.leaveOverview || {};
  const totalLeaveData = dashboardData.total || {};

  return (
    <div className="text-gray-900 dark:text-gray-100 space-y-4 sm:space-y-6">
      <h1 className="text-xl font-bold my-4 md:my-6 dark:text-white">
        Employee Dashboard
      </h1>

      {/* At a Glance Section */}
      <EmployeeDashboardOverview
        employeeOverView={employeeOverView}
        isLoading={isLoading}
      />

      {/* Dynamic Grid that adapts to screen size */}
      <div className="grid-container">
        <div className="dashboard-grid">
          <div className="grid-item">
            <QuickStats isLoading={isLoading} />
          </div>
          <div className="grid-item">
            <TeamPerformance isLoading={isLoading} />
          </div>
          <div className="grid-item">
            <AttendanceOverview
              attendanceData={attendanceOverview}
              isLoading={isLoading}
            />
          </div>
          <div className="grid-item">
            <LeaveOverview
              leaveData={leaveOverview}
              totalData={totalLeaveData}
              isLoading={isLoading}
            />
          </div>
          <div className="grid-item">
            <UpcomingEvents
              isLoading={isLoadingEvents}
              upcomingEvents={upcomingEvents}
            />
          </div>
          <div className="grid-item">
            <RecentActivities isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Calendar Events */}
      <div className="mt-6">
        <BigCalenderEvents events={eventData} isLoading={isFetching} />
      </div>

      {/* Hierarchy */}
      <div className="mt-6">
        <Hierarchy isLoading={hierarchyLoading} hierarchyData={hierarchyData} />
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, 350px), 1fr)
          );
        }

        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: repeat(
              auto-fit,
              minmax(min(100%, 400px), 1fr)
            );
          }
        }

        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: repeat(
              auto-fit,
              minmax(min(100%, 350px), 1fr)
            );
          }
        }

        @media (min-width: 1280px) {
          .dashboard-grid {
            grid-template-columns: repeat(
              auto-fit,
              minmax(min(100%, 400px), 1fr)
            );
          }
        }

        .grid-item {
          min-width: 0;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboardTab;
