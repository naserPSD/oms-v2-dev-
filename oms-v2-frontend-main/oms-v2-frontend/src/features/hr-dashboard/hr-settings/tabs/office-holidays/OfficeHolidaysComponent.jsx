"use client";
// 1️⃣ ======================= IMPORTS =======================
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useForm } from "react-hook-form";
import { BiCalendar, BiCard, BiPlus, BiTable } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import AddOrUpdateOfficeHolidaysModal from "./components/AddOrUpdateOfficeHolidaysModal";
import { OfficeHolidayCard } from "./components/OfficeHolidayCard";
import { useOfficeHolidaysTableColumns } from "./hooks/useOfficeHolidaysTableColumns";
import { format, isValid, parseISO } from "date-fns";
import { useOfficeHolidayFilters } from "./hooks/useOfficeHolidayFilters";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const initialValues = {
  id: 0,
  holidayTypeId: 0,
  holidayName: "",
  dayCount: 1,
  isRecurring: false,
  isOfficial: true,
  startDate: "",
  endDate: "",
  holidayDates: [],
};

// 3️⃣ ======================= COMPONENT =======================

const OfficeHolidaysComponent = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const localizer = momentLocalizer(moment);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  const schema = z.object({
    id: z.coerce.number().optional(),
    holidayTypeId: z.coerce.number().min(1, "Holiday Type is required"),
    holidayName: z.string().min(1, "Holiday Name is required"),
    dayCount: z.coerce.number().int().min(1, "Day Count is required"),
    isRecurring: z.boolean().optional().default(false),
    isOfficial: z.boolean().optional().default(true),
    startDate: z.string().min(1, "Start date is required"),
    // startDate: z
    //   .string()
    //   .min(1, "Start date is required")
    //   .refine((val) => {
    //     const today = getTodayDate();
    //     const selectedDate = parseISO(val);
    //     return !isBefore(selectedDate, today);
    //   }, "Start date cannot be in the past"),
    endDate: z.string().min(1, "End date is required"),
    holidayDates: z.array(z.string()).min(1, "At least one holiday date is required"),
  }).superRefine((values, context) => {
    const start = parseISO(values.startDate);
    if (!isValid(start)) return;

    const datesAreValidAndOrdered = values.holidayDates.every((date, index) => {
      const parsedDate = parseISO(date);
      return (
        isValid(parsedDate) &&
        format(parsedDate, "yyyy-MM-dd") === date &&
        (!index || values.holidayDates[index - 1] < date)
      );
    });

    if (values.holidayDates.length !== values.dayCount || !datesAreValidAndOrdered) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayCount"],
        message: "Day count must match the number of ordered, unique holiday dates",
      });
    }

    if (
      values.holidayDates[0] !== values.startDate ||
      values.holidayDates[values.holidayDates.length - 1] !== values.endDate
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayCount"],
        message: "Start and end dates must match the first and last holiday dates",
      });
    }
  });
  // ⚡ Form
  const {
    // register,
    // formState: { errors },
    setValue,
    handleSubmit,
    control,
    watch,
    getValues,
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });
  const startDate = watch("startDate");

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    useOfficeHolidayQuery,
    addOrUpdateOfficeHolidayMutation,
    deleteOfficeHolidayMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // API hooks
  const { useOfficeListQuery, useDesignationListQuery } = useCommonQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();

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
  } = useOfficeHolidayFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useOfficeHolidayQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  // 🧠 Build filter config
  const employeeInvitationStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_invitation_statuses")
      ?.statuses ?? [];
  const employeeStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_statuses")
      ?.statuses ?? [];

  const holidayTypeList =
    dropdowns.statusGroupList?.find((s) => s.code === "holiday_types")
      ?.statuses ?? [];

  const filterConfig = [
    {
      component: "select",
      name: "holidayTypeId",
      label: "Select Holiday Type",
      options: holidayTypeList || [],
      placeholder: "Filter by Holiday Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search by Holiday Name...",
    },
    {
      component: "number",
      name: "holidayYear",
      label: "Holiday Year",
      placeholder: "Search by Year...(YYYY)",
    },
    {
      component: "datePicker",
      mode: "range",
      name: "holidayDates",
      label: "Select Holiday Date",
      options: designationList || [],
      placeholder: "Filter by Holiday Date Range",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Create handler
  const submitForm = async (values) => {
    console.log("Form values being submitted:", values);
    await addOrUpdateOfficeHolidayMutation.mutateAsync(values);
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      item.startDate = item.holidayDates[0] || "";
      item.endDate =
        item.holidayDates && item.holidayDates.length > 0
          ? item.holidayDates[item.holidayDates.length - 1]
          : "";

      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  // 🧹 Delete handler
  const handleDelete = useCallback(
    async (id) => {
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
          await deleteOfficeHolidayMutation.mutateAsync(id);
        }
      });
    },
    [deleteOfficeHolidayMutation],
  );

  const calendarEvents = useMemo(() => {
    const events = [];

    dataArray.forEach((holiday) => {
      if (holiday.holidayDates && Array.isArray(holiday.holidayDates)) {
        holiday.holidayDates.forEach((dateString, index) => {
          const [year, month, day] = dateString.split("-");
          const startDate = new Date(year, month - 1, day);
          const endDate = new Date(year, month - 1, day);

          events.push({
            id: `${holiday.id}-${index}`, // Unique ID for each date
            title: `${holiday.holidayName} ${holiday.isOfficial ? "🏛️" : ""}`,
            start: startDate,
            end: endDate,
            allDay: true,
            resource: holiday,
            isMultiDay: holiday.holidayDates.length > 1,
            dateIndex: index,
            totalDates: holiday.holidayDates.length,
          });
        });
      }
    });

    // console.log("Generated calendar events:", events);
    return events;
  }, [dataArray]);
  // Handle event click properly
  const handleEventClick = useCallback(
    (event) => {
      console.log("Calendar event clicked:", event);
      handleEdit(event.resource);
    },
    [handleEdit],
  );

  // Calendar event style - improved version
  const eventStyleGetter = (event) => {
    console.log("Styling event:", event);

    let backgroundColor = "#28a745"; // Default green
    let textColor = "white";

    if (event.resource?.isOfficial) {
      backgroundColor = "#dc3545"; // Red for official
    } else if (event.resource?.isRecurring) {
      backgroundColor = "#007bff"; // Blue for recurring
    }

    // Multi-day holiday indication
    if (event.isMultiDay) {
      backgroundColor =
        event.dateIndex === 0
          ? "#8B4513"
          : event.dateIndex === event.totalDates - 1
            ? "#FF8C00"
            : backgroundColor; // Brown for start, Orange for end
    }

    return {
      style: {
        backgroundColor,
        color: textColor,
        borderRadius: event.isMultiDay ? "0px" : "5px",
        opacity: 0.9,
        border: "0px",
        padding: "2px 5px",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
      },
    };
  };

  // Unique Months Calculator Function
  const getUniqueHolidayMonths = useCallback(() => {
    const monthMap = new Map();

    calendarEvents.forEach((event) => {
      const date = event.start;
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          monthName,
          holidays: [],
          holidayCount: 0,
          uniqueHolidays: new Set(), // Track unique holiday names
        });
      }

      const monthData = monthMap.get(monthKey);

      // Add only unique holidays (avoid duplicates from multiple dates)
      if (!monthData.uniqueHolidays.has(event.resource.holidayName)) {
        monthData.uniqueHolidays.add(event.resource.holidayName);
        monthData.holidays.push(event);
      }

      monthData.holidayCount++;
    });

    return Array.from(monthMap.values())
      .sort((a, b) => a.date - b.date)
      .slice(0, 6);
  }, [calendarEvents]);

  const CalendarHeader = () => {
    return (
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Office Holidays
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and view all company holidays
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800 dark:text-white">
              {calendarEvents.length} Events
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {calendarDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useOfficeHolidaysTableColumns({
    handleEdit,
    handleDelete,
    hasPermission,
  });

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const isLoading =
    isFetching ||
    addOrUpdateOfficeHolidayMutation.isLoading ||
    deleteOfficeHolidayMutation.isLoading;
  // toggleArchivePersonalNoteMutation.isLoading ||
  // togglePinPersonalNoteMutation.isLoading;
  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Office Holidays</h1>
        <div className="flex gap-2">
          {/* View Toggle Buttons */}
          <SimpleTooltip title="Calendar View" text="Calendar View">
            <ButtonTw
              onClick={() => setViewMode("calendar")}
              variant={viewMode === "calendar" ? "blue" : "alternative"}
              className="gap-2"
            >
              <BiCalendar />
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip title="Card View" text="Card View">
            <ButtonTw
              onClick={() => setViewMode("card")}
              variant={viewMode === "card" ? "blue" : "alternative"}
              className="gap-2"
            >
              <BiCard />
            </ButtonTw>
          </SimpleTooltip>
          <SimpleTooltip title="Table View" text="Table View">
            <ButtonTw
              onClick={() => setViewMode("table")}
              variant={viewMode === "table" ? "blue" : "alternative"}
              className="gap-2"
            >
              <BiTable />
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={() => toggleFilter()}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>

          {hasPermission("hr.office_holidays_add") && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add Holiday
            </ButtonTw>
          )}
        </div>
      </div>
      <AddOrUpdateOfficeHolidaysModal
        holidayTypeList={holidayTypeList}
        showModal={showModal}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        control={control}
        submitForm={submitForm}
        isLoading={addOrUpdateOfficeHolidayMutation.isLoading}
        startDate={startDate}
        getTodayDate={getTodayDate}
        setValue={setValue}
        watch={watch}
        getValues={getValues}
      />
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {viewMode === "calendar" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          {calendarEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
              <BiCalendar size={64} className="mb-4" />
              <h3 className="text-lg font-semibold">No Holidays in Calendar</h3>
              <p>Add holidays to see them here</p>
            </div>
          ) : (
            <>
              {/* Reset/Back to Today Button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Holiday Calendar ({calendarEvents.length} events)
                </h3>
                <div className="flex gap-2">
                  <ButtonTw
                    onClick={() => setCalendarDate(new Date())}
                    variant="blue"
                    size="sm"
                    className="gap-2"
                  >
                    <BiCalendar />
                    Today
                  </ButtonTw>
                </div>
              </div>

              <>
                {/* Calendar Container - Fixed height */}
                <div className="rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CalendarHeader />
                  <div style={{ height: 600 }}>
                    <Calendar
                      key={calendarDate.getTime()}
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      style={{
                        height: 600, // Fixed height
                        minHeight: 600, // Minimum height
                      }}
                      onSelectEvent={handleEventClick}
                      eventPropGetter={eventStyleGetter}
                      popup
                      views={["month"]}
                      defaultView="month"
                      date={calendarDate}
                      onNavigate={(newDate) => {
                        console.log("Calendar navigating to:", newDate);
                        setCalendarDate(newDate);
                      }}
                      toolbar={true}
                      selectable={true}
                      messages={{
                        next: "Next",
                        previous: "Previous",
                        today: "Today",
                        month: "Month",
                        noEventsInRange: "No holidays in this period",
                      }}
                      className="h-full" // Full height within container
                    />
                  </div>
                </div>
              </>

              {/* Enhanced Legend */}
              {/* <div className="flex justify-center gap-4 mt-4 text-sm text-gray-700 dark:text-gray-300 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Official Holiday</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Regular Holiday</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Recurring Holiday</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-brown-500 rounded"></div>
                  <span>Multi-day Start</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>Multi-day End</span>
                </div>
              </div> */}
            </>
          )}

          {/* 🔥 INTERACTIVE NAVIGATION CARDS */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-blue-800 dark:text-blue-300">
                Quick Navigation
              </h4>
              <div className="flex gap-2">
                <span className="text-sm bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {calendarEvents.length} events loaded
                </span>
                <button
                  onClick={() => setCalendarDate(new Date())}
                  className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Holiday Months Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getUniqueHolidayMonths().map((monthInfo, index) => (
                <div
                  key={index}
                  onClick={() => {
                    console.log("Navigating to:", monthInfo.date);
                    setCalendarDate(monthInfo.date);
                  }}
                  className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {monthInfo.monthName}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {monthInfo.holidayCount} holiday
                        {monthInfo.holidayCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span className="text-blue-500 dark:text-blue-400 text-sm font-medium">
                      View →
                    </span>
                  </div>

                  {/* Holiday Names */}
                  <div className="mt-2">
                    {monthInfo.holidays.slice(0, 2).map((holiday, idx) => (
                      <div
                        key={idx}
                        className="text-xs dark-ti bg-gray-50 dark:bg-gray-600 px-2 py-1 rounded mb-1"
                      >
                        {holiday.title}
                      </div>
                    ))}
                    {monthInfo.holidays.length > 2 && (
                      <div className="text-xs title-color">
                        + {monthInfo.holidays.length - 2} more...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* All Events Summary */}
            <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Recent Holidays:</strong>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {calendarEvents.slice(0, 5).map((event, index) => (
                  <span
                    key={index}
                    onClick={() => {
                      console.log("Navigating to event date:", event.start);
                      setCalendarDate(event.start);
                    }}
                    className="inline-flex items-center gap-1 bg-white dark:bg-gray-600 px-2 py-1 rounded border border-gray-300 dark:border-gray-500 text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                  >
                    <span className="dark-title-color">{event.title}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      ({event.start.toLocaleDateString()})
                    </span>
                  </span>
                ))}
                {calendarEvents.length > 5 && (
                  <span className="text-xs title-color self-center">
                    + {calendarEvents.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Current Date & Reset Section */}
            <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center">
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <strong>Current View:</strong>{" "}
                  {calendarDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <button
                  onClick={() => setCalendarDate(new Date())}
                  className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  ↺ Reset to Today
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Card View */}
      {viewMode === "card" && (
        <>
          <OfficeHolidayCard
            listData={listData}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
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
      {/* Table View */}
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
    </div>
  );
};

export default OfficeHolidaysComponent;
