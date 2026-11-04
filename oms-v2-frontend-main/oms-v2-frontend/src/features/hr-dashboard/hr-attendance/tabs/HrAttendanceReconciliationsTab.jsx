// 1️⃣ ======================= IMPORTS =======================
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFilter } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { IoMdCopy } from "react-icons/io";
import HrAttendanceReconInTimeStatusChangeModal from "../components/HrAttendanceReconInTimeStatusChangeModal";
import HrAttendanceReconOutTimeStatusChangeModal from "../components/HrAttendanceReconOutTimeStatusChangeModal";
import HrAttendanceReconSummary from "../components/HrAttendanceReconSummary";
import { useAttendanceReconciliationsTableColumn } from "../hooks/useAttendanceReconciliationsTableColumn";
import { useHrAttendanceReconciliationsFilters } from "../hooks/useHrAttendanceReconciliationsFilters";
// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

// 3️⃣ ======================= COMPONENT =======================

const HrAttendanceReconciliationsTab = () => {
  // 🧠 ---------- STORES / HOOKS / STATES ----------
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);

  const attendanceStatusList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "attendance_reconciliation_statuses",
    )?.statuses || [];
  const searchParams = useSearchParams();
  const initialLimit = parseInt(searchParams.get("limit")) || 10;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [showCheckInStatusModal, setShowCheckInStatusModal] = useState(false);
  const [showCheckOutStatusModal, setShowCheckOutStatusModal] = useState(false);
  const [reconData, setReconData] = useState(null);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // ⚡ Form
  const { reset, setError } = useForm({
    mode: "onChange",
  });

  // Modal handlers

  // 🧠 ---------- API HOOKS ----------
  const {
    useAllEmployeeAttendanceReconciliationsQuery,
    deleteEmployeeMutation,
    toggleCheckInReconciliationStatus,
    toggleCheckOutReconciliationStatus,
    // useOfficeListQuery
    // addOrUpdatePersonalNoteMutation,
    // toggleArchivePersonalNoteMutation,
    // togglePinPersonalNoteMutation,
  } = useHrQueryApi({ reset, setError });

  // API hooks
  const {
    useOfficeListQuery,
    useDesignationListQuery,
    useDepartmentListQuery,
  } = useCommonQueryApi({ reset, setError });

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
  } = useHrAttendanceReconciliationsFilters(itemsPerPage);

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
    useAllEmployeeAttendanceReconciliationsQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  // console.log(dataArray?.reconciliationSummary);

  const total = useMemo(() => {
    return (
      responseData?.pagination?.total ??
      responseData?.total ??
      responseData?.data?.total ??
      (Array.isArray(dataArray) ? dataArray.length : 0)
    );
  }, [responseData, dataArray]);

  const listData = useMemo(() => {
    const raw =
      dataArray?.data ??
      dataArray?.items ??
      (Array.isArray(dataArray) ? dataArray : []);
    const items = Array.isArray(raw) ? raw : [];

    return items.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

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

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useAttendanceReconciliationsTableColumn({
    showCheckInStatusModal,
    setShowCheckInStatusModal,
    showCheckOutStatusModal,
    setShowCheckOutStatusModal,
    setReconData,
  });

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

  // console.log(reconData, showCheckInStatusModal);
  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="dark-title-color font-bold text-lg">
          Attendance Reconciliations
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
        </div>
      </div>
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
          <Button
            className="flex items-center gap-2 border border-gray-600 title-color rounded-full font-bold px-4 py-2 text-sm  "
            variant={"outline"}
          >
            <IoMdCopy size={18} />
            Generate report
          </Button>
        </div>
      </div>

      {/* Hr Attendance reconciliation summary */}
      <HrAttendanceReconSummary className="mb-4" dataArray={dataArray} />

      {/* Modals */}
      <HrAttendanceReconInTimeStatusChangeModal
        show={showCheckInStatusModal}
        onClose={() => setShowCheckInStatusModal(false)}
        statusOptions={attendanceStatusList}
        data={reconData}
        isLoading={toggleCheckInReconciliationStatus.isLoading}
      />

      <HrAttendanceReconOutTimeStatusChangeModal
        show={showCheckOutStatusModal}
        onClose={() => setShowCheckOutStatusModal(false)}
        statusOptions={attendanceStatusList}
        data={reconData}
        isLoading={toggleCheckOutReconciliationStatus.isLoading}
      />
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

export default HrAttendanceReconciliationsTab;
