"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import helpers from "@/utils/helpers";
import { ModalTw } from "@/components/common/ModalTw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User } from "lucide-react";
import { EventCalendar } from "@/components/big-calender/event-calendar";

const DashboardCalendar = ({ calendarData, isLoading }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Transform your API data to calendar events (holidays & employee leaves only)
  const calendarEvents = useMemo(() => {
    if (!calendarData?.data) return [];

    const events = [];

    // 1. Holiday events (Govt Holiday & Office Holiday)
    calendarData.data.holidays?.forEach((holiday, index) => {
      events.push({
        id: `holiday-${holiday.id || index}`,
        title: holiday.name,
        description: holiday.typeName || "Holiday",
        start: new Date(holiday.date),
        end: new Date(holiday.date),
        allDay: true,
        color: holiday.code === "govt_holiday" ? "#ef4444" : "#f59e0b",
        type: "holiday",
        rawData: holiday,
      });
    });

    // 2. Employee Leave events (who took leave when)
    calendarData.data.leaves?.forEach((leave, index) => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      // Handle date range for leaves
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        events.push({
          id: `leave-${leave.id || index}-${currentDate.getTime()}`,
          title:
            leave.title ||
            (leave.employeeName
              ? `${leave.employeeName} (${leave.typeName || "Leave"})`
              : leave.typeName || "Leave"),
          description: `${leave.typeName || "Leave"}: ${
            leave.description || ""
          }`,
          start: new Date(currentDate),
          end: new Date(currentDate),
          allDay: true,
          color:
            leave.typeName === "Casual Leave"
              ? "#3b82f6"
              : leave.typeName === "Annual Leave"
              ? "#0ea5e9"
              : leave.typeName === "Sick Leave"
              ? "#ec4899"
              : "#8b5cf6",
          type: "leave",
          rawData: leave,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return events;
  }, [calendarData]);
  // Event handlers
  const handleEventAdd = (event) => {
    console.log("New event to add:", event);

    toast.success("Event created", {
      description: `New event scheduled for ${format(
        event.start,
        "MMM d, yyyy"
      )}`,
    });
  };

  const handleEventUpdate = (updatedEvent) => {
    console.log("Event updated:", updatedEvent);

    toast.info("Event updated", {
      description: `Event moved to ${format(
        updatedEvent.start,
        "MMM d, yyyy"
      )}`,
    });
  };

  const handleEventDelete = (eventId) => {
    console.log("Event deleted:", eventId);

    toast.warning("Event deleted", {
      description: "Event has been removed from calendar",
    });
  };

  const handleEventClick = (event) => {
    console.log("Event clicked:", event);

    if (event.rawData) {
      setSelectedEvent(event.rawData);
      setShowEventModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-9">
      <div className=" flex sm:flex-row sm:items-center sm:justify-between flex-col gap-6 p-1">
        {" "}
        <p className="text-gray-700 dark:text-theme-light-text whitespace-nowrap">
          Calendar overview 
        </p>{" "}
        <hr className="w-full hidden sm:flex" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <EventCalendar
          events={calendarEvents}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          onEventClick={handleEventClick}
          initialView="month"
          className="border-0"
          eventContent={(eventInfo) => (
            <div className="relative group">
              <div
                className="flex items-start px-1 py-0.5 rounded text-[11px] cursor-pointer mb-1 min-h-[24px]"
                style={{
                  backgroundColor: `${eventInfo.event.color}20`,
                  borderLeft: `3px solid ${eventInfo.event.color}`,
                }}
                onClick={eventInfo.onClick}
              >
                <span className="line-clamp-2 break-words leading-tight whitespace-normal">{eventInfo.event.title}</span>
              </div>

              {/* Custom tooltip */}
              <div className="absolute z-50 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded shadow-lg -top-12 left-0 min-w-48 whitespace-normal">
                <div className="font-semibold mb-1">
                  {eventInfo.event.title}
                </div>

                {eventInfo.event.type === "holiday" && (
                  <>
                    <div className="text-gray-300">
                      Type: {eventInfo.event.rawData?.typeName}
                    </div>
                    <div className="text-gray-300">
                      Date: {format(eventInfo.event.start, "MMM d, yyyy")}
                    </div>
                  </>
                )}

                {eventInfo.event.type === "leave" && (
                  <>
                    <div className="text-white font-medium">
                      {eventInfo.event.rawData?.employeeName || eventInfo.event.rawData?.title}
                    </div>
                    {eventInfo.event.rawData?.designation && (
                      <div className="text-gray-400 text-[11px] mb-1">
                        {eventInfo.event.rawData?.designation}
                        {eventInfo.event.rawData?.department ? ` • ${eventInfo.event.rawData?.department}` : ""}
                      </div>
                    )}
                    <div className="text-gray-300">
                      Leave Type: {eventInfo.event.rawData?.typeName}
                    </div>
                    <div className="text-gray-300">
                      Duration:{" "}
                      {format(
                        new Date(eventInfo.event.rawData?.startDate),
                        "MMM d"
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(eventInfo.event.rawData?.endDate),
                        "MMM d, yyyy"
                      )}
                    </div>
                    {eventInfo.event.rawData?.description && (
                      <div className="text-gray-300">
                        Reason: {eventInfo.event.rawData.description}
                      </div>
                    )}
                  </>
                )}

                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 absolute bottom-[-4px] left-4"></div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {calendarData?.data?.holidays?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Official Holidays
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {calendarData?.data?.leaves?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Employee Leaves
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {calendarEvents.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total Leave Days
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Calendar Legend
        </h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Govt Holiday
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Office Holiday
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Casual Leave
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-sky-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Annual Leave
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-pink-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Sick Leave
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Other Leave
            </span>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <ModalTw
          show={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          title={
            selectedEvent.type === "holiday"
              ? "Holiday Details"
              : selectedEvent.type === "leave"
              ? "Leave Details"
              : "Birthday Details"
          }
          size="md"
          dismissible={true}
          showHeader={true}
          showFooter={false}
          type="default"
          position="center"
        >
          <div className="space-y-4">
            {selectedEvent.type === "holiday" && (
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-500" />
                    Holiday Information
                  </CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Holiday Name
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedEvent.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Date
                      </label>
                      <p className="text-foreground font-medium">
                        {helpers.dDate(selectedEvent.date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Type
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedEvent.typeName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedEvent.type === "leave" && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Employee Leave Information
                  </CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Employee
                      </label>
                      <p className="text-foreground font-medium text-base">
                        {selectedEvent.employeeName || selectedEvent.title}
                      </p>
                      {selectedEvent.designation && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedEvent.designation}
                          {selectedEvent.department ? ` • ${selectedEvent.department}` : ""}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Leave Type
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedEvent.typeName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Duration
                      </label>
                      <p className="text-foreground font-medium">
                        {helpers.dDate(selectedEvent.startDate)} -{" "}
                        {helpers.dDate(selectedEvent.endDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Reason
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedEvent.description || "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedEvent.type === "birthday" && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-500" />
                    Birthday Information
                  </CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Person
                      </label>
                      <p className="text-foreground font-medium">
                        {selectedEvent.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </label>
                      <p className="text-foreground font-medium">
                        {helpers.dDate(selectedEvent.birthday)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Birthday (This Year)
                      </label>
                      <p className="text-foreground font-medium">
                        {new Date().getFullYear()}-
                        {String(selectedEvent.month).padStart(2, "0")}-
                        {String(selectedEvent.day).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ModalTw>
      )}
    </div>
  );
};

export default DashboardCalendar;
