// List View Data Transformation
export const transformEventsForList = (apiEvents) => {
  if (!apiEvents || !Array.isArray(apiEvents)) return [];

  return apiEvents
    .map((event) => {
      const startDate = new Date(event.startDatetime);
      const endDate = new Date(event.endDatetime);

      const isMultiDay = startDate.toDateString() !== endDate.toDateString();

      // Format dates and times separately
      const formattedStartDate = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const formattedEndDate = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const formattedStartTime = event.isAllDay
        ? "All Day"
        : startDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

      const formattedEndTime = event.isAllDay
        ? "All Day"
        : endDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

      return {
        id: event.id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        event: event.title,
        type: event.eventType?.name || "Event",
        status: event.status?.name || "Upcoming",
        isAllDay: event.isAllDay,
        isMultiDay,
        colorClass: "warning",
        rawData: event,
      };
    })
    .sort(
      (a, b) =>
        new Date(a.rawData.startDatetime) - new Date(b.rawData.startDatetime)
    );
};

// Calendar View Data Transformation
export const transformEventsForCalendar = (apiEvents) => {
  if (!apiEvents || !Array.isArray(apiEvents)) return [];

  const eventTypeColors = {
    Meeting: "blue",
    Training: "purple",
    Holiday: "green",
    Event: "gray",
  };

  return apiEvents.map((event) => {
    const startDate = new Date(event.startDatetime);
    const endDate = new Date(event.endDatetime);

    if (event.isAllDay) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    return {
      id: event.id.toString(),
      title: event.title,
      description: event.description || `${event.eventType?.name} Event`,
      start: startDate,
      end: endDate,
      allDay: event.isAllDay,
      color: eventTypeColors[event.eventType?.name] || "gray",
      type: event.eventType?.name?.toLowerCase() || "event",
      rawData: event,
    };
  });
};
