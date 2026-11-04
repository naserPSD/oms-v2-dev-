import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import helpers from "@/utils/helpers";
import { Calendar, Pencil, Trash2, User } from "lucide-react";
import { useMemo } from "react";

export const useWorkSpaceTableColumn = ({
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
        header: "Workspace Name",
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
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.original?.description;
          return (
            <div className="max-w-[300px]">
              <SimpleTooltip text={description || "No description"}>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {description || "-"}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 300,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original?.isActive;
          return (
            <div className="flex justify-center">
              <SimpleTooltip
                text={`Workspace Status : ${isActive ? "Active" : "Inactive"}`}
              >
                <SwitchButton
                  enabled={isActive}
                  onChange={(enabled) =>
                    handleToggleStatus(row.original.id, enabled)
                  }
                  enabledText="Yes"
                  disabledText="No"
                  color={isActive ? "success" : "danger"}
                  size="sm"
                />
              </SimpleTooltip>
            </div>
          );
        },
        size: 120,
      },
      // {
      //   accessorKey: "creator",
      //   header: "Creator",
      //   cell: ({ row }) => {
      //     const creatorId = row.original?.creatorId;
      //     return (
      //       <div className="flex items-center gap-2">
      //         <User className="h-4 w-4 text-gray-400" />
      //         <span className="text-sm text-gray-600 dark:text-gray-400">
      //           ID: {creatorId}
      //         </span>
      //       </div>
      //     );
      //   },
      //   size: 100,
      // },
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
              <SimpleTooltip text="Edit Workspace">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Delete Workspace">
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
