"use client";

import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";
import RequisitionListTable from "./components/RequisitionsTable";
import { useRequisitionsListFilters } from "./hooks/useRequisitionsListFilters";
import { useRequisitionsTableColumn } from "./hooks/useRequisitionsTableColumn";

const RejectedListTab = () => {
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showFilter, setShowFilter] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { useTrainingRequestQuery } = useHrQueryApi();
  const { useDepartmentListQuery } = useCommonQueryApi({});
  const { data: departmentList = [] } = useDepartmentListQuery();

  const {
    filters,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
  } = useRequisitionsListFilters(itemsPerPage);

  const queryWithStatus = useMemo(
    () => ({
      ...queryParams,
      statusCode: "requisition_status_rejected",
    }),
    [queryParams],
  );

  const { data: responseData, isLoading } = useTrainingRequestQuery(
    queryWithStatus,
  );

  const rows = useMemo(() => responseData?.data?.list || [], [responseData]);
  const pagination = responseData?.pagination || {
    page: currentPage,
    total: 0,
    limit: itemsPerPage,
    lastPage: 1,
    resultRows: 0,
  };
  const listData = useMemo(
    () =>
      rows.map((item, index) => ({
        ...item,
        sl: (currentPage - 1) * itemsPerPage + index + 1,
      })),
    [rows, currentPage, itemsPerPage],
  );

  const columns = useRequisitionsTableColumn({ readOnly: true });
  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Name, Email, Phone...",
    },
    {
      component: "select",
      name: "departmentId",
      label: "Select Department",
      options: departmentList,
      placeholder: "Filter by Department",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "datePicker",
      name: "requisitionDate",
      label: "Request Date",
      placeholder: "Filter by Request Date",
    },
    { component: "clear" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5 flex-wrap gap-2">
        <div>
          <h1 className="title-color font-bold text-lg">Rejected List</h1>
          <p className="text-sm text-gray-500">
            Training requests marked as rejected. These entries are read-only.
          </p>
        </div>
        <ButtonTw
          onClick={() => setShowFilter((visible) => !visible)}
          variant="alternative"
          className="gap-2"
        >
          <FaFilter />
          {showFilter ? "Hide Filters" : "Show Filters"}
        </ButtonTw>
      </div>

      <DataFilter
        showFilter={showFilter}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <RequisitionListTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={pagination.total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default RejectedListTab;
