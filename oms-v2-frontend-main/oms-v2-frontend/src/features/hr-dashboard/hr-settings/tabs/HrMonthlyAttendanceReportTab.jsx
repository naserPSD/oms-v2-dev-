// tabs/HrMonthlyAttendanceReportTab.jsx

// 1️⃣ ======================= IMPORTS =======================
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import CommonTable from "@/components/common/CommonTable";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FaFileExport, FaFilter } from "react-icons/fa";
// import AttendanceCharts from "./components/monthly-report/AttendanceCharts";
// import ExportActions from "./components/monthly-report/ExportActions";
import monthlyReportDemoData from "@/data/monthlyAttendanceReportData";
import AttendanceCharts from "../components/monthly-report/AttendanceCharts";
import ExportActions from "../components/monthly-report/ExportActions";
import { useMonthlyAttendanceFilters } from "../hooks/useMonthlyAttendanceFilters";
import { useMonthlyReportTableColumn } from "../hooks/useMonthlyReportTableColumn";
import Swal from "sweetalert2";
import MonthlyReport from "./PdfComponents/MonthlyReport";
import { range } from "lodash";

// 2️⃣ ======================= COMPONENT =======================

const HrMonthlyAttendanceReportTab = () => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [employeeOfTheMonth, setEmployeeOfTheMonth] = useState(null);
  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showMonthlyFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

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

  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      months.push({ value, label });
    }
    return months;
  };

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
      options: designationList,
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "month",
      label: "Select Month",
      type: "select",
      options: getMonthOptions(),
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

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useMonthlyReportTableColumn();

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

  // 🧠 ---------- EXPORT HANDLER ----------
  const handleExport = useCallback(
    async (format) => {
      try {
        setExportLoading(true);
        // Implement export logic here
        // Your export API call would go here
      } catch (error) {
        console.error("Export error:", error);
      } finally {
        setExportLoading(false);
      }
    },
    [queryParams],
  );

  const isLoading = isFetching || exportLoading;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="title-color font-bold text-lg">
          Monthly Attendance Report
        </h1>
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

      {/* EXPORT ACTIONS */}
      <ExportActions
        onExport={handleExport}
        loading={exportLoading}
        month={filters.month}
      />
    </div>
  );
};

export default HrMonthlyAttendanceReportTab;
