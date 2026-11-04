import helpers from "@/utils/helpers";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { useMemo } from "react";
import { differenceInCalendarDays, parseISO, startOfToday } from "date-fns";

export const useOfficeHolidaysTableColumns = ({
  handleEdit,
  handleDelete,
  hasPermission,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 60,
        cell: ({ row }) => (
          <div className="text-center text-gray-600 dark:text-gray-400">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "holidayName",
        header: "Holiday Details",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold dark-title-color text-base">
                  {item.holidayName}
                </p>
                {item.holidayDates?.length > 1 && (
                  <span className={`badge badge-pill badge-outline-success`}>
                    {item.holidayDates.length} days
                  </span>
                )}
              </div>
              {/* <div className="flex flex-wrap gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.isOfficial
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {item.isOfficial ? "🏛️ Official" : "👥 Regular"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.isRecurring
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.isRecurring ? "🔄 Recurring" : "📅 One-time"}
                </span>
              </div> */}
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "holidayDates",
        header: "Dates",
        cell: ({ row }) => {
          const holidayDates = row.original.holidayDates;

          if (!holidayDates || holidayDates.length === 0) {
            return (
              <div className="text-gray-400 italic text-sm">No dates set</div>
            );
          }

          if (holidayDates.length === 1) {
            return (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  <span className="font-semibold dark-title-color">
                    {helpers.dDate(holidayDates[0])}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(holidayDates[0]).toLocaleDateString("en-BD", {
                    weekday: "long",
                  })}
                </p>
              </div>
            );
          }

          // Multiple dates
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" />
                <div>
                  <p className="font-semibold dark-title-color text-sm">
                    {helpers.dDate(holidayDates[0])} -{" "}
                    {helpers.dDate(holidayDates[holidayDates.length - 1])}
                  </p>
                  <p className="text-xs text-gray-500">
                    {holidayDates.length} days total
                  </p>
                </div>
              </div>

              {/* Dates list with scroll */}
              <div className="max-h-20 overflow-y-auto space-y-1 border-l-2 border-gray-200 pl-2">
                {holidayDates.map((date, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {helpers.dDate(date)}
                    </span>
                    <span className="text-gray-500">
                      {new Date(date).toLocaleDateString("en-BD", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "holidayType",
        header: "Type",
        cell: ({ row }) => {
          const holidayType = row.original.holidayType;
          const typeColors = {
            "Govt Holiday": "border-red-200 bg-red-50 text-red-700",
            "Office Holiday": "border-blue-200 bg-blue-50 text-blue-700",
            "National Holiday": "border-green-200 bg-green-50 text-green-700",
            default: "border-gray-200 bg-gray-50 text-gray-700",
          };

          const colorClass =
            typeColors[holidayType?.name] || typeColors.default;

          return (
            <span
              className={`badge badge-pill badge-outline-${holidayType?.colorName || "secondary"}`}
            >
              {holidayType?.name || "Holiday"}
            </span>
          );
        },
        size: 130,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const holidayDates = row.original.holidayDates;

          if (!holidayDates || holidayDates.length === 0) {
            return (
              <span className="badge badge-pill badge-outline-secondary">
                No Dates
              </span>
            );
          }

          const firstDate = parseISO(holidayDates[0]);
          const lastDate = parseISO(holidayDates[holidayDates.length - 1]);
          const today = startOfToday();
          const daysUntil = differenceInCalendarDays(firstDate, today);
          const daysSinceEnd = differenceInCalendarDays(lastDate, today);

          let status = "Upcoming";
          let color = "success";

          if (daysSinceEnd < 0) {
            status = "Completed";
            color = "secondary";
          } else if (daysUntil <= 0 && daysSinceEnd >= 0) {
            status = "Ongoing";
            color = "warning";
          } else if (daysUntil === 0) {
            status = "Today";
            color = "warning";
          } else {
            status = `In ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
            color = "success";
          }

          return (
            <span className={`badge badge-pill badge-outline-${color}`}>
              {status}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-xs text-gray-500">
            {helpers.dDate(row.original.createdAt)}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        size: 100,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="action  ">
              {hasPermission("hr.office_holidays_edit") && (
                <button
                  onClick={() => handleEdit(item)}
                  className=" text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.office_holidays_delete") && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className=" text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete],
  );
};
