"use client";

import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaCalendarAlt,
  FaFilter,
  FaFileExcel,
  FaPrint,
} from "react-icons/fa";
import {
  FaUserClock,
  FaUserCheck,
  FaUsers,
  FaCalendarDay,
} from "react-icons/fa6";
import printJS from "print-js";
import { useHrPendingAttendanceFilters } from "../hooks/useHrPendingAttendanceFilters";
import { usePendingAttendanceTableColumn } from "../hooks/usePendingAttendanceTableColumn";

const HrPendingAttendanceTab = () => {
  const searchParams = useSearchParams();
  const initialLimit = parseInt(searchParams.get("limit")) || 10;

  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showPendingAttendanceFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // 🧠 API Hooks
  const { usePendingAttendanceQuery } = useHrQueryApi({});
  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({});

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  const { data: departmentList = [] } = useDepartmentListQuery();

  // 🧠 Filters Hook
  const {
    filters,
    globalFilter,
    setGlobalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
  } = useHrPendingAttendanceFilters(itemsPerPage);

  // Toggle filter bar
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const next = prev === "show" ? "hide" : "show";
      localStorage.setItem("showPendingAttendanceFilter", next);
      return next;
    });
  }, []);

  // Selected date helpers
  const selectedDate = useMemo(() => {
    return filters.attendanceDate
      ? new Date(filters.attendanceDate)
      : new Date();
  }, [filters.attendanceDate]);

  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [selectedDate]);

  const isToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const current = selectedDate.toISOString().split("T")[0];
    return today === current;
  }, [selectedDate]);

  const handlePrevDate = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    handleFilterChange("attendanceDate", prev.toISOString().split("T")[0]);
  };

  const handleNextDate = () => {
    const today = new Date();
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= today) {
      handleFilterChange("attendanceDate", next.toISOString().split("T")[0]);
    }
  };

  const handleTodayJump = () => {
    const today = new Date().toISOString().split("T")[0];
    handleFilterChange("attendanceDate", today);
  };

  // 🧠 Query Data
  const { data: responseData, isLoading: isFetching } =
    usePendingAttendanceQuery(queryParams);

  const dataArray = useMemo(() => {
    if (Array.isArray(responseData?.data?.data)) return responseData.data.data;
    if (Array.isArray(responseData?.data?.items)) return responseData.data.items;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.items)) return responseData.items;
    return [];
  }, [responseData]);

  const summary = useMemo(
    () => responseData?.data?.summary || responseData?.summary || {},
    [responseData],
  );

  const total = useMemo(() => {
    return (
      responseData?.data?.total ??
      responseData?.pagination?.total ??
      responseData?.total ??
      (Array.isArray(dataArray) ? dataArray.length : 0)
    );
  }, [responseData, dataArray]);

  const listData = useMemo(() => {
    const raw = Array.isArray(dataArray) ? dataArray : [];
    return raw.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  // Dependent designations
  const populatedDesignationList = useMemo(() => {
    if (filters.departmentId) {
      const findDepartment = departmentList.find(
        (item) => item.value === filters.departmentId,
      );
      if (findDepartment) {
        return designationList.filter(
          (item) => item.departmentId === findDepartment.value,
        );
      }
    }
    return designationList || [];
  }, [filters.departmentId, designationList, departmentList]);

  // Filter Config for DataFilter
  const filterConfig = useMemo(
    () => [
      {
        component: "input",
        name: "search",
        label: "Search",
        placeholder: "Search Name, Email, Employee Code...",
      },
      {
        component: "select",
        name: "officeId",
        label: "Select Office",
        options: officeList || [],
        placeholder: "Filter by Office",
        className: "col-span-12 lg:col-span-3 sm:col-span-12",
      },
      {
        component: "select",
        name: "departmentId",
        label: "Select Department",
        options: departmentList || [],
        placeholder: "Filter by Department",
        className: "col-span-12 lg:col-span-3 sm:col-span-12",
      },
      {
        component: "select",
        name: "designationId",
        label: "Select Designation",
        options: populatedDesignationList || [],
        placeholder: "Filter by Designation",
        className: "col-span-12 lg:col-span-3 sm:col-span-12",
      },
      {
        component: "datePicker",
        name: "attendanceDate",
        label: "Attendance Date",
        options: {
          maxDate: new Date(),
        },
        placeholder: "Filter by Date",
      },
      {
        component: "clear",
      },
    ],
    [officeList, departmentList, populatedDesignationList],
  );

  // TanStack Table columns & instance
  const columns = usePendingAttendanceTableColumn();

  const table = useReactTable({
    data: listData || [],
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

  // Export handlers
  const handlePrint = () => {
    printJS({
      printable: "printable-pending-attendance-table",
      type: "html",
      targetStyles: ["*"],
      style: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; font-size: 12px; }
        th { background: #f9fafb; font-weight: 600; text-align: left; }
      `,
    });
  };

  const handleExportCSV = () => {
    if (!listData.length) return;
    const headers = [
      "SL",
      "Employee Name",
      "Employee Code",
      "Email",
      "Department",
      "Designation",
      "Office",
      "Shift",
      "Attendance Date",
      "Status",
    ];

    const rows = listData.map((item) => [
      item.sl,
      `"${item?.employee?.user?.fullName || ""}"`,
      `"${item?.employeeCode || ""}"`,
      `"${item?.employee?.user?.email || ""}"`,
      `"${item?.department?.name || ""}"`,
      `"${item?.designation?.name || ""}"`,
      `"${item?.office?.name || ""}"`,
      `"${item?.shift?.name || ""}"`,
      item?.attendanceDate || "",
      "Pending Attendance",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Pending_Attendance_${filters.attendanceDate || "list"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="title-color font-bold text-lg md:text-xl">
              Pending Attendance
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {total || 0} Employees Pending
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Employees in this company who have not checked in or given attendance yet.
          </p>
        </div>

        {/* Date Navigator & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrevDate}
              title="Previous Day"
              className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FaAngleLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
              <FaCalendarAlt className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{formattedDate}</span>
            </div>

            <button
              type="button"
              onClick={handleNextDate}
              disabled={isToday}
              title={isToday ? "Cannot select future date" : "Next Day"}
              className={`p-1.5 rounded-md transition-colors ${
                isToday
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <FaAngleRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!isToday && (
            <button
              type="button"
              onClick={handleTodayJump}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              Jump to Today
            </button>
          )}

          <SimpleTooltip
            title={showFilter === "show" ? "Hide Filters" : "Show Filters"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2 p-2"
            >
              <FaFilter className="w-3.5 h-3.5" />
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip title="Print List" text="Print List">
            <ButtonTw
              onClick={handlePrint}
              variant="alternative"
              className="p-2"
            >
              <FaPrint className="w-3.5 h-3.5" />
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip title="Export CSV" text="Export CSV">
            <ButtonTw
              onClick={handleExportCSV}
              variant="alternative"
              className="p-2"
            >
              <FaFileExcel className="w-3.5 h-3.5 text-green-600" />
            </ButtonTw>
          </SimpleTooltip>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 3. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Employees */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Company Employees
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                {summary?.totalCompanyEmployees || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FaUsers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Active staff members in organization
          </p>
        </div>

        {/* Attendance Given */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Attendance Recorded
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {summary?.attendanceGiven || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <FaUserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-2">
            Employees checked in on this date
          </p>
        </div>

        {/* Pending Attendance */}
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Pending Attendance
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-2">
                <span>{summary?.totalPending || total || 0}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/70 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <FaUserClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-2">
            Have not given attendance yet
          </p>
        </div>

        {/* Inspection Date */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Inspection Date
              </p>
              <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                {formattedDate}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <FaCalendarDay className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            {isToday ? "Showing today's real-time logs" : "Historical pending log"}
          </p>
        </div>
      </div>

      {/* 4. Table */}
      <div id="printable-pending-attendance-table" className="relative">
        <CommonTable
          table={table}
          isFetching={isFetching}
          itemsPerPage={itemsPerPage}
          columns={columns}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* 5. Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default HrPendingAttendanceTab;
