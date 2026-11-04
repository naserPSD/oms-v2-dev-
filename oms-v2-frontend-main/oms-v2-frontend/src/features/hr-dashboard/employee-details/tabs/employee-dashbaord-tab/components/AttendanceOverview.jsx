import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cls } from "react-image-crop";

export function AttendanceOverview({
  attendanceData = {},
  statusColors = [],
  isLoading,
}) {
  // Backend থেকে আসা status colors array (example)
  const defaultStatusColors = [
    { status: "present", color: "bg-blue-600", label: "Present" },
    { status: "absent", color: "bg-red-500", label: "Absent" },
    { status: "leave", color: "bg-orange-500", label: "Leave" },
    { status: "delay", color: "bg-yellow-500", label: "Delay" },
    { status: "holiday", color: "bg-violet-500", label: "Holiday" },
    { status: "weekend", color: "bg-emerald-500", label: "Weekend" },
  ];

  // Use provided statusColors or default
  const colorConfig =
    statusColors.length > 0 ? statusColors : defaultStatusColors;

  // Create a color map for easy access
  const colorMap = {};
  const labelMap = {};
  colorConfig.forEach((item) => {
    colorMap[item.status] = item.color;
    labelMap[item.status] = item.label;
  });

  // API data with default values
  const data = {};
  colorConfig.forEach((statusItem) => {
    data[statusItem.status] = attendanceData?.[statusItem.status] || 0;
  });

  // Loading Skeleton
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="px-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4 animate-pulse"></div>
          <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg mb-4 text-center animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {colorConfig.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 animate-pulse"
              >
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {colorConfig.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between animate-pulse"
              >
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attendanceData || Object.keys(attendanceData).length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="px-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Attendance Overview - {attendanceData?.title || "N/A"}
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No attendance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="px-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {attendanceData?.title
              ? attendanceData?.title
              : "Attendance Overview"}
          </h2>

          {/* <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 text-center text-gray-700 dark:text-gray-300">
            Calendar Component - October 2025
          </div> */}

          {/* Legend - statusColors array থেকে */}
          <div className="flex flex-wrap gap-2 mb-4">
            {colorConfig.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Color indicator for {item.label} days</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Attendance Chart - attendanceData এবং statusColors combine করে */}
          <div className="space-y-2">
            {colorConfig.map((statusItem) => {
              const count = data[statusItem.status] || 0;
              const percentage = Math.min(100, Math.round((count / 31) * 100));
              const tooltipText = `${statusItem.label}: ${count} days (${percentage}% of month)`;

              return (
                <div
                  key={statusItem.status}
                  className="flex items-center justify-between"
                >
                  <span className="capitalize text-sm text-gray-700 dark:text-gray-300">
                    {statusItem.status}
                  </span>

                  <div className="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2 cursor-help">
                          <div
                            className={`h-2 rounded-full ${statusItem.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div> */}

                        <div className=" bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-44">
                          <div
                            className={`h-2 rounded-full ${statusItem.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tooltipText}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-8 text-center cursor-help">
                          {count}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{count} days</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Working Days:{" "}
                    <span className="font-semibold">31 days</span>
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Based on 31 days in October 2025</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
