// hooks/useEmailBroadcastTableColumn.tsx
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import {
  Calendar,
  CheckCircle,
  CheckSquare,
  Eye,
  Paperclip,
  Pencil,
  Square,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

export const useEmailBroadcastTableColumn = ({
  handleEdit,
  handleViewDetails,
  handleDelete,
  selectedRows,
  toggleRowSelection,
  toggleAllRows,
  onViewAttachments,
  onViewRecipients,
  onViewBounced,
  onViewReceived,
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
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => {
          const subject = row.original?.subject;
          return (
            <div className="max-w-[300px]">
              <SimpleTooltip text={subject}>
                <p className="font-semibold dark-title-color text-sm truncate">
                  {subject}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: "attachments",
        header: "Attachments",
        cell: ({ row }) => {
          const attachmentsCount = row.original?.attachments || 0;
          return (
            <SimpleTooltip text="View Attachments">
              <button
                onClick={() => onViewAttachments(row.original)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  attachmentsCount > 0
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-default"
                } transition-colors`}
              >
                <Paperclip size={12} />
                {attachmentsCount}
              </button>
            </SimpleTooltip>
          );
        },
        size: 100,
      },
      {
        accessorKey: "recipients",
        header: "Recipients",
        cell: ({ row }) => {
          const recipientsCount = row.original?.recipients || 0;
          return (
            <SimpleTooltip text="View All Recipients">
              <button
                onClick={() => onViewRecipients(row.original)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer transition-colors"
              >
                <Users size={12} />
                {recipientsCount}
              </button>
            </SimpleTooltip>
          );
        },
        size: 100,
      },
      {
        accessorKey: "bounced",
        header: "Bounced",
        cell: ({ row }) => {
          const bouncedCount = row.original?.bounced || 0;
          return (
            <SimpleTooltip text="View Bounced Emails">
              <button
                onClick={() => onViewBounced(row.original)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  bouncedCount > 0
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-default"
                } transition-colors`}
              >
                <XCircle size={12} />
                {bouncedCount}
              </button>
            </SimpleTooltip>
          );
        },
        size: 80,
      },
      {
        accessorKey: "received",
        header: "Received",
        cell: ({ row }) => {
          const receivedCount = row.original?.received || 0;
          return (
            <SimpleTooltip text="View Received Emails">
              <button
                onClick={() => onViewReceived(row.original)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  receivedCount > 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-default"
                } transition-colors`}
              >
                <CheckCircle size={12} />
                {receivedCount}
              </button>
            </SimpleTooltip>
          );
        },
        size: 80,
      },
      {
        accessorKey: "recipientType",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original?.recipientType;
          const getTypeInfo = (type) => {
            switch (type) {
              case "all":
                return { label: "All Users", color: "blue" };
              case "selected":
                return { label: "Selected", color: "green" };
              case "custom":
                return { label: "Custom", color: "purple" };
              default:
                return { label: type, color: "gray" };
            }
          };

          const { label, color } = getTypeInfo(type);

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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original?.status;
          const getStatusInfo = (status) => {
            switch (status) {
              case "sent":
                return { label: "Sent", color: "green" };
              case "draft":
                return { label: "Draft", color: "yellow" };
              case "scheduled":
                return { label: "Scheduled", color: "blue" };
              case "failed":
                return { label: "Failed", color: "red" };
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
        accessorKey: "sentAt",
        header: "Sent At",
        cell: ({ row }) => {
          const sentAt = row.original?.sentAt;
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium dark-title-color">
                  {sentAt ? helpers.dDate(sentAt) : "Not Sent"}
                </p>
                <p className="text-xs text-gray-500">
                  {sentAt ? helpers.dTime(sentAt) : ""}
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
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-1">
              {/* 🔥 View Details Button - Opens View Modal */}
              <SimpleTooltip text="View Details">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-800/20 cursor-pointer rounded-lg transition-colors"
                >
                  <Eye size={14} />
                </button>
              </SimpleTooltip>

              {/* Edit Button - Opens Edit Modal */}
              <SimpleTooltip text="Edit Email">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-90 cursor-pointer0/20 rounded-lg transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </SimpleTooltip>

              <SimpleTooltip text="Delete Email">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rou cursor-pointernded-lg transition-colors"
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
      handleDelete,
      onViewAttachments,
      onViewRecipients,
      onViewBounced,
      onViewReceived,
    ]
  );

  return columns;
};
