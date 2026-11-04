// "use client";

// import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
// import React, { useMemo } from "react";
// import DashboardCalendar from "./calendar-time-schedules-section/dashboard-calendar/DashboardCalendar";
// import DashboardTaskTimeSchedules from "./calendar-time-schedules-section/dashboard-task-tab/DashboardTaskTimeSchedules";
// import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

// const CalendarTimeSchedulesSection = () => {
//   const { useDashboardPendingTaskListQuery } = useTasksQueryApi({});
//   const { data: responseData, isLoading: isTaskLoading } =
//     useDashboardPendingTaskListQuery();
//   const { useFetchDashboardCalendarQuery } = useHrQueryApi({});

//   const { data: calendarData, isLoading: isCalendarLoading } =
//     useFetchDashboardCalendarQuery();
//   // Directly use the dataArray as it comes from API
//   const dataArray = useMemo(
//     () => responseData?.data || [],
//     [responseData?.data]
//   );

//   console.log("calendarData data:", calendarData);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//       {/* Left side calendar - taking 4 columns */}
//       <div className="lg:col-span-8">
//         <DashboardCalendar />
//       </div>

//       {/* Right side schedules - taking 8 columns */}
//       <div className="lg:col-span-4">
//         <DashboardTaskTimeSchedules
//           dataArray={dataArray}
//           isLoading={isTaskLoading}
//         />
//       </div>
//     </div>
//   );
// };

// export default CalendarTimeSchedulesSection;

"use client";

import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
import React, { useMemo } from "react";
import DashboardCalendar from "./calendar-time-schedules-section/dashboard-calendar/DashboardCalendar";
import DashboardTaskTimeSchedules from "./calendar-time-schedules-section/dashboard-task-tab/DashboardTaskTimeSchedules";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

const CalendarTimeSchedulesSection = ({ hasPermission }) => {
  const { useDashboardPendingTaskListQuery } = useTasksQueryApi({});
  const { data: taskData, isLoading: isTaskLoading } =
    useDashboardPendingTaskListQuery();

  const { useFetchDashboardCalendarQuery } = useHrQueryApi({});
  const { data: calendarData, isLoading: isCalendarLoading } =
    useFetchDashboardCalendarQuery();

  // Transform task data
  const taskArray = useMemo(() => taskData?.data || [], [taskData?.data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left side - Calendar (8 columns) */}
      {hasPermission("dashboard.calendar_overview") && (
        <div className="lg:col-span-8">
          <DashboardCalendar
            calendarData={calendarData}
            isLoading={isCalendarLoading}
          />
        </div>
      )}

      {/* Right side - Task Schedules (4 columns) */}
      {hasPermission("dashboard.timeline_&_schedules") && (
        <div className="lg:col-span-4">
          <DashboardTaskTimeSchedules
            dataArray={taskArray}
            isLoading={isTaskLoading}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarTimeSchedulesSection;
