"use client";

import { createContext, useContext, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

export const SortableRowContext = createContext({
  attributes: {},
  listeners: {},
  isDragging: false,
  isReorderEnabled: true,
});

export const RowDragHandle = ({ className = "", disabled = false }) => {
  const { attributes, listeners, isDragging, isReorderEnabled } =
    useContext(SortableRowContext);
  const isDisabled = disabled || !isReorderEnabled;

  return (
    <div
      {...(isDisabled ? {} : attributes)}
      {...(isDisabled ? {} : listeners)}
      style={{ touchAction: isDisabled ? "auto" : "none" }}
      className={`inline-flex items-center justify-center p-1.5 rounded transition-all select-none ${
        isDisabled
          ? "cursor-not-allowed opacity-30 text-gray-300 dark:text-gray-600"
          : "cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700/60"
      } ${
        isDragging ? "cursor-grabbing text-blue-600 scale-110" : ""
      } ${className}`}
      title={isDisabled ? "Reordering is disabled" : "Drag to reorder"}
    >
      <GripVertical size={18} />
    </div>
  );
};

export const SortableCell = ({ children, className = "", disabled = false }) => {
  const { attributes, listeners, isReorderEnabled } =
    useContext(SortableRowContext);
  const isDisabled = disabled || !isReorderEnabled;

  return (
    <div
      {...(isDisabled ? {} : attributes)}
      {...(isDisabled ? {} : listeners)}
      style={{ touchAction: isDisabled ? "auto" : "none" }}
      className={`${isDisabled ? "" : "cursor-grab active:cursor-grabbing"} select-none ${className}`}
    >
      {children}
    </div>
  );
};

const SortableTableRow = ({ row, rowId, children, isReorderEnabled = true }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(rowId), disabled: !isReorderEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <SortableRowContext.Provider
      value={{ attributes, listeners, isDragging, isReorderEnabled }}
    >
      <tr
        ref={setNodeRef}
        style={style}
        className={`transition-colors ${
          isDragging
            ? "bg-blue-50/90 dark:bg-gray-800/90 shadow-xl ring-2 ring-blue-500/60 select-none opacity-95"
            : ""
        }`}
      >
        {children}
      </tr>
    </SortableRowContext.Provider>
  );
};

const cellClickProps = (row, cell, onCellClick) => {
  const ignore = cell.column.columnDef.meta?.ignoreRowClick;
  const clickable = Boolean(onCellClick) && !ignore;
  return {
    onClick: clickable
      ? (event) => {
          const target = event.target;
          if (target?.closest?.("button, a, input, textarea, select, label")) {
            return;
          }
          onCellClick(row.original);
        }
      : undefined,
    className: `px-4 py-2 overflow-visible relative ${
      cell.column.columnDef.meta?.className || "text-sm"
    } ${clickable ? "cursor-pointer" : ""}`,
  };
};

const CommonTable = ({
  table,
  isFetching,
  itemsPerPage,
  columns,
  hasActiveFilters,
  enableRowReorder = false,
  onRowReorder,
  rowIdKey = "id",
  onCellClick,
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const rows = table?.getRowModel?.()?.rows || [];
  const rowIds = useMemo(
    () => rows.map((r) => String(r.original?.[rowIdKey] ?? r.id)),
    [rows, rowIdKey],
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rowIds.indexOf(String(active.id));
    const newIndex = rowIds.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1 && onRowReorder) {
      onRowReorder(oldIndex, newIndex);
    }
  };

  const renderTableBody = () => {
    if (isFetching) {
      return [...Array(itemsPerPage)].map((_, rowIdx) => (
        <tr key={rowIdx}>
          {columns?.map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-2">
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ));
    }

    if (rows.length === 0) {
      return (
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
      );
    }

    if (enableRowReorder) {
      return (
        <SortableContext
          items={rowIds}
          strategy={verticalListSortingStrategy}
        >
          {rows.map((row, idx) => (
            <SortableTableRow
              key={rowIds[idx] ?? row.id}
              row={row}
              rowId={rowIds[idx] ?? row.id}
              isReorderEnabled={enableRowReorder}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} {...cellClickProps(row, cell, onCellClick)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </SortableTableRow>
          ))}
        </SortableContext>
      );
    }

    return rows.map((row) => (
      <tr key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} {...cellClickProps(row, cell, onCellClick)}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ));
  };

  const tableElement = (
    <table
      className="table"
      style={{ borderCollapse: "separate", borderSpacing: 0 }}
    >
      {/* ===== Table Header ===== */}
      <thead className="text-xs ">
        {(table?.getHeaderGroups?.() || []).map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                style={{ width: header.getSize() }}
                className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-nowrap "
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none flex items-center gap-1"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
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

      {/* ===== Table Body ===== */}
      <tbody>{renderTableBody()}</tbody>
    </table>
  );

  return (
    <div className="table-container">
      {enableRowReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          {tableElement}
        </DndContext>
      ) : (
        tableElement
      )}
    </div>
  );
};

export default CommonTable;
