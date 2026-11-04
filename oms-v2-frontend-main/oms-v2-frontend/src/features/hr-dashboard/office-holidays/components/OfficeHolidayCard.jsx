import helpers from "@/utils/helpers";
import { Pencil, Trash2, Calendar, Clock, MapPin } from "lucide-react";

export const OfficeHolidayCard = ({ listData, handleDelete, handleEdit }) => {
  console.log("Holiday Cards Data:", listData);

  // Function to get status color and text
  const getStatusInfo = (holiday) => {
    if (!holiday.holidayDates || holiday.holidayDates.length === 0) {
      return {
        color: "gray",
        text: "No Dates",
        bgColor: "bg-gray-100 text-gray-600",
      };
    }

    const firstDate =
      holiday.holidayDates && new Date(holiday.holidayDates?.[0] || "");
    const lastDate =
      holiday.holidayDates &&
      new Date(holiday.holidayDates[holiday.holidayDates.length - 1]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastDate < today) {
      return {
        color: "gray",
        text: "Completed",
        bgColor: "bg-gray-100 text-gray-600",
      };
    } else if (firstDate <= today && lastDate >= today) {
      return {
        color: "orange",
        text: "Ongoing",
        bgColor: "bg-orange-100 text-orange-600",
      };
    } else if (firstDate.toDateString() === today.toDateString()) {
      return {
        color: "yellow",
        text: "Today",
        bgColor: "bg-yellow-100 text-yellow-600",
      };
    } else {
      const daysUntil = Math.ceil((firstDate - today) / (1000 * 60 * 60 * 24));
      return {
        color: "green",
        text: `In ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
        bgColor: "bg-green-100  text-green-600",
      };
    }
  };

  // Function to get holiday type color
  const getTypeColor = (holidayType) => {
    const colors = {
      "Govt Holiday": "border-red-200 bg-red-50 text-red-700",
      "Office Holiday": "border-blue-200 bg-blue-50 text-blue-700",
      "National Holiday": "border-green-200 bg-green-50 text-green-700",
      default: "border-gray-200 bg-gray-50 text-gray-700",
    };
    return colors[holidayType?.name] || colors.default;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
      {listData.map((holiday, index) => {
        const statusInfo = getStatusInfo(holiday);
        const typeColor = getTypeColor(holiday.holidayType);

        return (
          <div
            key={holiday.id || index}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
          >
            {/* Header with Gradient Background */}
            <div
              className={`rounded-t-2xl p-4 ${
                holiday.isOfficial
                  ? "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-700 dark:to-red-900"
                  : "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-900"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
                  {holiday.holidayName}
                </h3>
                {holiday.holidayDates?.length > 1 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {holiday.holidayDates.length} days
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    holiday.isOfficial
                      ? "bg-white/20 text-white"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {holiday.isOfficial ? "🏛️ Official" : "👥 Regular"}
                </span>
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {holiday.isRecurring ? "🔄 Recurring" : "📅 One-time"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 mb-10">
              {/* Holiday Type */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${typeColor}`}
                >
                  <MapPin size={12} />
                  {holiday.holidayType?.name || "Holiday"}
                </span>
              </div>

              {/* Dates Information */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Calendar
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {holiday.holidayDates?.length === 1
                        ? helpers.dDate(holiday.holidayDates[0])
                        : `${helpers.dDate(
                            holiday.holidayDates[0]
                          )} - ${helpers.dDate(
                            holiday.holidayDates[
                              holiday.holidayDates.length - 1
                            ]
                          )}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {holiday.holidayDates?.length === 1
                        ? new Date(holiday.holidayDates[0]).toLocaleDateString(
                            "en-BD",
                            { weekday: "long" }
                          )
                        : `${holiday.holidayDates.length} days holiday`}
                    </div>
                  </div>
                </div>

                {/* Multiple Dates Preview */}
                {holiday.holidayDates && holiday.holidayDates.length > 1 && (
                  <div className="ml-11">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Dates:
                    </div>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {holiday.holidayDates
                        .slice(0, 3)
                        .map((date, dateIndex) => (
                          <div
                            key={dateIndex}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {helpers.dDate(date)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(date).toLocaleDateString("en-BD", {
                                weekday: "short",
                              })}
                            </span>
                          </div>
                        ))}
                      {holiday.holidayDates.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                          + {holiday.holidayDates.length - 3} more dates
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Actions */}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 absolute bottom-3 left-4 right-4">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.bgColor}`}
              >
                {statusInfo.text}
              </span>

              <div className="flex gap-1  duration-300">
                <button
                  onClick={() => handleEdit(holiday)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  title="Edit Holiday"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(holiday.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                  title="Delete Holiday"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* ID Badge */}
            {/* <div className="absolute top-3 right-3">
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-700/80 px-2 py-1 rounded-full">
                ID: {holiday.id}
              </span>
            </div> */}
          </div>
        );
      })}
    </div>
  );
};
