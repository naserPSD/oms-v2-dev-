import { Card, CardContent } from "@/components/ui/card";

export function EmployeeDashboardOverview({ employeeOverView, isLoading }) {
  // Metrics API data দিয়ে create করা
  const metrics = [
    {
      label: "Total Work Hours",
      value: employeeOverView.totalWorkHours || "0",
      change: "+0h",
      icon: "⏱️",
      description: "All time",
    },
    {
      label: "Assets Assigned",
      value: employeeOverView.totalAssets || "0",
      change: "Assigned",
      icon: "💻",
      description: "Company assets",
    },
    {
      label: "Leave Remaining",
      value: employeeOverView.totalLeaveRemaining || "0",
      change: "Days left",
      icon: "🏖️",
      description: "Available leaves",
    },
    {
      label: "Client Visits",
      value: employeeOverView.totalClientVisit || "0",
      change: "Visits",
      icon: "📍",
      description: "Total visits",
    },
  ];

  // Enhanced Loading Skeleton with Shimmer
  const SkeletonCard = () => (
    <div className="text-center p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto mb-1"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto mb-2"></div>
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
        <CardContent className="p-4 sm:p-6">
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4 animate-pulse"></div>

          {/* Metrics Grid Skeleton */}
          <div
            className="grid gap-3 sm:gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            }}
          >
            {[1, 2, 3, 4].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
      <CardContent className="">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 dark-title-color">
          Employee Overview
        </h2>

        <div
          className="grid gap-3 sm:gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-3 sm:p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02] min-w-0 flex flex-col h-full"
            >
              <div className="text-2xl mb-2 flex justify-center">
                {metric.icon}
              </div>

              <div className="text-lg sm:text-xl font-bold dark-title-color mb-1 truncate">
                {metric.value}
              </div>

              <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 line-clamp-2 flex-1">
                {metric.label}
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                {metric.description}
              </div>

              <div className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full line-clamp-1">
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// import { Card, CardContent } from "@/components/ui/card";

// export function EmployeeDashboardOverview({ employeeOverView, isLoading }) {
//   const metrics = [
//     // Row 1: Core HR Metrics
//     {
//       label: "Total Present",
//       value: "15",
//       change: "+2",
//       icon: "📊",
//       description: "This month",
//     },
//     {
//       label: "Leaves Balance",
//       value: "14",
//       change: "5 annual left",
//       icon: "🏖️",
//       description: "of 28 days",
//     },
//     {
//       label: "Late Marks",
//       value: "3",
//       change: "-1",
//       icon: "⏰",
//       description: "This month",
//     },
//     {
//       label: "Work Hours",
//       value: "168",
//       change: "+12h",
//       icon: "⏱️",
//       description: "This month",
//     },

//     // Row 2: Work Metrics
//     {
//       label: "Active Projects",
//       value: "5",
//       change: "2 completed",
//       icon: "📁",
//       description: "In progress",
//     },
//     {
//       label: "Tasks Done",
//       value: "42",
//       change: "+8",
//       icon: "✅",
//       description: "This month",
//     },
//     {
//       label: "Pending Reviews",
//       value: "3",
//       change: "1 urgent",
//       icon: "📝",
//       description: "Awaiting",
//     },
//     {
//       label: "Team Rating",
//       value: "4.2/5",
//       change: "+0.3",
//       icon: "⭐",
//       description: "Performance",
//     },

//     // Row 3: Additional Metrics
//     {
//       label: "Client Visits",
//       value: "0",
//       change: "No visits",
//       icon: "📍",
//       description: "This month",
//     },
//     {
//       label: "Assets",
//       value: "0",
//       change: "Assigned",
//       icon: "💻",
//       description: "Company assets",
//     },
//     {
//       label: "Training Hours",
//       value: "12",
//       change: "+4h",
//       icon: "🎓",
//       description: "This quarter",
//     },
//     {
//       label: "Team Size",
//       value: "8",
//       change: "2 new",
//       icon: "👥",
//       description: "Department",
//     },
//   ];

//   return (
//     <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full">
//       <CardContent className="">
//         <h2 className="text-lg font-semibold mb-4 dark-title-color">
//           Employee Overview
//         </h2>

//         {/* CSS Grid auto-fit for maximum flexibility */}
//         <div
//           className="grid gap-3 sm:gap-4"
//           style={{
//             gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
//           }}
//         >
//           {metrics.map((metric, index) => (
//             <div
//               key={index}
//               className="text-center p-3 sm:p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02] min-w-0 flex flex-col h-full"
//             >
//               {/* Icon */}
//               <div className="text-2xl mb-2 flex justify-center">
//                 {metric.icon}
//               </div>

//               {/* Value */}
//               <div className="text-lg sm:text-xl font-bold dark-title-color mb-1 truncate">
//                 {metric.value}
//               </div>

//               {/* Label */}
//               <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 line-clamp-2 flex-1">
//                 {metric.label}
//               </div>

//               {/* Description */}
//               <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
//                 {metric.description}
//               </div>

//               {/* Change Indicator */}
//               <div className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full line-clamp-1">
//                 {metric.change}
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
