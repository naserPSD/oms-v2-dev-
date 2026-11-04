// 1️⃣ ======================= IMPORTS =======================
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
  FaFilter,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { useAttendanceListTableColumn } from "../hooks/useAttendanceListTableColumn";

import {
  AlertCircle,
  ArrowRight,
  FileDown,
  RefreshCw,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { BiPlus } from "react-icons/bi";
// import printJS from "print-js";
import { FaMinusCircle } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useHrAttendanceListFilters } from "../hooks/useHrAttendanceListFilters";
import AttendanceReport from "./PdfComponents/AttendanceReport";
// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const initialValues = {
  id: 0,
  isActive: true,
};

const schema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  reminderAt: z.string().optional(),
});

// 3️⃣ ======================= COMPONENT =======================

const HrAttendanceListTab = ({ hasPermission }) => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const attendanceStatusList =
    dropdowns.statusGroupList?.find((s) => s.code === "emp_attendance_statuses")
      ?.statuses || [];
  const searchParams = useSearchParams();
  const initialLimit = parseInt(searchParams.get("limit")) || 10;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // ⚡ Form
  const { reset, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    useAllEmployeeAttendanceQuery,
    deleteEmployeeMutation,
    useAppEmployeeUsersQuery,
    // useOfficeListQuery
    // addOrUpdatePersonalNoteMutation,
    // toggleArchivePersonalNoteMutation,
    // togglePinPersonalNoteMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  const {
    data: employeeList = [],
    isLoading: isLoadingEmployees,
    refetch: refetchEmployeeList,
  } = useAppEmployeeUsersQuery();

  const [dismissInstruction, setDismissInstruction] = useState(false);

  // API hooks
  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({ reset, setError, handleClose, setShowModal });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();
  const { data: departmentList = [] } = useDepartmentListQuery();

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
  } = useHrAttendanceListFilters(itemsPerPage);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    // Default: filter থেকে আসা date না থাকলে আজকের তারিখ
    return filters.attendanceDate
      ? new Date(filters.attendanceDate)
      : new Date();
  });

  // 🧭 Change date when user selects from filter
  useEffect(() => {
    if (filters.attendanceDate) {
      setSelectedDate(new Date(filters.attendanceDate));
    } else {
      // 🔸 যদি clearAllFilters() করা হয়
      setSelectedDate(new Date());
    }
  }, [filters.attendanceDate]);

  // 📅 Navigate previous day
  const handlePrevDate = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
    handleFilterChange("attendanceDate", prev.toISOString().split("T")[0]);
  };

  // 📅 Navigate next day (but not future)
  const handleNextDate = () => {
    const today = new Date();
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= today) {
      setSelectedDate(next);
      handleFilterChange("attendanceDate", next.toISOString().split("T")[0]);
    }
  };

  // 📆 Date format
  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  }, [selectedDate]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useAllEmployeeAttendanceQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || {},
    [responseData?.data],
  );

  const summary = useMemo(
    () => responseData?.data?.summary || responseData?.summary || {},
    [responseData],
  );

  const listData = useMemo(() => {
    const rawItems = dataArray?.items ?? (Array.isArray(dataArray) ? dataArray : []);
    const items = Array.isArray(rawItems) ? rawItems : [];

    return items.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const total = useMemo(() => {
    return (
      responseData?.pagination?.total ??
      responseData?.total ??
      responseData?.data?.total ??
      (Array.isArray(listData) ? listData.length : 0)
    );
  }, [responseData, listData]);

  // console.log("AttendanceReport dataArray:", dataArray);
  // console.log("AttendanceReport listData:", listData);

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
    return [];
  }, [filters.departmentId, designationList, departmentList]);

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
      options: populatedDesignationList || [],
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "attendanceStatusId",
      label: "Select Status",
      options: attendanceStatusList,
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "datePicker",
      name: "attendanceDate",
      label: "Attendance Date",
      options: {
        maxDate: new Date(), // future date disable
      },
      placeholder: "Filter by Attendance Date",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
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
          await deleteEmployeeMutation.mutateAsync(id);
        }
      });
    },
    [deleteEmployeeMutation],
  );

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useAttendanceListTableColumn({ handleEdit, handleDelete });

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

  const isLoading =
    isFetching ||
    // addOrUpdatePersonalNoteMutation.isLoading ||
    deleteEmployeeMutation.isLoading;
  // toggleArchivePersonalNoteMutation.isLoading ||
  // togglePinPersonalNoteMutation.isLoading;

  // const handlePrint = () => {
  //   printJS({
  //     printable: "printable-attendance-list",
  //     type: "html",
  //     targetStyles: ["*"],
  //     style: `
  //       @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
  //       .english-font { font-family: 'Roboto', sans-serif; }
  //     `,
  //   });
  // };

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Attendance List</h1>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Instruction to add employee first if not available */}
      {!isLoadingEmployees && employeeList.length === 0 && !dismissInstruction && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    No Employees Available — Please Add Employees First
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Employee attendance tracking and daily log records require active employees in your organization. Please add employee profiles first before managing attendance records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissInstruction(true)}
                  className="rounded-md p-1 text-gray-400 hover:bg-white/70 hover:text-gray-600 dark:hover:bg-gray-800"
                  aria-label="Dismiss instruction"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 rounded-lg border border-amber-200/80 bg-white/70 p-3 text-xs dark:border-amber-900/40 dark:bg-gray-900/60">
                <p className="font-semibold text-gray-900 dark:text-gray-200">
                  Steps to set up Attendance Tracking:
                </p>
                <ol className="mt-1.5 list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>
                    Go to the{" "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Employees
                    </span>{" "}
                    management page.
                  </li>
                  <li>
                    Create employees with their assigned office, shift, department, and designation.
                  </li>
                  <li>
                    Return to this page to start monitoring daily check-ins, check-outs, and attendance summaries.
                  </li>
                </ol>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/hr-dashboard/employee?tab=employee-list"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                >
                  <BiPlus className="h-4 w-4" />
                  <span>Go to Employees</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => refetchEmployeeList?.()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center py-2 text-sm">
            <button
              onClick={handlePrevDate}
              className="bg-theme-light dark:bg-theme-dark-text rounded-full w-8 h-8 flex items-center justify-center"
            >
              <FaAngleLeft size={18} />
            </button>
            <span className="mx-2">{formattedDate}</span>
            <button
              onClick={() => {
                if (
                  new Date(selectedDate).toDateString() !==
                  new Date().toDateString()
                ) {
                  handleNextDate();
                }
              }}
              disabled={
                new Date(selectedDate).toDateString() ===
                new Date().toDateString()
              }
              className={`rounded-full w-8 h-8 flex items-center justify-center ${
                new Date(selectedDate).toDateString() ===
                new Date().toDateString()
                  ? "opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700"
                  : "dark:bg-theme-dark-text bg-theme-light"
              }`}
            >
              <FaAngleRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {/* <AttendanceListTable data={dataArray} /> */}
          <AttendanceReport listData={listData} />
        </div>
      </div>
      <div className="space-y-4 mb-4">
        {/* Top Summary Section */}
        {hasPermission("hr.todays_summary_view") && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Today's Summary */}
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-4 ">
                <FileDown className="text-primaryColor" />
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 ">
                  Todays Summary
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* On time */}
                <div className="border-l-2 border-gray-400 ml-1">
                  <div className="pl-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      On time
                    </p>
                    <p className="text-2xl font-bold text-green-500 flex items-center gap-1">
                      {summary?.today?.onTimeCheckIn || 0}
                      <span>
                        <FaArrowAltCircleUp className="text-green-500 pl-1 text-xl" />
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {summary?.yesterday?.OntimeCheckInPercentage ||
                        0}
                      % up than last day
                    </p>
                  </div>
                </div>
                {/* Late check in */}
                <div className="border-l-2 border-gray-400 ml-1">
                  <div className="pl-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 ">
                      Late check in
                    </p>
                    <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                      {summary?.today?.lateCheckIn || 0}
                      <span>
                        <FaArrowAltCircleDown className="text-orange-500 pl-1 text-xl" />
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {summary?.yesterday?.LateCheckInPercentage ||
                        0}
                      % less than last day
                    </p>
                  </div>
                </div>
                {/* Early timing */}
                <div className="border-l-2 border-gray-400 ml-1">
                  <div className="pl-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Early timing
                    </p>
                    <p className="text-2xl font-bold text-blue-500 flex items-center gap-1">
                      {summary?.today?.earlyTiming || 0}
                      <span>
                        <TrendingUp className="text-blue-500 pl-1 text-xl" />
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {summary?.yesterday
                        ?.earlyTimingProgressPercentage || 0}
                      % Progress rate
                    </p>
                  </div>
                </div>
                {/* Absent */}
                <div className="border-l-2 border-gray-400 ml-1">
                  <div className="pl-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Absent
                    </p>
                    <p className="text-2xl font-bold text-red-500 flex items-center gap-1">
                      {summary?.today?.absent || 0}
                      <span>
                        <FaMinusCircle className="text-red-500 pl-1 text-xl" />
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {summary?.yesterday?.absentPercentage || 0}%
                      usual rate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconsider Attendance */}
            {/* <div className="w-full lg:w-80 bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck2 className="text-primaryColor " />
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 ">
                Reconsider attendance
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    On visit
                  </p>
                  <p className="text-2xl font-bold text-blue-500 flex items-center gap-1">
                    03{" "}
                    <span>
                      <FaDesktop className="text-blue-500 pl-1 text-xl" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PR & client meeting
                  </p>
                </div>
              </div>
              <div className="border-l-2 border-gray-400 ml-1">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Invalid check in
                  </p>
                  <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                    03{" "}
                    <span>
                      <Clock className="text-orange-500 pl-1 text-xl" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due to lag of system
                  </p>
                </div>
              </div>
            </div>
          </div> */}
          </div>
        )}
      </div>

      {/* <GenerateAttendanceListPdf
        pdfContent={listData}
        dataArray={dataArray}
      /> */}

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
    </div>
  );
};

export default HrAttendanceListTab;
