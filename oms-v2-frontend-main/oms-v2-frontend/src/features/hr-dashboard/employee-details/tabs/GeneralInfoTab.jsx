import React from "react";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { QuickStats } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/QuickStats";
import { TeamPerformance } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/TeamPerformance";
import { AttendanceOverview } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/AttendanceOverview";
import { LeaveOverview } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/LeaveOverview";
import { UpcomingEvents } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/UpcomingEvents";
import { RecentActivities } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/RecentActivities";
import BigCalenderEvents from "@/components/big-calender/BigCalenderEvents";
import { Hierarchy } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/Hierarchy";
import { EmployeeDashboardOverview } from "@/features/hr-dashboard/employee-details/tabs/employee-dashbaord-tab/components/EmployeeDashboardOverview";
import { useParams } from "next/navigation";
import { useEmployeeProfileQueryApi } from "@/hooks/queryApi/useEmployeeProfileQueryApi";
import GeneralInfo from "../components/general-info/GeneralInfo";
import { EmployeeRecentActivities } from "./employee-dashbaord-tab/components/EmployeeRecentActivities";

const GeneralInfoTab = () => {
  const { id } = useParams();

  const { useEmployeeDetailsQuery } = useEmployeeProfileQueryApi({});
  const { data: detailsResponse, isLoading: detailsIsLoading } =
    useEmployeeDetailsQuery(id);

  // console.log('detailsResponse ====', detailsResponse)

  const employeeDetails = detailsResponse?.data || {};

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
    <div>
      <GeneralInfo employeeDetails={employeeDetails} id={id} />
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

        <div className="mt-6">
          <EmployeeRecentActivities id={id} />
        </div>

        {/* Calendar Events */}
        <div className="mt-6">
          <BigCalenderEvents events={eventData} isLoading={isFetching} />
        </div>

        {/* Hierarchy */}
        <div className="mt-6">
          <Hierarchy
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
