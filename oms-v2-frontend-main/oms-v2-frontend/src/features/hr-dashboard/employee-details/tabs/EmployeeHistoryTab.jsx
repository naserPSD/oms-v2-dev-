// /tabs/EmployeeHistoryTab.jsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import EmployeeHistoryTable from "./EmployeeHistoryTable";

const EmployeeHistoryTab = ({ employeeId: propId }) => {
  const params = useParams();
  const employeeId = propId || params?.id;
  const { salaryHistoryByEmployeeQuery } = useHrQueryApi();

  const initialLimit = helpers.perPageListItems();
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState([]);

  const queryParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage],
  );

  const { data: responseData, isLoading: isFetching } =
    salaryHistoryByEmployeeQuery(employeeId, queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  const listData = useMemo(() => {
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      {
        accessorKey: "basicSalary",
        header: "Basic Salary",
        cell: ({ row }) => {
          const oldBasicSalary = row.original?.oldBasicSalary;
          const newBasicSalary = row.original?.newBasicSalary;
          return (
            <div className="flex flex-col items-start gap-1">
              {newBasicSalary && (
                <SimpleTooltip text="New Basic Salary">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newBasicSalary} (New)
                  </span>
                </SimpleTooltip>
              )}
              {oldBasicSalary && (
                <SimpleTooltip text="Old Basic Salary">
                  <span>{oldBasicSalary} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "oldGrossSalary",
        header: "Gross Salary",
        cell: ({ row }) => {
          const newGrossSalary = row.original?.newGrossSalary;
          const oldGrossSalary = row.original?.oldGrossSalary;
          return (
            <div className="flex flex-col items-start gap-1">
              {newGrossSalary && (
                <SimpleTooltip text="New Gross Salary">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newGrossSalary} (New)
                  </span>
                </SimpleTooltip>
              )}
              {oldGrossSalary && (
                <SimpleTooltip text="Old Gross Salary">
                  <span>{oldGrossSalary} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "newNetSalary",
        header: "Net Salary",
        cell: ({ row }) => {
          const newNetSalary = row.original?.newNetSalary;
          const oldNetSalary = row.original?.oldNetSalary;
          return (
            <div className="flex flex-col items-start gap-1">
              {newNetSalary && (
                <SimpleTooltip text="New Net Salary">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newNetSalary} (New)
                  </span>
                </SimpleTooltip>
              )}
              {oldNetSalary && (
                <SimpleTooltip text="Old Net Salary">
                  <span>{oldNetSalary} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "grade",
        header: "Grade",
        cell: ({ row }) => {
          const oldGrade = row.original?.oldGrade;
          const newGrade = row.original?.newGrade;
          return (
            <div className="flex flex-col items-start gap-1">
              {newGrade?.gradeName && (
                <SimpleTooltip text="New Grade">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newGrade.gradeName} (New)
                  </span>
                </SimpleTooltip>
              )}
              {oldGrade?.gradeName && (
                <SimpleTooltip text="Old Grade">
                  <span>{oldGrade.gradeName} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "salaryEventType",
        header: "Movement / Event",
        cell: ({ row }) => {
          const salaryEventType = row.original?.salaryEventType;
          const changeReason = row.original?.changeReason;
          const basicIncrementPercentage =
            row.original?.basicIncrementPercentage;

          return (
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {salaryEventType?.name ? (
                  <span
                    className={`badge badge-pill badge-outline-${
                      salaryEventType?.colorName || "secondary"
                    }`}
                  >
                    {salaryEventType.name}
                  </span>
                ) : (
                  <span className="badge badge-pill badge-outline-secondary">
                    Adjustment
                  </span>
                )}
                {basicIncrementPercentage !== null &&
                  basicIncrementPercentage !== undefined &&
                  Number(basicIncrementPercentage) !== 0 && (
                    <span
                      className={`text-[11px] font-semibold ${
                        Number(basicIncrementPercentage) > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {Number(basicIncrementPercentage) > 0
                        ? `+${basicIncrementPercentage}%`
                        : `${basicIncrementPercentage}%`}
                    </span>
                  )}
              </div>
              {changeReason && (
                <span
                  className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate"
                  title={changeReason}
                >
                  {changeReason}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "effectiveDate",
        header: "Effective Date",
        cell: ({ row }) => {
          const effectiveFrom = row.original?.effectiveFrom;
          const effectiveTo = row.original?.effectiveTo;
          return (
            <div className="flex flex-col items-start gap-1">
              {effectiveFrom && (
                <SimpleTooltip text="Effective From">
                  <span className="text-[16px] font-bold dark-title-color">
                    {helpers.dDate(effectiveFrom)}
                  </span>
                </SimpleTooltip>
              )}
              {effectiveTo && (
                <SimpleTooltip text="Effective To">
                  <span>{helpers.dDate(effectiveTo)}</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: listData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h4 className="font-bold text-lg title-color">Employee History</h4>
      </div>
      <EmployeeHistoryTable
        table={table}
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </>
  );
};

export default EmployeeHistoryTab;
