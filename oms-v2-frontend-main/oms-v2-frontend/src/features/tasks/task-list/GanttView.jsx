// GanttView.jsx
"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useState } from "react";

const colors = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-400 text-black",
  purple: "bg-purple-500",
  gray: "bg-gray-400",
};

const getColor = (color) => colors[color] || colors.gray;

export default function GanttView({ tasks }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let day = startDate;

  while (day <= endDate) {
    const days = [];

    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);

      const dayTasks = tasks.filter((task) =>
        isWithinInterval(cloneDay, {
          start: startOfDay(parseISO(task.createdAt)),
          end: endOfDay(parseISO(task.dueDate)),
        }),
      );

      days.push(
        <div
          key={cloneDay.toISOString()}
          className={`border p-2 h-32 rounded
            ${
              !isSameMonth(cloneDay, monthStart)
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                : "bg-white dark:bg-gray-900"
            }
            ${
              isSameDay(cloneDay, new Date())
                ? "border-blue-500"
                : "border-gray-300 dark:border-gray-700"
            }
          `}
        >
          <div className="text-sm font-semibold mb-1">
            {format(cloneDay, "d")}
          </div>

          <div className="space-y-1">
            {dayTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className={`${getColor(
                  task.color,
                )} text-white text-xs rounded px-2 py-0.5 truncate`}
                title={task.name}
              >
                {task.name}
              </div>
            ))}

            {dayTasks.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>,
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div key={day.toISOString()} className="grid grid-cols-7 gap-2">
        {days}
      </div>,
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          Prev
        </button>

        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          Next
        </button>
      </div>

      <div className="flex h-[80vh] overflow-hidden">
        {/* ✅ LEFT: TASK LIST */}
        <div className="w-1/5 border-r border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Task</h2>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <span
                  className={`w-3 h-3 rounded-full ${getColor(task.color)}`}
                />
                <span className="truncate">{task.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ RIGHT: CALENDAR */}
        <div className="w-4/5 p-4 overflow-x-auto overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {/* Week days */}
          <div className="grid grid-cols-7 mb-2 text-center font-semibold text-gray-600 dark:text-gray-300">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="space-y-2 min-w-[900px]">{rows}</div>
        </div>
      </div>
    </div>
  );
}
