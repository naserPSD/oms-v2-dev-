// tabs/HrMonthlyAttendanceReportTab.jsx

// 1️⃣ ======================= IMPORTS =======================
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import CommonTable from "@/components/common/CommonTable";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useMonthlyAttendanceFilters } from "../hooks/useMonthlyAttendanceFilters";
import { useMonthlyReportTableColumn } from "../hooks/useMonthlyReportTableColumn";
import MonthlyReport from "./PdfComponents/MonthlyReport";

// 2️⃣ ======================= COMPONENT =======================

const HrMonthlyAttendanceReportTab = () => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  const searchParams = useSearchParams();
  const initialLimit = parseInt(searchParams.get("limit")) || 10;
  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showMonthlyFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // 🧠 ---------- API HOOKS ----------
  const { useMonthlyAttendanceQuery } = useHrQueryApi({});

  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({});

  // const { data: responseData = [] } = useMonthlyAttendanceQuery();
  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  const { data: departmentList = [] } = useDepartmentListQuery();

  // 🧠 ---------- FILTERS ----------
  const {
    queryParams,
    filters,
    globalFilter,
    setGlobalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
  } = useMonthlyAttendanceFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showMonthlyFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useMonthlyAttendanceQuery(queryParams);

  const dataArray = useMemo(() => responseData?.data || [], [responseData]);

  const total = useMemo(() => {
    return (
      responseData?.pagination?.total ??
      responseData?.total ??
      responseData?.data?.total ??
      (Array.isArray(dataArray) ? dataArray.length : 0)
    );
  }, [responseData, dataArray]);

  const listData = useMemo(() => {
    const raw = Array.isArray(dataArray)
      ? dataArray
      : Array.isArray(dataArray?.items)
        ? dataArray.items
        : Array.isArray(dataArray?.data)
          ? dataArray.data
          : [];

    return raw.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const getMonthOptions = useCallback(() => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${y}-${m}`;
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      months.push({ value, label });
    }
    return months;
  }, []);

  const monthOptions = useMemo(() => getMonthOptions(), [getMonthOptions]);

  const selectedMonthLabel = useMemo(() => {
    if (!filters.month) return "";
    const [year, month] = filters.month.split("-");
    if (!year || !month) return "";
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [filters.month]);

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

  // 🧠 Build filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
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
      options: populatedDesignationList,
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "month",
      label: "Select Month",
      type: "select",
      options: monthOptions,
      placeholder: "Select Month",
    },
    {
      component: "datePicker",
      name: "attendanceDates",
      label: "Attendance Date",
      options: {
        maxDate: new Date(), // future date disable
        mode: "range",
      },
      placeholder: "Filter by Attendance Date",
    },
    {
      component: "clear",
    },
  ];

  // 🧠 Summary Metrics
  const summaryMetrics = useMemo(() => {
    let presentDays = 0;
    let absentDays = 0;
    let totalWorked = 0;
    let overtimeHours = 0;

    listData.forEach((item) => {
      presentDays += Number(item.present) || 0;
      absentDays += Number(item.absent) || 0;
      totalWorked += Number(item.workedHours) || 0;
      overtimeHours += Number(item.overTimeHours) || 0;
    });

    return {
      totalEmployees: total || listData.length,
      presentDays,
      absentDays,
      totalWorked: totalWorked.toFixed(1),
      overtimeHours: overtimeHours.toFixed(1),
    };
  }, [listData, total]);

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useMonthlyReportTableColumn();

  // Create TanStack Table instance
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

  const isLoading = isFetching;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="title-color font-bold text-lg">
            Monthly Attendance Report
          </h1>
          {selectedMonthLabel && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {selectedMonthLabel}
            </span>
          )}
        </div>
        <div className="flex gap-2">
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
          <MonthlyReport listData={listData} />
          {/* <ButtonTw
            onClick={() => handleExport("excel")}
            className="gap-2"
            loading={exportLoading}
          >
            <FaFileExport /> Export Report
          </ButtonTw> */}
        </div>
      </div>

      {/* FILTER BAR */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Total Employees
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {summaryMetrics.totalEmployees}
            </span>
            <span className="text-xs text-gray-400">staff</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Present Days
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {summaryMetrics.presentDays}
            </span>
            <span className="text-xs text-emerald-600/70">days</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Absent Days
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {summaryMetrics.absentDays}
            </span>
            <span className="text-xs text-amber-600/70">days</span>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Total Worked
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {summaryMetrics.totalWorked}
            </span>
            <span className="text-xs text-blue-600/70">hrs</span>
          </div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 shadow-xs dark:border-purple-900/40 dark:bg-purple-950/20">
          <span className="text-[11px] font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Overtime Hours
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {summaryMetrics.overtimeHours}
            </span>
            <span className="text-xs text-purple-600/70">hrs</span>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}

      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      {/* PAGINATION */}
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

export default HrMonthlyAttendanceReportTab;
