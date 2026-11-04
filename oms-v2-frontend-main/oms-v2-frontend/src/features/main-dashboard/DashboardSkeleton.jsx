"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = ({ hasPermission = () => true }) => {
  const showCheckInOut = hasPermission("dashboard.check_in_and_check_out");
  const showAttendance = hasPermission("dashboard.attendance_statistics");
  const showAccounts = hasPermission("dashboard.accounts");
  const showRequisitions = hasPermission("dashboard.requisitions");
  const showCrm = hasPermission("dashboard.crm");
  const showCalendar = hasPermission("dashboard.calendar_overview");
  const showTimeline = hasPermission("dashboard.timeline_&_schedules");

  return (
    <div className="container mx-auto my-4 space-y-4 animate-fade-in">
      {/* Check In / Check Out Card Skeleton */}
      {showCheckInOut && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-9 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-4">
            <Card className="border-l-4 border-l-secondaryColor/50 dark:bg-theme-dark bg-theme-light py-4">
              <CardContent className="grid grid-cols-8 px-4">
                <div className="col-span-4 flex flex-col border-r pr-4 space-y-2.5">
                  <Skeleton className="h-7 w-24 rounded" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="col-span-4 flex flex-col pl-4 space-y-2.5">
                  <Skeleton className="h-7 w-24 rounded" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Attendance Statistics Skeleton */}
      {showAttendance && (
        <div className="space-y-3">
          <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6">
            <Skeleton className="h-6 w-44 rounded" />
            <hr className="w-full hidden sm:flex border-gray-200 dark:border-gray-800" />
            <Skeleton className="h-9 w-36 rounded shrink-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-9 gap-4">
            {/* On-Time Check-in */}
            <div className="xl:col-span-2">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Card className="border-l-4 border-l-secondaryColor/50 dark:bg-theme-dark bg-theme-light py-0">
                <CardContent className="px-4 flex items-center justify-between h-12">
                  <Skeleton className="h-7 w-10" />
                  <div className="border-l mx-2 h-7" />
                  <div className="flex items-center -space-x-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Late Check-in */}
            <div className="xl:col-span-2">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Card className="border-l-4 border-l-yellow-500/50 dark:bg-theme-dark bg-theme-light py-0">
                <CardContent className="px-4 flex items-center justify-between h-12">
                  <Skeleton className="h-7 w-10" />
                  <div className="border-l mx-2 h-7" />
                  <div className="flex items-center -space-x-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Early Timing */}
            <div className="xl:col-span-2">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Card className="border-l-4 border-l-green-500/50 dark:bg-theme-dark bg-theme-light py-0">
                <CardContent className="px-4 flex items-center justify-between h-12">
                  <Skeleton className="h-7 w-10" />
                  <div className="border-l mx-2 h-7" />
                  <div className="flex items-center -space-x-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overview */}
            <div className="xl:col-span-3">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Card className="border-l-4 border-l-sky-500/50 dark:bg-theme-dark bg-theme-light py-0">
                <CardContent className="px-4 flex items-center justify-between h-12">
                  <div className="w-full flex items-center justify-between text-center divide-x divide-gray-200 dark:divide-gray-800">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Accounts, Requisitions & CRM Skeleton */}
      {(showAccounts || showRequisitions || showCrm) && (
        <div className="flex flex-wrap gap-3">
          {/* Accounts Section */}
          {showAccounts && (
            <div className="flex-1 min-w-[300px]">
              <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1 mb-1">
                <Skeleton className="h-5 w-24" />
                <hr className="w-full hidden sm:flex border-gray-200 dark:border-gray-800" />
              </div>
              <div className="flex items-center flex-wrap gap-3">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="dark:bg-theme-dark bg-theme-light border rounded-md flex-1 min-w-[130px]"
                  >
                    <div className="flex items-center gap-2 p-2.5 px-4 border-b">
                      <Skeleton className="h-3.5 w-3.5 rounded-full" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3.5 w-12" />
                        <Skeleton className="h-3.5 w-8" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3.5 w-14" />
                        <Skeleton className="h-3.5 w-12" />
                      </div>
                      <Skeleton className="h-7 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requisitions & CRM */}
          <div className="flex-1 flex gap-3 flex-wrap min-w-[300px]">
            {showRequisitions && (
              <div className="flex-1 min-w-[140px]">
                <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1 mb-1">
                  <Skeleton className="h-5 w-24" />
                  <hr className="w-full hidden sm:flex border-gray-200 dark:border-gray-800" />
                </div>
                <div className="dark:bg-theme-dark bg-theme-light border rounded-md p-4 space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            )}

            {showCrm && (
              <div className="flex-1 min-w-[140px]">
                <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1 mb-1">
                  <Skeleton className="h-5 w-16" />
                  <hr className="w-full hidden sm:flex border-gray-200 dark:border-gray-800" />
                </div>
                <div className="dark:bg-theme-dark bg-theme-light border rounded-md p-4 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <hr className="border-gray-200 dark:border-gray-800" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <hr className="border-gray-200 dark:border-gray-800" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar & Time Schedules Skeleton */}
      {(showCalendar || showTimeline) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {showCalendar && (
            <div className={showTimeline ? "lg:col-span-8" : "lg:col-span-12"}>
              <div className="dark:bg-theme-dark bg-theme-light border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-36" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                  </div>
                </div>
                <Skeleton className="h-64 w-full rounded-md" />
              </div>
            </div>
          )}

          {showTimeline && (
            <div className={showCalendar ? "lg:col-span-4" : "lg:col-span-12"}>
              <div className="dark:bg-theme-dark bg-theme-light border rounded-md p-4 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-md" />
                  <Skeleton className="h-14 w-full rounded-md" />
                  <Skeleton className="h-14 w-full rounded-md" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardSkeleton;
