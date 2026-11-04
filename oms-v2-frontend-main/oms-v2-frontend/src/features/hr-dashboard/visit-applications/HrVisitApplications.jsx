"use client";
// 1️⃣ ======================= IMPORTS =======================
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";

import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";

import SimpleTooltip from "@/components/ui/SimpleTooltip";

import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

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

import { useVisitApplicationFilters } from "./hooks/useVisitApplicationFilters";
import { useVisitApplicationTableColumn } from "./hooks/useVisitApplicationTableColumn";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import { toast } from "react-toastify";

import SelectSearch from "@/components/ui/SelectSearch";
import { ModalTw } from "@/components/common/ModalTw";
import Input from "@/components/ui/Input";

// 3️⃣ ======================= COMPONENT =======================

const HrVisitApplications = ({ hasPermission }) => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState("visitStatus");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [checkInTime, setCheckInTime] = useState(""); // initial empty
  const [checkOutTime, setCheckOutTime] = useState("");
  const [showTimeModal, setShowTimeModal] = useState(false);

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  // const [currentPage, setCurrentPage] = useState(initialPage);

  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // API hooks
  const { useOfficeListQuery, useDesignationListQuery } = useCommonQueryApi({
    setShowModal,
  });

  const { data: officeList = [] } = useOfficeListQuery();
  const { data: designationList = [] } = useDesignationListQuery();

  const handleClose = useCallback(() => {
    setShowTimeModal(false);
    setShowStatusModal(false);
    setSelectedStatus("");
  }, []);

  // 🧠 ---------- API HOOKS ----------
  const {
    useVisitApplicationQuery,
    updateVisitStatusMutation,
    updateApplyForVisit,
    updateCheckInAndCheckOutTime,
  } = useHrQueryApi({ handleClose });
  // Modal handlers

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
  } = useVisitApplicationFilters(itemsPerPage);

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
    useVisitApplicationQuery(queryParams);
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
  const visitApplicationStatusList =
    dropdowns.statusGroupList?.find(
      (s) => s.code === "visit_application_statuses",
    )?.statuses ?? [];

  // Get employee options for dropdowns

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
      name: "designationId",
      label: "Select Designation",
      options: designationList || [],
      placeholder: "Filter by Designation",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "visitStatusId",
      label: "Select Visit Status",
      options: visitApplicationStatusList || [],
      placeholder: "Filter by Visit Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "datePicker",
      name: "visitDate",
      label: "Visit Date",
      placeholder: "Filter by Visit Date",
    },
    {
      component: "clear",
    },
  ];

  // 🧠 ---------- TABLE ----------
  // 🧠 Custom hook for TanStack Table columns
  const columns = useVisitApplicationTableColumn({
    hasPermission,
    setShowStatusModal,
    setRemarks,
    setSelectedStatus,
    setSelectedRow,
    setEditingField,
    setShowTimeModal,
    setCheckInTime,
    setCheckOutTime,
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

  const isLoading = isFetching;

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    const payload = {
      id: selectedRow?.id,
      remarks,
      // field অনুযায়ী key set করা
      ...(editingField === "visitStatus"
        ? { visitStatusId: selectedStatus }
        : { applicationStatusId: selectedStatus }),
    };

    if (editingField === "visitStatus") {
      // Visit status update API
      await updateVisitStatusMutation.mutateAsync(payload);
    } else if (editingField === "applicationStatus") {
      // Application status update API
      await updateApplyForVisit.mutateAsync(payload);
    }
  };

  const formatTimeToHHMMSS = (time) => {
    if (!time) return "";
    if (time.length === 8) return time;
    return `${time}:00`;
  };

  const handleTimeChange = async () => {
    const payload = {
      id: selectedRow?.id,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
    };
    if (!payload.checkOutTime) delete payload.checkOutTime;
    await updateCheckInAndCheckOutTime.mutateAsync(payload);
  };

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="dark-title-color font-bold text-lg">
          Visit Application List
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

      <ModalTw
        show={showStatusModal}
        onClose={handleClose}
        title="Change Visit Status"
        onConfirm={handleStatusChange}
      >
        <p className="mb-3 text-sm text-gray-600">
          Are you sure you want to change visit status?
        </p>

        <SelectSearch
          label="Select Status"
          options={
            editingField === "visitStatus"
              ? visitApplicationStatusList.filter((item) =>
                  ["Pending", "Completed"].includes(item.name),
                )
              : visitApplicationStatusList.filter((item) =>
                  ["Pending", "Approved", "Rejected"].includes(item.name),
                )
          }
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
          placeholder="Select status"
          clearable
        />

        <Input
          label="Remarks"
          type="textarea"
          placeholder="Enter Remarks..."
          className="md:col-span-2"
          value={remarks}
          onChange={(value) => setRemarks(value)}
        />
      </ModalTw>

      <ModalTw
        show={showTimeModal}
        onClose={handleClose}
        title="Update Check-In And Check-Out Time"
        onConfirm={handleTimeChange}
      >
        <Input
          label="Check In Time"
          type="time"
          value={checkInTime?.slice(0, 5) || ""}
          onChange={(value) => setCheckInTime(formatTimeToHHMMSS(value))}
        />

        <Input
          label="Check Out Time"
          type="time"
          value={checkOutTime?.slice(0, 5) || ""}
          onChange={(value) => setCheckOutTime(formatTimeToHHMMSS(value))}
        />
      </ModalTw>
    </div>
  );
};

export default HrVisitApplications;
