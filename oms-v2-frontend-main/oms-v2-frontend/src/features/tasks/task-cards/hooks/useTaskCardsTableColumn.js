import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import helpers from "@/utils/helpers";
import { Calendar, Pencil, Trash2, Columns, Folder } from "lucide-react";
import { useMemo } from "react";

export const useTaskCardsTableColumn = ({
  handleEdit,
  handleDelete,
  handleToggleStatus,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 60,
        cell: ({ row }) => (
          <div className="text-center text-gray-500 dark:text-gray-400">
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Task Card Name",
        cell: ({ row }) => {
          const name = row.original?.name;
          return (
            <div>
              <p className="font-semibold dark-title-color text-sm">{name}</p>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "board",
        header: "Board",
        cell: ({ row }) => {
          const board = row.original?.board;
          return (
            <div className="flex items-center gap-2">
              <Columns className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium dark-title-color">
                  {board?.name || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {board?.viewType?.name || ""}
                </p>
              </div>
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "workspace",
        header: "Workspace",
        cell: ({ row }) => {
          const workspace = row.original?.workspace;
          return (
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium dark-title-color">
                  {workspace?.name || "-"}
                </p>
                <p className="text-xs text-gray-500 max-w-[200px] truncate">
                  {workspace?.description || ""}
                </p>
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "serial",
        header: "Serial",
        cell: ({ row }) => {
          const serial = row.original?.serial;
          return (
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                {serial}
              </span>
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => {
          const color = row.original?.color;
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-mono">{color}</span>
            </div>
          );
        },
        size: 120,
      },

      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isActive}
            onClick={() => handleToggleStatus(row.original.id)}
            enabledText="Yes"
            disabledText="No"
          />
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => {
          const createdAt = row.original?.createdAt;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium dark-title-color">
                  {createdAt ? helpers.dDate(createdAt) : "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {createdAt ? helpers.dTime(createdAt) : ""}
                </p>
              </div>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => {
          const updatedAt = row.original?.updatedAt;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium dark-title-color">
                  {updatedAt ? helpers.dDate(updatedAt) : "Never"}
                </p>
                <p className="text-xs text-gray-500">
                  {updatedAt ? helpers.dTime(updatedAt) : ""}
                </p>
              </div>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        size: 100,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <SimpleTooltip text="Edit Task Card">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Delete Task Card">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleToggleStatus]
  );
};
