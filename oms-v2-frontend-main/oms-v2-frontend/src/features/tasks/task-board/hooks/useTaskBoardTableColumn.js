import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import helpers from "@/utils/helpers";
import { Calendar, Folder, Layout, Pencil, Trash2, User } from "lucide-react";
import { useMemo } from "react";

export const useTaskBoardTableColumn = ({
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
        header: "Board Name",
        cell: ({ row }) => {
          const name = row.original?.name;
          return (
            <div>
              <p className="font-semibold dark-title-color text-sm">{name}</p>
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "workSpace",
        header: "Workspace",
        cell: ({ row }) => {
          const workSpace = row.original?.workspace;
          return (
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium dark-title-color truncate">
                  {workSpace?.name || "-"}
                </p>
                <SimpleTooltip
                  text={workSpace?.description || "No description"}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {workSpace?.description || "No description"}
                  </p>
                </SimpleTooltip>
              </div>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "viewType",
        header: "View Type",
        cell: ({ row }) => {
          const viewType = row.original?.viewType;
          return (
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium dark-title-color">
                  {viewType?.name || "-"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {viewType?.code?.replace(/_/g, " ") || ""}
                </p>
              </div>
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => {
          const active = row.original?.active;
          return (
            <div className="flex justify-center">
              <SimpleTooltip
                text={`Board Status : ${active ? "Active" : "Inactive"}`}
              >
                <SwitchButton
                  enabled={active}
                  onChange={(enabled) =>
                    handleToggleStatus(row.original.id, enabled)
                  }
                  enabledText="Active"
                  disabledText="Inactive"
                  color={active ? "success" : "danger"}
                  size="sm"
                />
              </SimpleTooltip>
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "creatorId",
        header: "Creator",
        cell: ({ row }) => {
          const creatorId = row.original?.creatorId;
          return (
            <div className="flex items-center gap-2 justify-center">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {creatorId}
              </span>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => {
          const createdAt = row.original?.createdAt;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
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
        size: 140,
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => {
          const updatedAt = row.original?.updatedAt;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
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
        size: 140,
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
              <SimpleTooltip text="Edit Board">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Delete Board">
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
