import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { format } from "date-fns";
import React, { useMemo } from "react";
import { BirthDayEventCalender } from "./BirthDayEventCalender";

const BirthdayCalendarTab = () => {
  // API hooks
  const { activeEmployeesBirthdayQuery } = useHrQueryApi();
  const { data: calendarData, isLoading: isFetching } =
    activeEmployeesBirthdayQuery();

  const calendarEvents = useMemo(() => {
    if (!calendarData?.data) return [];

    const events = [];

    const currentYear = new Date().getFullYear();
    const startYear = currentYear;
    const endYear = currentYear + 1;

    calendarData?.data?.forEach((employee) => {
      // ❗ যদি dateOfBirth না থাকে তাহলে skip
      if (!employee?.dateOfBirth) return;

      const dob = new Date(employee.dateOfBirth);
      const month = dob.getMonth();
      const day = dob.getDate();

      for (let year = startYear; year <= endYear; year++) {
        const birthdayDate = new Date(year, month, day);

        events.push({
          id: `birthday-${employee.employeeId}-${year}`,
          title: `Birthday Of: ${employee.firstName} ${employee.lastName}`,
          description: "Birthday Celebration",
          start: birthdayDate,
          end: birthdayDate,
          allDay: true,
          color: "#ec4899",
          type: "birthday",
          rawData: {
            birthday: employee.dateOfBirth,
            firstName: employee.firstName,
            lastName: employee.lastName,
          },
          birthYear: dob.getFullYear(),
        });
      }
    });

    return events;
  }, [calendarData]);

  return (
    <div className="col-span-1 lg:col-span-9">
      <div className=" flex sm:flex-row sm:items-center sm:justify-between flex-col gap-4 p-1">
        {" "}
        <p className="text-gray-700 dark:text-theme-light-text whitespace-nowrap">
          Calendar overview
        </p>{" "}
        <hr className="w-full hidden sm:flex" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <BirthDayEventCalender
          events={calendarEvents}
          // onEventAdd={handleEventAdd}
          // onEventUpdate={handleEventUpdate}
          // onEventDelete={handleEventDelete}
          // onEventClick={handleEventClick}
          initialView="month"
          className="border-0"
          eventContent={(eventInfo) => (
            <div className="relative group">
              <div
                className="flex items-center px-1 py-0.5 rounded text-sm truncate cursor-pointer mb-1"
                style={{
                  backgroundColor: `${eventInfo.event.color}20`,
                  borderLeft: `3px solid ${eventInfo.event.color}`,
                }}
                onClick={eventInfo.onClick}
              >
                <span className="truncate">{eventInfo.event.title}</span>
              </div>

              {/* Custom tooltip */}
              <div className="absolute z-50 hidden group-hover:block bg-gray-900 text-white text-sm p-2 rounded shadow-lg -top-12 left-0 min-w-48 whitespace-normal">
                <div className="font-semibold mb-1">
                  {eventInfo.event.title}
                </div>

                {eventInfo.event.type === "birthday" && (
                  <>
                    <div className="text-gray-300">
                      Born:{" "}
                      {format(
                        new Date(eventInfo.event.rawData?.birthday),
                        "MMM d, yyyy",
                      )}
                    </div>
                    <div className="text-gray-300">
                      Age:{" "}
                      {new Date().getFullYear() -
                        new Date(
                          eventInfo.event.rawData?.birthday,
                        ).getFullYear()}{" "}
                      years
                    </div>
                  </>
                )}

                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 absolute bottom-[-4px] left-4"></div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default BirthdayCalendarTab;
