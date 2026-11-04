"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { FaFilter, FaPlus } from "react-icons/fa";

import helpers from "@/utils/helpers";
import { useJobRecruitmentFilters } from "./useJobRecruitmentFilters";
import { useJobRecruitmentTableColumn } from "./useJobRecruitmentTableColumn";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import ButtonTw from "@/components/ui/ButtonTw";
import DataFilter from "@/components/common/DataFilter";
import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import Link from "next/link";

export default function HrRecruitment() {
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  const [sorting, setSorting] = useState([]);

  // Filters
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
  } = useJobRecruitmentFilters(itemsPerPage);

  // API
  const { useJobRecruitmentQuery } = useHrQueryApi();

  const { data: responseData, isLoading: isLoadingJobs } =
    useJobRecruitmentQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(
    () =>
      dataArray?.map((item, index) => ({
        ...item,
        sl: (currentPage - 1) * itemsPerPage + index + 1,
      })),
    [dataArray, currentPage, itemsPerPage],
  );

  // const handleDelete = useCallback(
  //   async (id) => {
  //     Swal.fire({
  //       title: "Are you sure?",
  //       text: "You won't be able to revert this!",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Yes, delete it!",
  //       customClass: {
  //         popup: "swal-popup",
  //         confirmButton: "swal-confirm-btn",
  //         cancelButton: "swal-cancel-btn",
  //       },
  //       buttonsStyling: false,
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         await deleteJobMutation.mutateAsync(id);
  //       }
  //     });
  //   },
  //   [deleteJobMutation],
  // );

  // Columns
  const columns = useJobRecruitmentTableColumn({
    // handleDelete,
  });

  // React Table
  const table = useReactTable({
    data: listData || [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Job Title, Category...",
    },

    { component: "clear" },
  ];

  const isLoading = isLoadingJobs;

  console.log("job recruiment get :", dataArray);

  return (
    <div>
      <div className="flex items-center justify-between my-5 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold dark-title-color">
            Job Recruitment
          </h1>
          <p className="title-color">Manage and track all job postings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
          <Link
            href={"/hr-dashboard/recruitment/job-vacancy"}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm"
          >
            <FaPlus /> Add New Job
          </Link>
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

      {/* Table */}
      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
