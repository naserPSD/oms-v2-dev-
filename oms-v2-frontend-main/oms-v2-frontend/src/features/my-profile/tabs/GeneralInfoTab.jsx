import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { usePathname } from "next/navigation";
import { QuickStats } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/QuickStats";
import { TeamPerformance } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/TeamPerformance";

import { LeaveOverview } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/LeaveOverview";

import BigCalenderEvents from "@/components/big-calender/BigCalenderEvents";

import { EmployeeDashboardOverview } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/EmployeeDashboardOverview";
import GeneralInfo from "./components/general-info/GeneralInfo";

import AdminHierarchy from "./AdminHierarchy";
import { ProfileUpcommingEvents } from "./ProfileUpcommingEvents";
import { RecentActivities } from "../RecentActivities";
import { ProfileAttendanceOverview } from "./ProfileAttendanceOverview";

const GeneralInfoTab = () => {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const isAdminProfile =
    user?.appUseCase === "Admin" || pathname?.startsWith("/admin/my-profile");

  const {
    useFetchEmployeeDashboardDataWithoutIdQuery,
    useFetchEmployeeEventCalendarWithoutIdQuery,
    useFetchEmployeeHierarchyByEmployeeQuery,
    useFetchEmployeeDashboardUpcomingEventsWithoutId,
  } = useHrQueryApi({});

  const { data: upcomingEvents, isLoading: isLoadingEvents } =
    useFetchEmployeeDashboardUpcomingEventsWithoutId(!isAdminProfile);
  const { data: responseData, isLoading } =
    useFetchEmployeeDashboardDataWithoutIdQuery(!isAdminProfile);
  const { data: eventData, isLoading: isFetching } =
    useFetchEmployeeEventCalendarWithoutIdQuery(!isAdminProfile);

  // console.log(eventData);
  const { data: hierarchyData, isLoading: hierarchyLoading } =
    useFetchEmployeeHierarchyByEmployeeQuery(!isAdminProfile);

  const dashboardData = responseData?.data || {};
  const employeeOverView = dashboardData.employeeOverView || {};
  const attendanceOverview = dashboardData.attendanceOverview || {};
  const leaveOverview = dashboardData.leaveOverview || {};
  const totalLeaveData = dashboardData.total || {};

  return (
    <div>
      <GeneralInfo />
      {!isAdminProfile && (
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
            {/* <div className="grid-item">
              <QuickStats isLoading={isLoading} />
            </div> */}
            {/* <div className="grid-item">
              <TeamPerformance isLoading={isLoading} />
            </div> */}
            <div className="grid-item">
              <ProfileAttendanceOverview
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
              <ProfileUpcommingEvents
                isLoading={isLoadingEvents}
                upcomingEvents={upcomingEvents}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <RecentActivities isLoading={isLoading} />
        </div>

        {/* Calendar Events */}
        <div className="mt-6">
          <BigCalenderEvents events={eventData} isLoading={isFetching} />
        </div>

        {/* Hierarchy */}
        <div className="mt-6 text-2xl">
          <AdminHierarchy
            isLoading={hierarchyLoading}
            hierarchyData={hierarchyData}
          />
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
      )}
    </div>
  );
};

export default GeneralInfoTab;

// <div>
//   <h1 className="text-xl font-bold my-4 md:my-6 dark:text-white">
//     Employee Dashboard
//   </h1>

//   {/* At a Glance Section */}
//   <EmployeeDashboardOverview
//     employeeOverView={employeeOverView}
//     isLoading={isLoading}
//   />

//   {/* Dynamic Grid that adapts to screen size */}
//   <div className="grid-container">
//     <div className="dashboard-grid">
//       <div className="grid-item">
//         <QuickStats isLoading={isLoading} />
//       </div>
//       <div className="grid-item">
//         <TeamPerformance isLoading={isLoading} />
//       </div>
//       <div className="grid-item">
//         <AttendanceOverview
//           attendanceData={attendanceOverview}
//           isLoading={isLoading}
//         />
//       </div>
//       <div className="grid-item">
//         <LeaveOverview
//           leaveData={leaveOverview}
//           totalData={totalLeaveData}
//           isLoading={isLoading}
//         />
//       </div>
//       <div className="grid-item">
//         <UpcomingEvents
//           isLoading={isLoadingEvents}
//           upcomingEvents={upcomingEvents}
//         />
//       </div>
//       <div className="grid-item">
//         <RecentActivities isLoading={isLoading} />
//       </div>
//     </div>
//   </div>

//   {/* Calendar Events */}
//   <div className="mt-6">
//     <BigCalenderEvents events={eventData} isLoading={isFetching} />
//   </div>

//   {/* Hierarchy */}
//   <div className="mt-6">
//     <Hierarchy
//       isLoading={hierarchyLoading}
//       hierarchyData={hierarchyData}
//     />
//   </div>

//   <style jsx>{`
//     .dashboard-grid {
//       display: grid;
//       gap: 1rem;
//       grid-template-columns: repeat(
//         auto-fit,
//         minmax(min(100%, 350px), 1fr)
//       );
//     }

//     @media (min-width: 768px) {
//       .dashboard-grid {
//         grid-template-columns: repeat(
//           auto-fit,
//           minmax(min(100%, 400px), 1fr)
//         );
//       }
//     }

//     @media (min-width: 1024px) {
//       .dashboard-grid {
//         grid-template-columns: repeat(
//           auto-fit,
//           minmax(min(100%, 350px), 1fr)
//         );
//       }
//     }

//     @media (min-width: 1280px) {
//       .dashboard-grid {
//         grid-template-columns: repeat(
//           auto-fit,
//           minmax(min(100%, 400px), 1fr)
//         );
//       }
//     }

//     .grid-item {
//       min-width: 0;
//     }
//   `}</style>
// </div>
