"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

const LeaveTypeTable = ({
  table,
  isFetching,
  itemsPerPage = 10,
  columns,
  hasActiveFilters,
  leaveTypeDataArray,
}) => {
  const skeletonColumnCount = 3 + (leaveTypeDataArray?.length * 2 || 0);

  return (
    <div className="overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-gray-600 dark:bg-slate-900 dark:text-gray-300">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                  className="border-b border-gray-200 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap dark:border-gray-800"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none flex items-center justify-center gap-1"
                          : "flex justify-center"
                      }
                      onClick={header.column.getToggleSortingHandler?.()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
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
            [...Array(itemsPerPage)].map((_, rowIdx) => (
              <tr
                key={`skeleton-${rowIdx}`}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                {[...Array(skeletonColumnCount)].map((_, colIdx) => (
                  <td key={`col-${colIdx}`} className="px-4 py-2">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : table?.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 odd:bg-slate-50/70 dark:border-gray-800 dark:odd:bg-slate-900/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-4 py-2 overflow-visible text-sm ${cell.column.columnDef.meta?.className || ""}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns?.length || 1}
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
  );
};

export default LeaveTypeTable;
