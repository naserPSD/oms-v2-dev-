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
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import SimpleTooltip from "@/components/ui/SimpleTooltip";

// Hooks & Utilities
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import helpers from "@/utils/helpers";
import {
  Calendar,
  MapPin,
  List,
  Calendar as CalendarIcon,
  Table,
  Clock,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { CardHeader } from "react-bootstrap";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import EventAddOrUpdateModal from "./modal/EventAddOrUpdateModal";
import { EventCalendar } from "@/components/big-calender/event-calendar";
import Pagination from "@/components/common/Pagination";

// Table & Filter hooks
import { useEventsFilters } from "./hooks/useEventsFilters";
import { useEventsTableColumn } from "./hooks/useEventsTableColumn";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import EventVewDetailsModal from "./modal/EventVewDetailsModal";
import {
  transformEventsForCalendar,
  transformEventsForList,
} from "@/utils/eventsTransformData";
import Swal from "sweetalert2";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

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

const Eventss = () => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const { hasPermission } = useCommonFunctions();
  // State management
  const [showModal, setShowModal] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [vewDetailsModal, setViewDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table", "list", "calendar"

  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);

  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // 🧠 ---------- FILTERS ----------
  const {
    filters,
    globalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
    setGlobalFilter,
  } = useEventsFilters(itemsPerPage);

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
  const handleCloseModal = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
    setEventId(null);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    useFetchEvents,
    useSingleEventQuery,
    addOrUpdateEventMutation,
    deleteEventMutation,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose: handleCloseModal,
    setShowModal,
  });

  const { useDepartmentListQuery } = useCommonQueryApi({});

  // Data fetching with filters
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = useFetchEvents(queryParams);

  // Fetch single event when selected
  const { data: singleEventData } = useSingleEventQuery(eventId, {
    enabled: !!eventId,
  });

  const { data: departmentList = [] } = useDepartmentListQuery();

  // Get today's date for validation
  const getTodayDate = () => {
    return new Date();
  };

  // 🧠 ---------- FILTER CONFIG ----------
  const eventTypeList = useMemo(
    () =>
      dropdowns.statusGroupList
        ?.find((s) => s.code === "event_types")
        ?.statuses?.map((type) => ({
          value: type.id,
          label: type.name,
        })) || [],
    [dropdowns],
  );

  const eventStatusList = useMemo(
    () =>
      dropdowns.statusGroupList
        ?.find((s) => s.code === "event_statuses")
        ?.statuses?.map((status) => ({
          value: status.id,
          label: status.name,
        })) || [],
    [dropdowns],
  );

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Event Title, Description...",
    },
    {
      component: "select",
      name: "eventTypeId",
      label: "Event Type",
      options: eventTypeList,
      placeholder: "Filter by Event Type",
      className: "col-span-12 lg:col-span-3",
    },
    {
      component: "select",
      name: "departmentId",
      label: "Department",
      options: departmentList,
      placeholder: "Filter by Department",
      className: "col-span-12 lg:col-span-3",
    },
    {
      component: "select",
      name: "statusId",
      label: "Status",
      options: eventStatusList,
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3",
    },
    {
      component: "select",
      name: "isAllDay",
      label: "Event Duration",
      options: [
        { value: "true", label: "All Day" },
        { value: "false", label: "Specific Time" },
      ],
      placeholder: "Filter by Duration",
      className: "col-span-12 lg:col-span-3",
    },
    {
      component: "clear",
    },
  ];

  const handleAddEvent = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  const handleEditEvent = useCallback(
    (event) => {
      reset({
        id: event.id,
        title: event.title,
        description: event.description,
        eventTypeId: event.eventTypeId,
        location: event.location,
        startDatetime: event.startDatetime,
        endDatetime: event.endDatetime,
        isAllDay: event.isAllDay,
      });
      setShowModal(true);
    },
    [reset],
  );

  // Handle view details - fetch event by ID
  const handleViewDetails = useCallback((event) => {
    setEventId(event.id);
    setViewDetailsModal(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setEventId(null);
    setViewDetailsModal(false);
  }, []);

  // 🧹 Delete handler
  const handleDelete = useCallback(
    async (id) => {
      console.log(id, "dId");
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteEventMutation.mutateAsync(id);
        }
      });
    },
    [deleteEventMutation],
  );

  // Form submission
  const submitEventForm = async (values) => {
    try {
      await addOrUpdateEventMutation.mutateAsync(values);
      refetchEvents();
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // Data transformation
  const events = useMemo(() => eventsData?.data || [], [eventsData?.data]);
  const pagination = eventsData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };

  const { total } = pagination;

  // 🧠 ---------- TABLE DATA ----------
  const listData = useMemo(() => {
    return events.map((item, index) => ({
      ...item,
      sl: index + 1, // Simplified serial number
    }));
  }, [events]);

  // 🧠 ---------- PAGINATED TABLE DATA ----------
  const paginatedTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return listData.slice(startIndex, endIndex);
  }, [listData, currentPage, itemsPerPage]);

  // 🧠 ---------- TABLE CONFIG ----------
  const columns = useEventsTableColumn({
    handleEdit: handleEditEvent,
    handleDelete,
    handleViewDetails,
    hasPermission,
  });

  // Create table instance with PAGINATED data
  const table = useReactTable({
    data: paginatedTableData, // Use paginated data instead of all data
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // 🧠 ---------- LIST VIEW DATA ----------
  const listViewEvents = useMemo(
    () => transformEventsForList(events),
    [events],
  );

  // Pagination for list view - slice based on current itemsPerPage
  const paginatedListEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return listViewEvents.slice(startIndex, endIndex);
  }, [listViewEvents, currentPage, itemsPerPage]);

  console.log(paginatedListEvents);
  // 🧠 ---------- CALENDAR VIEW DATA ----------
  const calendarViewEvents = useMemo(
    () => transformEventsForCalendar(events),
    [events],
  );

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

  const isLoading = isLoadingEvents || addOrUpdateEventMutation.isLoading;

  return (
    <div className="">
      <div className="flex items-center justify-between flex-wrap my-5">
        <div className="mb-1">
          <h1 className="text-2xl font-bold dark-title-color">All Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all company events
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {pagination.total} events
          </div>
        </div>
        <div className="flex flex-wrap overflow-hidden gap-2">
          {/* View Mode Toggle */}
          <div className="overflow-x-auto  bg-gray-100 dark:bg-gray-700  rounded-lg">
            <div className="flex ">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Table className="h-4 w-4" />
                Table
              </button>
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
          </div>

          {/* Filter Toggle */}
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
          {hasPermission("hr.events_add") && (
            <ButtonTw
              onClick={handleAddEvent}
              variant="blue"
              size="sm"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
        </div>
      </div>

      {/* Filter Section */}
      {showFilter === "show" && (
        <DataFilter
          showFilter={showFilter === "show"}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          filterConfig={filterConfig}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Table View (Default) */}
      {viewMode === "table" && (
        <>
          <CommonTable
            table={table}
            isFetching={isLoading}
            itemsPerPage={itemsPerPage}
            columns={columns}
            hasActiveFilters={hasActiveFilters}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              {paginatedListEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 mb-2 text-lg">
                    No events found
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more results."
                      : "There are no events scheduled at the moment."}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:gap-3">
                  {paginatedListEvents.map((event, index) => (
                    <div
                      key={event.id || index}
                      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer"
                      onClick={() => handleViewDetails(event)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Date & Time Section */}
                        <div className="flex items-center gap-4 lg:w-1/4">
                          {/* Calendar Icon */}
                          <div className="flex-shrink-0 w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                            <CalendarIcon className="h-5 w-5 mb-1" />
                            <span className="text-xs font-bold">
                              {event.startDate.split(" ")[0]}
                            </span>
                            <span className="text-xs">
                              {event.startDate.split(" ")[1]}
                            </span>
                          </div>

                          {/* Time Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-sm font-semibold dark-title-color">
                              <Clock className="h-4 w-4 text-blue-500" />
                              {event.startTime}
                            </div>
                            {!event.isAllDay && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {event.startTime} - {event.endTime}
                              </div>
                            )}
                            {event.isMultiDay && (
                              <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
                                <Calendar className="h-3 w-3" />
                                Multi-day
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 lg:w-2/4 min-w-0">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <h3 className="font-bold text-lg dark-title-color leading-tight line-clamp-2">
                                {event.event}
                              </h3>
                              {event.isAllDay && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap">
                                  All Day
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              {/* Event Type */}
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="capitalize font-medium">
                                  {event.type}
                                </span>
                              </div>

                              {/* Department */}
                              {event.rawData?.department?.name && (
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                  <span>{event.rawData.department.name}</span>
                                </div>
                              )}

                              {/* Location */}
                              {event.rawData?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[120px]">
                                    {event.rawData.location}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {event.rawData?.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {event.rawData.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center justify-between gap-3 lg:w-1/4">
                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                event.colorClass === "warning"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : event.colorClass === "success"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : event.colorClass === "danger"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  event.colorClass === "warning"
                                    ? "bg-yellow-500"
                                    : event.colorClass === "success"
                                      ? "bg-green-500"
                                      : event.colorClass === "danger"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                }`}
                              ></div>
                              {event.status}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ">
                            {/* View Details Button */}
                            <SimpleTooltip
                              title="View Details"
                              text="View event details"
                            >
                              <ButtonTw
                                variant="outline"
                                size="sm"
                                className="p-0 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(event);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </ButtonTw>
                            </SimpleTooltip>

                            {/* Edit Button */}
                            <SimpleTooltip
                              title="Edit Event"
                              text="Edit this event"
                            >
                              <ButtonTw
                                variant="outline"
                                size="sm"
                                className="p-0 rounded-lg border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event.rawData);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </ButtonTw>
                            </SimpleTooltip>

                            {/* Delete Button */}
                            <SimpleTooltip
                              title="Delete Event"
                              text="Delete this event"
                            >
                              <ButtonTw
                                variant="outline"
                                size="sm"
                                className="p-0 rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(event?.id);
                                }}
                              >
                                <Trash2 size={16} />
                              </ButtonTw>
                            </SimpleTooltip>
                          </div>
                        </div>
                      </div>

                      {/* Multi-day indicator line */}
                      {/* {event.isMultiDay && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-t-xl"></div>
                      )} */}

                      {/* All-day indicator line */}
                      {/* {event.isAllDay && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-t-xl"></div>
                      )} */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination for List View */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={total}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </>
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
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "There are no events scheduled at the moment."}
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
      {vewDetailsModal && (
        <EventVewDetailsModal
          handleViewDetails={handleViewDetails}
          handleCloseDetailsModal={handleCloseDetailsModal}
          singleEventData={singleEventData}
        />
      )}

      {/* Add/Edit Event Modal */}
      <EventAddOrUpdateModal
        showModal={showModal}
        handleClose={handleCloseModal}
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

export default Eventss;
