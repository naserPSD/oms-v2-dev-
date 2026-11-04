"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { isSameDay } from "../data/mockMeetings";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function startOfMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  // Monday-first: JS getDay() Sun=0 → shift
  const day = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - day);
  return start;
}

export default function MeetingMiniCalendar({ meetingDates = [], onSelectDay }) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const start = startOfMonthGrid(year, month);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [year, month]);

  const monthLabel = cursor.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const hasMeeting = (d) =>
    meetingDates.some((iso) => isSameDay(iso, d));

  const today = new Date();

  return (
    <div className="admin-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-semibold admin-text">Calendar</h3>
        <span className="text-sm font-medium text-primaryColor dark:text-primaryColor-400">
          {monthLabel}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
        {WEEKDAYS.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="text-[11px] font-semibold admin-text-subtle py-1"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center flex-1">
        {cells.map((d) => {
          const inMonth = d.getMonth() === month;
          const isToday = isSameDay(d.toISOString(), today);
          const marked = hasMeeting(d);

          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelectDay?.(d)}
              className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors
                ${inMonth ? "admin-text" : "text-gray-300 dark:text-gray-600"}
                ${isToday ? "bg-primaryColor text-white font-semibold" : "hover:bg-primaryColor/10"}
              `}
            >
              {d.getDate()}
              {marked && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primaryColor" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg text-primaryColor dark:text-primaryColor-400 hover:bg-primaryColor/10"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-lg text-primaryColor dark:text-primaryColor-400 hover:bg-primaryColor/10"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
