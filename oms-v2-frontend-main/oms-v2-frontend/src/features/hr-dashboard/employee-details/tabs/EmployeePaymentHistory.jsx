"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import helpers from "@/utils/helpers";
import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { Eye } from "lucide-react";
import { ModalTw } from "@/components/common/ModalTw";

const EmployeePaymentHistory = ({ employeeId }) => {
  const { useEmployeePaymentHistoryQuery } = useHrQueryApi();
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const initialLimit = helpers.perPageListItems();
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const queryParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage],
  );

  const { data: responseData, isLoading: isFetching } =
    useEmployeePaymentHistoryQuery(employeeId, queryParams);

  const listData = responseData?.data || [];
  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };

  const { total } = pagination;

  //console.log("Employee Payment :", listData);

  const handleViewDetails = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedRow(null);
  };

  // Table columns
  const columns = useMemo(
    () => [
      // Serial number
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
        cell: ({ row }) =>
          (pagination.page - 1) * pagination.limit + row.index + 1,
      },

      // Month/Year
      {
        accessorKey: "monthYear",
        header: "Month/Year",
        size: 120,
        cell: ({ row }) => (
          <span>
            {helpers.monthNumberToName(row.original?.month)}/
            {row.original?.year}
          </span>
        ),
      },

      // Basic Salary
      {
        accessorKey: "payable",
        header: "Payable",
        size: 120,
        cell: ({ row }) => (
          <span className="text-purple-700 dark:text-purple-300 font-medium">
            {row.original?.payable}
          </span>
        ),
      },

      {
        accessorKey: "paid",
        header: "Paid",
        size: 120,
        cell: ({ row }) => (
          <span className="text-green-700 dark:text-green-300 font-medium">
            {row.original?.paid}
          </span>
        ),
      },

      {
        accessorKey: "due",
        header: "Due",
        size: 120,
        cell: ({ row }) => (
          <span className="text-red-700 dark:text-red-300 font-medium">
            {row.original?.due}
          </span>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        size: 120,
        cell: ({ row }) => {
          const status = row.original?.paymentStatus;
          return (
            <div className="text-center">
              <span
                className={`badge badge-pill badge-outline-${status?.colorName || "secondary"}`}
              >
                {status?.name || "-"}
              </span>
            </div>
          );
        },
      },

      // Working / Paid / Absent Days
      // **View Details Column**
      {
        accessorKey: "details",
        header: "Details",
        size: 80,
        cell: ({ row }) => (
          <button
            onClick={() => handleViewDetails(row.original)}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded cursor-pointer"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        ),
      },

      // Actions
      //   {
      //     id: "actions",
      //     header: "Actions",
      //     size: 120,
      //     enableSorting: false,
      //     cell: ({ row }) => (
      //       <div className="flex justify-center gap-2">
      //         <button className="btn-action text-blue-500 hover:text-blue-700">
      //           <Pencil size={16} />
      //         </button>
      //         <button className="btn-action text-red-500 hover:text-red-700">
      //           <Trash2 size={16} />
      //         </button>
      //       </div>
      //     ),
      //   },
    ],
    [pagination],
  );

  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: "fit",
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h4 className="font-bold text-lg title-color">Payment History</h4>
      </div>

      <CommonTable
        table={table}
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-2">
            <span>Salary Details</span>
            {selectedRow && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                {helpers.monthNumberToName(selectedRow.month)}{" "}
                {selectedRow.year}
              </span>
            )}
          </div>
        }
        size="2xl"
        onConfirm={handleClose}
        dismissible={true}
        confirmText="Close"
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        {selectedRow && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payable - Purple Theme */}
              <div className="bg-linear-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Payable
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {selectedRow.payable}
                </p>
              </div>

              {/* Paid - Green Theme */}
              <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
                  Paid
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                  {selectedRow.paid}
                </p>
              </div>

              {/* Due - Red Theme */}
              <div className="bg-linear-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Due
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                  {selectedRow.due}
                </p>
              </div>
            </div>

            {/* Main Content - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: Salary Components */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Salary Breakdown
                </h3>

                <div className="space-y-3">
                  <InfoRow
                    label="Basic Salary"
                    value={selectedRow.basicSalary}
                  />
                  <InfoRow
                    label="Gross Salary"
                    value={selectedRow?.salaryStructure?.grossSalary}
                    highlight
                  />
                  <InfoRow
                    label="Total Earnings"
                    value={selectedRow.totalEarnings}
                  />
                  <InfoRow
                    label="Total Deductions"
                    value={selectedRow.totalDeductions}
                  />
                  <InfoRow
                    label="Extra Amount"
                    value={selectedRow.extraAmount}
                    className="text-green-600"
                  />
                  <InfoRow
                    label="Penalties Amount"
                    value={selectedRow.penaltiesAmount}
                    className="text-red-600"
                  />
                  <InfoRow
                    label="Net Salary"
                    value={selectedRow.netSalary}
                    className="text-red-600"
                  />
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Penalty Applied
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedRow.penaltyApply
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {selectedRow.penaltyApply ? "Yes" : "No"}
                    </span>
                  </div>
                  {/* Payment Status Row */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Payment Status
                    </span>
                    {selectedRow.paymentStatus ? (
                      <span
                        className={`badge badge-pill badge-outline-${selectedRow.paymentStatus?.colorName || "secondary"}`}
                      >
                        {selectedRow.paymentStatus.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        -
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Attendance Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Attendance Summary
                </h3>

                <div className="space-y-3">
                  <InfoRow
                    label="Working Days"
                    value={selectedRow.workingDays}
                  />
                  <InfoRow label="Paid Days" value={selectedRow.paidDays} />
                  <InfoRow
                    label="Present Days"
                    value={selectedRow.presentDays}
                    className="text-green-600"
                  />
                  <InfoRow
                    label="Absent Days"
                    value={selectedRow.absentDays}
                    className="text-red-600"
                  />
                </div>

                {/* Due Information */}
                {/* <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Due Amount
                    </span>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
                      {selectedRow.due}
                    </span>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Salary Structure Section */}
            {selectedRow.salaryStructure && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Salary Structure
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <InfoRow
                      label="Grade Name"
                      value={selectedRow.salaryStructure.grade?.gradeName}
                    />
                    <InfoRow
                      label="Grade Code"
                      value={selectedRow.salaryStructure.grade?.gradeCode}
                    />
                    <InfoRow
                      label="Level"
                      value={selectedRow.salaryStructure.grade?.level}
                    />
                  </div>
                  <div className="space-y-2">
                    <InfoRow
                      label="Min Salary"
                      value={selectedRow.salaryStructure.grade?.minSalary}
                    />
                    <InfoRow
                      label="Max Salary"
                      value={selectedRow.salaryStructure.grade?.maxSalary}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <InfoRow
                    label="Effective From"
                    value={selectedRow.salaryStructure.effectiveFrom}
                  />
                  <InfoRow
                    label="Effective To"
                    value={selectedRow.salaryStructure.effectiveTo}
                  />
                </div>
              </div>
            )}

            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div>
                {/* <p>
                  <span className="font-medium">Payroll Run ID:</span>{" "}
                  {selectedRow.payrollRunId}
                </p> */}
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {selectedRow.createdAt
                    ? new Date(selectedRow.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
              {selectedRow.remarks && (
                <div className="col-span-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <p>
                    <span className="font-medium">Remarks:</span>{" "}
                    {selectedRow.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalTw>
    </div>
  );
};

const InfoRow = ({ label, value, highlight = false, className = "" }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span
      className={`font-medium ${highlight ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"} ${className}`}
    >
      {value || 0}
    </span>
  </div>
);

export default EmployeePaymentHistory;
