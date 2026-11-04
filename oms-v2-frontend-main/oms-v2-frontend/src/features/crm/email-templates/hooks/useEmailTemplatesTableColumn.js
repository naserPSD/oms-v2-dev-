// hooks/useEmailTemplatesTableColumn.js
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import {
  Calendar,
  CheckSquare,
  Code,
  Copy,
  Eye,
  Pencil,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo } from "react";

export const useEmailTemplatesTableColumn = ({
  handleEdit,
  handleViewDetails,
  handleDuplicate,
  handleDelete,
  handleViewVariables,
  selectedRows,
  toggleRowSelection,
  toggleAllRows,
  showSubscriberAvailability = false,
}) => {
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => {
          const allIds = table.getRowModel().rows.map((row) => row.original.id);
          const allSelected =
            allIds.length > 0 && allIds.every((id) => selectedRows.has(id));
          const someSelected =
            allIds.length > 0 &&
            allIds.some((id) => selectedRows.has(id)) &&
            !allSelected;

          return (
            <div className="flex justify-center">
              <SimpleTooltip text={allSelected ? "Deselect All" : "Select All"}>
                <button
                  onClick={toggleAllRows}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : someSelected ? (
                    <div className="w-4 h-4 border-2 border-blue-600 bg-blue-600 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </SimpleTooltip>
            </div>
          );
        },
        cell: ({ row }) => {
          const isSelected = selectedRows.has(row.original.id);
          return (
            <div className="flex justify-center">
              <SimpleTooltip text={isSelected ? "Deselect" : "Select"}>
                <button
                  onClick={() => toggleRowSelection(row.original.id)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </SimpleTooltip>
            </div>
          );
        },
        size: 60,
      },
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
        header: "Template Name",
        cell: ({ row }) => {
          const name = row.original?.name;
          const isDefault = row.original?.isDefault;
          return (
            <div className="max-w-[200px]">
              <div className="flex items-center gap-2">
                <p className="font-semibold dark-title-color text-sm truncate">
                  {name}
                </p>
                {isDefault && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    Default
                  </span>
                )}
              </div>
              {row.original?.description && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {row.original.description}
                </p>
              )}
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => {
          const subject = row.original?.subject;
          return (
            <div className="max-w-[300px] ">
              <SimpleTooltip text={subject}>
                <p className="text-sm text-gray-600 dark:text-gray-400 ">
                  {subject}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 300,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.original?.category;
          const getCategoryInfo = (category) => {
            switch (category) {
              case "onboarding":
                return { label: "Onboarding", color: "blue" };
              case "authentication":
                return { label: "Authentication", color: "green" };
              case "newsletter":
                return { label: "Newsletter", color: "purple" };
              case "ecommerce":
                return { label: "E-commerce", color: "orange" };
              case "billing":
                return { label: "Billing", color: "red" };
              case "support":
                return { label: "Support", color: "indigo" };
              case "marketing":
                return { label: "Marketing", color: "pink" };
              case "product":
                return { label: "Product", color: "teal" };
              case "calendar":
                return { label: "Calendar", color: "yellow" };
              default:
                return { label: category, color: "gray" };
            }
          };

          const { label, color } = getCategoryInfo(category);

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-300`}
            >
              {label}
            </span>
          );
        },
        size: 120,
      },
      ...(showSubscriberAvailability
        ? [
            {
              accessorKey: "availableForSubscriber",
              header: "For Subscriber",
              cell: ({ row }) =>
                row.original?.availableForSubscriber ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Yes
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    No
                  </span>
                ),
              size: 110,
            },
          ]
        : []),
      {
        accessorKey: "variables",
        header: "Variables",
        cell: ({ row }) => {
          const variables = row.original?.variables || [];
          return (
            <SimpleTooltip text="View Template Variables">
              <button
                onClick={() => handleViewVariables(row.original)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  variables.length > 0
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 cursor-pointer"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-default"
                } transition-colors`}
              >
                <Code size={12} />
                {variables.length}
              </button>
            </SimpleTooltip>
          );
        },
        size: 100,
      },
      {
        accessorKey: "usedCount",
        header: "Used",
        cell: ({ row }) => {
          const usedCount = row.original?.usedCount || 0;
          return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <Users size={12} />
              {usedCount}
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original?.status;
          const getStatusInfo = (status) => {
            switch (status) {
              case "active":
                return { label: "Active", color: "green" };
              case "inactive":
                return { label: "Inactive", color: "red" };
              case "draft":
                return { label: "Draft", color: "yellow" };
              default:
                return { label: status, color: "gray" };
            }
          };

          const { label, color } = getStatusInfo(status);

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900 dark:text-${color}-300`}
            >
              {label}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "lastUsed",
        header: "Last Used",
        cell: ({ row }) => {
          const lastUsed = row.original?.lastUsed;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium dark-title-color">
                  {lastUsed ? helpers.dDate(lastUsed) : "Never"}
                </p>
                <p className="text-xs text-gray-500">
                  {lastUsed ? helpers.dTime(lastUsed) : ""}
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
        size: 140,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-1">
              <SimpleTooltip text="View Details">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Eye size={14} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Edit Template">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Duplicate Template">
                <button
                  onClick={() => handleDuplicate(item)}
                  className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  <Copy size={14} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Delete Template">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
    ],
    [
      selectedRows,
      toggleRowSelection,
      toggleAllRows,
      handleEdit,
      handleViewDetails,
      handleDuplicate,
      handleDelete,
      handleViewVariables,
      showSubscriberAvailability,
    ]
  );

  return columns;
};
