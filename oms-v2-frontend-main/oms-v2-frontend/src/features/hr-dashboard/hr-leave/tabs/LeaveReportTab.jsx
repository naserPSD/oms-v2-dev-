// tabs/HrMonthlyAttendanceReportTab.jsx

// 1️⃣ ======================= IMPORTS =======================
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
//import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useLeaveReportFilter } from "./hooks/useLeaveReportFilter";
import { useLeaveReportTableColumn } from "./hooks/useLeaveReportTableColumn";
import LeaveTypeTable from "./LeaveTypeTable";
import LeaveTableExportMenu from "../components/LeaveTableExportMenu";

// 2️⃣ ======================= COMPONENT =======================

const HrMonthlyAttendanceReportTab = () => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  // const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  // const [employeeOfTheMonth, setEmployeeOfTheMonth] = useState(null);
  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showMonthlyFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // 🧠 ---------- API HOOKS ----------
  const { useGetLeaveReportQuery, leaveTypesQuery } = useHrQueryApi({});

  const {
    ///useOfficeListQuery,
    useDesignationListQuery,
    //useDepartmentListQuery,
  } = useCommonQueryApi({});

  //const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  //const { data: departmentList = [] } = useDepartmentListQuery();

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
  } = useLeaveReportFilter(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showMonthlyFilter", newValue);
      return newValue;
    });
  }, []);

  const { data: leaveTypes, isLoading: leaveTypesLoading } = leaveTypesQuery();

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useGetLeaveReportQuery(queryParams);

  const dataArray = useMemo(() => responseData?.data || [], [responseData]);

  const leaveTypeDataArray = useMemo(
    () => leaveTypes?.data || [],
    [leaveTypes],
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

  // const getMonthOptions = () => {
  //   const months = [];
  //   const today = new Date();
  //   for (let i = 0; i < 12; i++) {
  //     const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
  //     const value = date.toISOString().slice(0, 7);
  //     const label = date.toLocaleDateString("en-US", {
  //       year: "numeric",
  //       month: "long",
  //     });
  //     months.push({ value, label });
  //   }
  //   return months;
  // };

  // 🧠 Build filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },
    // {
    //   component: "select",
    //   name: "officeId",
    //   label: "Select Office",
    //   options: officeList || [],
    //   placeholder: "Filter by Office",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },
    // {
    //   component: "select",
    //   name: "departmentId",
    //   label: "Select Department",
    //   options: departmentList || [],
    //   placeholder: "Filter by Department",
    //   className: "col-span-12 lg:col-span-3 sm:col-span-12",
    // },

    {
      component: "select",
      name: "designationId",
      label: "Select Designation",
      options: designationList,
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "number",
      name: "year",
      label: "Year Search",
      placeholder: "Search Year...",
    },
    // {
    //   component: "select",
    //   name: "month",
    //   label: "Select Month",
    //   type: "select",
    //   options: getMonthOptions(),
    //   placeholder: "Select Month",
    // },

    {
      component: "clear",
    },
  ];

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useLeaveReportTableColumn(leaveTypeDataArray);

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
  // const handleExport = useCallback(
  //   async (format) => {
  //     try {
  //       setExportLoading(true);
  //       // Implement export logic here
  //       // Your export API call would go here
  //     } catch (error) {
  //       console.error("Export error:", error);
  //     } finally {
  //       setExportLoading(false);
  //     }
  //   },
  //   [queryParams],
  // );

  const isLoading = leaveTypesLoading || isFetching;
  const reportYear = filters?.year || new Date().getFullYear();
  const reportTotals = useMemo(() => {
    const employees = listData.length;
    const used = listData.reduce(
      (sum, row) => sum + (Number(row.totalLeaveDays) || 0),
      0,
    );
    return { employees, used, types: leaveTypeDataArray.length };
  }, [listData, leaveTypeDataArray.length]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="title-color font-bold text-lg">Yearly Leave Report</h1>
          <p className="text-xs text-gray-500">Approved leave days for {reportYear}</p>
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
          <LeaveTableExportMenu
            title="Yearly Leave Report"
            data={listData}
            variant="leaveReport"
            leaveTypeDataArray={leaveTypeDataArray}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Employees</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{reportTotals.employees}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Approved days used</p>
          <p className="mt-1 text-2xl font-bold text-blue-800 dark:text-blue-100">{reportTotals.used}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 dark:border-violet-900 dark:bg-violet-950/40">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-600">Leave types</p>
          <p className="mt-1 text-2xl font-bold text-violet-800 dark:text-violet-100">{reportTotals.types}</p>
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

      <LeaveTypeTable
        table={table}
        isFetching={isLoading} // আপনি চাইলে এখানে loading state ব্যবহার করতে পারেন
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={false}
        leaveTypeDataArray={leaveTypeDataArray}
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
      {/* <LeaveExportAction
        onExport={handleExport}
        loading={exportLoading}
        month={filters.month}
      /> */}
    </div>
  );
};

export default HrMonthlyAttendanceReportTab;
