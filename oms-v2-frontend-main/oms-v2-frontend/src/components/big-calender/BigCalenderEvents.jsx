"use client";

import { useState, useEffect } from "react";
import { EventCalendar } from "./event-calendar";

// Event type mapping
const eventConfig = {
  "Govt Holiday": { color: "red", description: "Government holiday" },
  "Office Holiday": { color: "orange", description: "Office holiday" },
  Leave: { color: "blue", description: "Employee leave" },
  Birthday: { color: "green", description: "Employee birthday" },
};

export default function BigCalenderEvents({ events: apiEvents, isLoading }) {
  const [events, setEvents] = useState([]);

  // Transform API events to calendar format
  const transformEvents = (eventData) => {
    try {
      const transformedEvents = [];

      // Holiday events
      eventData?.holidayEvents?.forEach((event) => {
        const config = eventConfig[event.typeName] || {
          color: "gray",
          description: event.typeName,
        };
        transformedEvents.push({
          id: `holiday-${event.id}-${event.date}`,
          title: event.name,
          description: config.description,
          start: new Date(event.date),
          end: new Date(event.date),
          allDay: true,
          color: config.color,
          type: "holiday",
          rawData: event,
        });
      });

      // Leave events
      eventData?.leaveEvents?.forEach((event) => {
        transformedEvents.push({
          id: `leave-${event.title}-${event.startDate}`,
          title: event.title,
          description: event.description,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          allDay: true,
          color: "blue",
          type: "leave",
          rawData: event,
        });
      });

      // Birthday events
      eventData?.birthdayEvents?.forEach((event) => {
        const currentYear = new Date().getFullYear();
        const birthdayDate = new Date(currentYear, event.month - 1, event.day);
        transformedEvents.push({
          id: `birthday-${event.title}-${event.birthday}`,
          title: event.title,
          description: "Birthday celebration",
          start: birthdayDate,
          end: birthdayDate,
          allDay: true,
          color: "green",
          type: "birthday",
          rawData: event,
        });
      });

      return transformedEvents;
    } catch (error) {
      console.error("Error transforming events:", error);
      return [];
    }
  };

  // Update events when API data changes
  useEffect(() => {
    if (apiEvents?.data) {
      const transformed = transformEvents(apiEvents.data);
      setEvents(transformed);
    }
  }, [apiEvents]);

  const handleEventAdd = (event) => {
    setEvents((prev) => [...prev, event]);
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const handleEventDelete = (eventId) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  // Empty state
  if (!events || events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Event Calendar
        </h2>
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            No events scheduled
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            There are no upcoming events, holidays, or birthdays.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Event Calendar
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {events.length} upcoming events
        </p>
      </div>

      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}