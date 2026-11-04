"use client";

import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useMemo } from "react";
import { LeaveEventCalender } from "./LeaveEventCalender";

const toLocalDay = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
};

const employeeName = (item) => {
  const user = item?.employee?.user;
  return (
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Employee"
  );
};

const LeaveCalendarTab = () => {
  const { allHolidayListWithoutPaginationQuery, useAllLeaveRequestQuery } =
    useHrQueryApi();

  const { data: holidayData, isLoading: holidaysLoading } =
    allHolidayListWithoutPaginationQuery();
  const { data: leaveResponse, isLoading: leavesLoading } =
    useAllLeaveRequestQuery({ page: 1, limit: 500, statusId: 52 });

  const calendarEvents = useMemo(() => {
    const events = [];

    (holidayData?.data || []).forEach((holiday) => {
      if (!holiday?.holidayDates?.length) return;
      const start = toLocalDay(holiday.holidayDates[0]);
      const end = toLocalDay(
        holiday.holidayDates[holiday.holidayDates.length - 1],
      );
      if (!start || !end) return;

      events.push({
        id: `holiday-${holiday.id}`,
        title: holiday.holidayName,
        start,
        end,
        allDay: true,
        color: "#dc2626",
        type: "holiday",
        rawData: holiday,
      });
    });

    const payload = leaveResponse?.data;
    const leaveRows = Array.isArray(payload) ? payload : payload?.list || [];

    leaveRows.forEach((leave) => {
      const statusCode = leave?.approvalStatus?.code;
      const statusId = leave?.approvalStatusId;
      const approved =
        statusCode === "leave_request_approval_approved" || statusId === 52;
      if (!approved) return;

      const start = toLocalDay(leave.startDate);
      const end = toLocalDay(leave.endDate);
      if (!start || !end) return;

      const name = employeeName(leave);
      const typeName = leave?.empLeaveType?.name || "Leave";

      events.push({
        id: `leave-${leave.id}`,
        title: `${name} · ${typeName}`,
        start,
        end,
        allDay: true,
        color: "#0f766e",
        type: "leave",
        rawData: {
          employeeName: name,
          typeName,
          statusName: "Approved",
          description: leave.reason || "",
          designation: leave?.employee?.designation?.name || "",
        },
      });
    });

    return events;
  }, [holidayData, leaveResponse]);

  return (
    <div className="col-span-1 lg:col-span-9">
      <div className="flex sm:flex-row sm:items-center sm:justify-between flex-col gap-4 p-1">
        <p className="text-gray-700 dark:text-theme-light-text whitespace-nowrap">
          Leave Calendar
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            Holiday
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
            Approved leave
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <LeaveEventCalender
          events={calendarEvents}
          initialView="month"
          className="border-0"
        />
        {(holidaysLoading || leavesLoading) && calendarEvents.length === 0 && (
          <p className="px-4 py-3 text-sm text-gray-500">Loading calendar...</p>
        )}
      </div>
    </div>
  );
};

export default LeaveCalendarTab;
