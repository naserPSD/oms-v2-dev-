"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import { z } from "zod";

// Components
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Hooks & Utilities
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import { Calendar, MapPin, List, Calendar as CalendarIcon } from "lucide-react";
import { CardHeader } from "react-bootstrap";
import { BiPlus } from "react-icons/bi";
import EventAddOrUpdateModal from "./modal/EventAddOrUpdateModal";
import { EventCalendar } from "@/components/big-calender/event-calendar";
import Pagination from "@/components/common/Pagination";

// Schema definition
const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  eventTypeId: z.coerce.number().min(1, "Event type is required"),
  location: z.string().optional(),
  startDatetime: z.string().min(1, "Start date & time is required"),
  endDatetime: z.string().min(1, "End date & time is required"),
  isAllDay: z.boolean().default(false),
});

// Initial form values
const initialValues = {
  id: 0,
  title: "",
  description: "",
  eventTypeId: "",
  location: "",
  startDatetime: "",
  endDatetime: "",
  isAllDay: false,
};

const Events = () => {
  // State management
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });
  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
    setSelectedEvent(null);
  }, [reset]);
  // API hooks
  const { useFetchEvents, addOrUpdateEventMutation } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // Data fetching
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = useFetchEvents();

  // Get today's date for validation
  const getTodayDate = () => {
    return new Date();
  };

  const handleAddEvent = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  const handleEditEvent = useCallback(
    (event) => {
      reset({
        id: event.rawData.id,
        title: event.rawData.title,
        description: event.rawData.description,
        eventTypeId: event.rawData.eventTypeId,
        location: event.rawData.location,
        startDatetime: event.rawData.startDatetime,
        endDatetime: event.rawData.endDatetime,
        isAllDay: event.rawData.isAllDay,
      });
      setShowModal(true);
    },
    [reset]
  );

  const handleViewDetails = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // Form submission
  const submitEventForm = async (values) => {
    console.log(values, "values");
    await addOrUpdateEventMutation.mutateAsync(values);
  };

  // Data transformation
  const events = eventsData?.data || [];

  const transformEventsForList = useCallback((apiEvents) => {
    if (!apiEvents || !Array.isArray(apiEvents)) return [];

    return apiEvents
      .map((event) => {
        const startDate = new Date(event.startDatetime);
        const endDate = new Date(event.endDatetime);

        const isMultiDay = startDate.toDateString() !== endDate.toDateString();

        let formattedDate, formattedTime;

        if (isMultiDay) {
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

          formattedTime = event.isAllDay
            ? "All Day"
            : `${startDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}`;
        }

        return {
          id: event.id,
          date: formattedDate,
          event: event.title,
          type: event.eventType?.name || "Event",
          status: event.status?.name || "Upcoming",
          time: formattedTime,
          colorClass: "warning",
          isMultiDay,
          rawData: event,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.rawData.startDatetime) - new Date(b.rawData.startDatetime)
      );
  }, []);

  const transformEventsForCalendar = useCallback((apiEvents) => {
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
  }, []);

  const listViewEvents = useMemo(
    () => transformEventsForList(events),
    [events, transformEventsForList]
  );
  const calendarViewEvents = useMemo(
    () => transformEventsForCalendar(events),
    [events, transformEventsForCalendar]
  );

  // Pagination
  const paginatedEvents = useMemo(() => {
    return listViewEvents.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [listViewEvents, currentPage, itemsPerPage]);

  // Calendar event handlers
  const handleEventAdd = useCallback((event) => {
    console.log("Event added:", event);
  }, []);

  const handleEventUpdate = useCallback((updatedEvent) => {
    console.log("Event updated:", updatedEvent);
  }, []);

  const handleEventDelete = useCallback((eventId) => {
    console.log("Event deleted:", eventId);
  }, []);

  if (isLoadingEvents) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark-title-color">All Events</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
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
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="text-2xl font-bold dark-title-color">All Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all company events
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {events.length} events
          </div>
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </button>
          </div>

          <ButtonTw onClick={handleAddEvent} variant="blue" className="gap-2">
            <BiPlus /> Add New
          </ButtonTw>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            {paginatedEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  No events found
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  There are no events scheduled at the moment.
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedEvents.map((event, index) => (
                    <div
                      key={event.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleViewDetails(event)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-center min-w-16">
                          <div className="text-sm font-bold dark-title-color">
                            {event.date}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium dark-title-color truncate">
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
                        className={`text-xs capitalize badge badge-pill badge-outline-${
                          event.colorClass || "secondary"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={
                      eventsData?.pagination?.total || listViewEvents.length
                    }
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            {calendarViewEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  No events found
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  There are no events scheduled at the moment.
                </div>
              </div>
            ) : (
              <EventCalendar
                events={calendarViewEvents}
                onEventAdd={handleEventAdd}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <ModalTw
          show={!!selectedEvent}
          onClose={handleCloseDetailsModal}
          title="Event Details"
          size="3xl"
          dismissible={true}
          showHeader={true}
          showFooter={false}
          type="default"
          position="center"
        >
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
                        className={`text-xs capitalize badge badge-pill badge-outline-${
                          selectedEvent.colorClass || "secondary"
                        }`}
                      >
                        {selectedEvent.status}
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
                      {helpers.dDateTime(selectedEvent.rawData.endDatetime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Event Details */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Additional Details
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Location
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {selectedEvent.rawData.location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Department
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {selectedEvent.rawData.department?.name ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      All Day Event
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {selectedEvent.rawData.isAllDay ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {helpers.dDateTime(selectedEvent.rawData.createdAt)}
                    </p>
                  </div>
                </div>

                {selectedEvent.rawData.description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {selectedEvent.rawData.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ModalTw>
      )}

      {/* Add/Edit Event Modal */}
      <EventAddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={addOrUpdateEventMutation.isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitEventForm}
        control={control}
        watch={watch}
        getTodayDate={getTodayDate}
        errors={errors}
      />
    </div>
  );
};

export default Events;
