// /tabs/EmployeeHistoryTab.jsx
"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
// Hooks & Utilities
import helpers from "@/utils/helpers";
// import Link from "next/link";
// import Avatar from "@/components/ui/Avatar";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useMemo, useState } from "react";
import EmployeeHistoryTable from "./EmployeeHistoryTable";

const EmployeeHistoryTab = () => {
  const { mySalaryHistoryQuery } = useHrQueryApi();
  const initialLimit = helpers.perPageListItems();
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState([]);
  // Query params for API
  const queryParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage],
  );

  const { data: responseData, isLoading: isFetching } =
    mySalaryHistoryQuery(queryParams);

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

  // console.log("salary History responseData:", responseData);

  // console.log("salary History dataArray:", listData);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      // {
      //   accessorKey: "employee",
      //   header: "Employee Details",
      //   enableGlobalFilter: true,
      //   filterFn: "includesString",
      //   cell: ({ row }) => {
      //     const employee = row?.original?.employee;
      //     const userProfile = row?.original?.employee?.user?.profile;
      //     // const designation = row?.original?.designation;
      //     return (
      //       <Link
      //         href={`/hr-dashboard/employee/${row.original.employeeId}`}
      //         className="flex items-center gap-2 cursor-pointer"
      //       >
      //         {userProfile?.profilePicture?.fileUrl ? (
      //           <img
      //             src={userProfile?.profilePicture?.fileUrl}
      //             alt={employee?.user?.fullName}
      //             className="w-8 h-8 rounded-full object-cover"
      //           />
      //         ) : (
      //           <Avatar
      //             text={helpers.avatarText(employee?.user?.fullName)}
      //             color="info"
      //             size="lg"
      //             // className="bg-blue-200 text-blue-700 dark:bg-blue-600 dark:text-blue-100"
      //           />
      //         )}

      //         <div className="ml-1">
      //           <p className="font-semibold dark-title-color">
      //             {employee?.user?.fullName}
      //           </p>
      //           <p className="text-xs text-gray-500">
      //             {employee?.employeeCode}
      //           </p>
      //           {/* <SimpleTooltip text={"Designation"}>
      //               {designation?.name && (
      //                 <span className="badge badge-rounded badge-outline-secondary">
      //                   {designation?.name}
      //                 </span>
      //               )}
      //             </SimpleTooltip> */}
      //           <p className="text-xs text-gray-500">{employee?.user?.email}</p>
      //           <p className="text-xs text-gray-500">
      //             {userProfile?.phoneWithCallingCode}
      //           </p>
      //         </div>
      //       </Link>
      //     );
      //   },
      //   size: 280,
      // },

      {
        accessorKey: "basicSalary",
        header: "Basic Salary",
        cell: ({ row }) => {
          const oldBasicSalary = row.original?.oldBasicSalary;
          const newBasicSalary = row.original?.newBasicSalary;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* Old Basic Salary */}

              {/* New Basic Salary */}
              {newBasicSalary && (
                <SimpleTooltip text="New Basic Salary">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newBasicSalary} (New)
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Down Arrow */}
              {/* {oldBasicSalary && newBasicSalary && (
                  <div className="flex justify-center  my-1">
                    <span className="text-gray-400 text-2xl">↓</span>
                  </div>
                )} */}
              {oldBasicSalary && (
                <SimpleTooltip text="Old Basic Salary">
                  <span className="">{oldBasicSalary} (Old)</span>
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
              {/* New Designation */}
              {newGrossSalary && (
                <SimpleTooltip text="New Gross Salary">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newGrossSalary} (New)
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Big Down Arrow */}
              {/* {oldDesignation?.name && newDesignation?.name && (
                  <div className="flex justify-center my-1">
                    <span className="text-gray-400 text-2xl">↓</span>
                  </div>
                )} */}

              {/* Old Designation */}
              {oldGrossSalary && (
                <SimpleTooltip text="Old Gross Salary">
                  <span className="">{oldGrossSalary} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        size: 200,
      },

      {
        accessorKey: "newNetSalary",
        header: "Net Salary",
        cell: ({ row }) => {
          const newNetSalary = row.original?.newNetSalary;
          const oldNetSalary = row.original?.oldNetSalary;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* New Designation */}
              {newNetSalary && (
                <SimpleTooltip text="New Gross Salary">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newNetSalary} (New)
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Big Down Arrow */}
              {/* {oldDesignation?.name && newDesignation?.name && (
                  <div className="flex justify-center my-1">
                    <span className="text-gray-400 text-2xl">↓</span>
                  </div>
                )} */}

              {/* Old Designation */}
              {oldNetSalary && (
                <SimpleTooltip text="Old Gross Salary">
                  <span className="">{oldNetSalary} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        size: 200,
      },

      {
        accessorKey: "grade",
        header: "Grade",
        cell: ({ row }) => {
          const oldGrade = row.original?.oldGrade;
          const newGrade = row.original?.newGrade;

          return (
            <div className="flex flex-col items-start gap-1">
              {/* New Grade */}
              {newGrade?.gradeName && (
                <SimpleTooltip text="New Grade">
                  <span className="text-[16px] font-bold dark-title-color">
                    {newGrade.gradeName} (New)
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Down Arrow */}
              {/* {oldGrade?.gradeName && newGrade?.gradeName && (
                  <div className="flex justify-center my-1">
                    <span className="text-gray-400 text-2xl">↓</span>
                  </div>
                )} */}

              {/* Old Grade */}
              {oldGrade?.gradeName && (
                <SimpleTooltip text="Old Grade">
                  <span className="">{oldGrade.gradeName} (Old)</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
        size: 150,
      },

      {
        accessorKey: "eventAndDate",
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
              {/* New Grade */}
              {effectiveFrom && (
                <SimpleTooltip text="Effective From">
                  <span className="text-[16px] font-bold dark-title-color">
                    {helpers.dDate(effectiveFrom)}
                  </span>
                </SimpleTooltip>
              )}

              {/* Centered Down Arrow */}
              {/* {oldGrade?.gradeName && newGrade?.gradeName && (
                  <div className="flex justify-center my-1">
                    <span className="text-gray-400 text-2xl">↓</span>
                  </div>
                )} */}

              {/* Old Grade */}
              {effectiveTo && (
                <SimpleTooltip text="Effective To">
                  <span className=""> {helpers.dDate(effectiveTo)}</span>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },

      // {
      //   accessorKey: "reason",
      //   header: "Reason",
      //   cell: ({ row }) => {
      //     const reason = row.original?.reason;
      //     return (
      //       <div className="flex items-center gap-2">
      //         <div>{reason}</div>
      //       </div>
      //     );
      //   },
      // },

      // {
      //   accessorKey: "actions",
      //   header: "Actions",
      //   cell: ({ row }) => {
      //     const rowData = row.original;
      //     return (
      //       <div className="action">
      //         {/* <button
      //             onClick={() => handleEdit(rowData)}
      //             className="btn-action text-blue-500 hover:text-blue-700"
      //           >
      //             <Pencil size={16} />
      //           </button> */}
      //         <button
      //           onClick={() => handleDelete(rowData.id)}
      //           className="btn-action text-red-500 hover:text-red-700"
      //         >
      //           <Trash2 size={16} />
      //         </button>
      //       </div>
      //     );
      //   },
      //   enableSorting: false,
      //   size: 80,
      // },
    ],
    [],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      //globalFilter,
    },
    onSortingChange: setSorting,
    //onGlobalFilterChange: setGlobalFilter,
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
        //hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </>
  );
};

export default EmployeeHistoryTab;
