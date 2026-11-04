"use client";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useParams } from "next/navigation";
import LeftSideEmployeeProfileDetails from "./components/LeftSideEmployeeProfileDetails";
import EmployeeDetailsAllTab from "./tabs/EmployeeDetailsAllTab";


export default function EmployeeDetails() {
  const { id } = useParams();
  const { useFetchEmployeeProfileDashboardDataQuery } = useHrQueryApi({});
  // const { useEmployeeDetailsQuery } = useEmployeeProfileQueryApi({});
  const { data: responseData, isLoading: dashboardLoading } =
    useFetchEmployeeProfileDashboardDataQuery(id);
  // const { data: detailsResponse, isLoading: detailsIsLoading } = useEmployeeDetailsQuery(id);

  // console.log('detailsResponse ====', detailsResponse)

  const employeeDashboardData = responseData?.data || {};
  // const employeeDetails = detailsResponse?.data || {};
  const employeeDetails = {};

  const isLoading = dashboardLoading;
  // const isLoading = dashboardLoading || detailsIsLoading;

  return (
    <div className="">
      <div className="flex flex-col gap-6 py-6 lg:flex-row min-h-screen">
        {/* Left Sidebar - Sticky */}
        <div className="w-full lg:w-80 xl:w-96  lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto leftside-scrollbar  ">
          {" "}
          <LeftSideEmployeeProfileDetails
            employeeData={employeeDashboardData}
            employeeDetails={employeeDetails}
            isLoading={isLoading}
          />
        </div>
        {/* Main Content - Scrollable */}
        <main className="flex-1 w-full min-w-0 dark:bg-theme-dark bg-theme-light lg:overflow-y-auto lg:h-screen sidebar-scroll rounded-md p-4 ">
          <EmployeeDetailsAllTab
            isLoading={isLoading}
            employeeDetails={employeeDetails}
            id={id}
          />
        </main>
      </div>
    </div>
  );
}
