import Pagination from "@/components/common/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

const HrOfficeTable = ({
  table,
  isFetching,
  itemsPerPage,
  columns,
  hasActiveFilters,
  currentPage,
  total,
  setCurrentPage,
  setItemsPerPage,
}) => {
  return (
    <div>
      <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="text-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp size={14} />,
                          desc: <ChevronDown size={14} />,
                        }[header.column.getIsSorted()] ??
                          (header.column.getCanSort() ? (
                            <ArrowUpDown size={14} />
                          ) : null)}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isFetching ? (
              [...Array(itemsPerPage)].map((_, i) => (
                <>
                  <tr key={i}>
                    <td className="px-4 py-2">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-4 w-18" />
                    </td>
                    <td className="px-4 py-2">
                      <Skeleton className="h-4 w-18" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Skeleton className="h-4 w-18" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Skeleton className="h-4 w-18" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Skeleton className="h-4 w-18" />
                    </td>
                    {/* action */}
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                      </div>
                    </td>
                  </tr>
                </>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  {hasActiveFilters
                    ? "No results match your search criteria"
                    : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default HrOfficeTable;
