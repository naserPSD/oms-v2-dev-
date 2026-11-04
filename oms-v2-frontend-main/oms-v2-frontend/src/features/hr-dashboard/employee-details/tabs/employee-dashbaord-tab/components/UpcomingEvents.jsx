import { ModalTw } from "@/components/common/ModalTw";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import helpers from "@/utils/helpers";
import { Calendar, Code } from "lucide-react";
import { useState } from "react";
import { CardHeader } from "react-bootstrap";

export function UpcomingEvents({ isLoading, upcomingEvents }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };



  // Enhanced event transformer with better date handling
  const transformEvents = (apiEvents) => {
    if (!apiEvents || !Array.isArray(apiEvents)) return [];

    return apiEvents
      .slice(0, 5)
      .map((event) => {
        // Limit to 5 events
        const startDate = new Date(event.startDatetime);
        const endDate = new Date(event.endDatetime);

        // Check if it's multi-day event
        const isMultiDay = startDate.toDateString() !== endDate.toDateString();

        // Format date range
        let formattedDate, formattedTime;

        if (isMultiDay) {
          // Show date range for multi-day events
          const startFormatted = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const endFormatted = endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          formattedDate = `${startFormatted} - ${endFormatted}`;
          formattedTime = "Multi-day";
        } else {
          formattedDate = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          const isAllDay =
            startDate.getHours() === 0 &&
            startDate.getMinutes() === 0 &&
            endDate.getHours() === 23 &&
            endDate.getMinutes() === 59;

          formattedTime = isAllDay
            ? "All Day"
            : `${startDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}`;
        }

        // Use status color from API data

        return {
          id: event.eventId,
          date: formattedDate,
          event: event.title,
          type: event.eventType?.toLowerCase() || "event",
          status: event.statusName || "Upcoming",
          time: formattedTime,
          colorClass: event.colorName,
          isMultiDay,
          rawData: event,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.rawData.startDatetime) - new Date(b.rawData.startDatetime)
      ); // Sort by date
  };

  const events = transformEvents(upcomingEvents?.data);


  

  // Loading and empty states remain the same...
  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8 mb-1"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Upcoming Events
          </h2>
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              No upcoming events
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              There are no scheduled events at the moment.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={event.id || index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => handleViewDetails(event)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-center min-w-16">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {event.date}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {event.event}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>{event.time}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{event.type}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs capitalize  badge badge-pill badge-outline-${
                    event.colorClass || "secondary"
                  } `}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>

          {events.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Showing {events.length} of{" "}
                {upcomingEvents?.data?.length || events.length} events
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <ModalTw
        show={showModal}
        onClose={handleCloseModal}
        title="Event Details"
        size="3xl"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Event Information Section */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Event Information
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Event Title
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {selectedEvent.event}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Event Type
                    </label>
                    <p className="text-foreground font-medium mt-1 capitalize">
                      {selectedEvent.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`text-xs capitalize  badge badge-pill badge-outline-${
                          selectedEvent.colorClass || "secondary"
                        } `}
                      >
                        {selectedEvent.colorClass}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Duration
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {selectedEvent.isMultiDay
                        ? "Multi-day Event"
                        : "Single Day"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Start Date
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {helpers.dDateTime(selectedEvent.rawData.startDatetime)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      End Date
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {helpers.dDateTime(selectedEvent.rawData.endDateTime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Data Section for Debugging */}
            {/* <Card className="border-l-4 border-l-gray-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5 text-gray-500" />
                  Raw Event Data
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="pt-4">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(selectedEvent.rawData, null, 2)}
                </pre>
              </CardContent>
            </Card> */}
          </div>
        )}
      </ModalTw>
    </>
  );
}
