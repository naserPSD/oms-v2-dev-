import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useMemo } from "react";

export const useEventsTableColumn = ({
  handleEdit,
  handleDelete,
  handleViewDetails,
  hasPermission,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "title",
        header: "Event Title",
        cell: ({ row }) => {
          const title = row.original?.title;
          return (
            <div>
              <p className="font-semibold dark-title-color">{title}</p>
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
            <SimpleTooltip text={description || "-"}>
              <p className="text-sm text-gray-600 line-clamp-2">
                {description || "-"}
              </p>
            </SimpleTooltip>
          );
        },
        size: 250,
      },
      {
        accessorKey: "eventType",
        header: "Event Type",
        cell: ({ row }) => {
          const eventType = row.original?.eventType;
          return (
            <div>
              <p className="font-semibold dark-title-color">
                {eventType?.name || "-"}
              </p>
              {/* <p className="text-xs text-gray-500">{eventType?.code || ""}</p> */}
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => {
          const department = row.original?.department;
          return (
            <div>
              <p className="font-semibold dark-title-color">
                {department?.name || "-"}
              </p>
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const location = row.original?.location;
          return (
            <SimpleTooltip text={location || "No location specified"}>
              <p className="text-sm">{location || "-"}</p>
            </SimpleTooltip>
          );
        },
        size: 150,
      },
      {
        accessorKey: "datetime",
        header: "Date & Time",
        cell: ({ row }) => {
          const startDatetime = row.original?.startDatetime;
          const endDatetime = row.original?.endDatetime;
          const isAllDay = row.original?.isAllDay;

          return (
            <div>
              <p className="text-sm font-semibold dark-title-color">
                {helpers.dDate(startDatetime)}
              </p>
              {!isAllDay && (
                <p className="text-xs text-gray-500">
                  {helpers.dTime(startDatetime)} - {helpers.dTime(endDatetime)}
                </p>
              )}
              {isAllDay && <p className="text-xs text-gray-500">All Day</p>}
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original?.status;

          return (
            <div className="text-center">
              <span
                className={`badge badge-pill badge-outline-${
                  status?.colorName || "secondary"
                }`}
              >
                {status?.name}
              </span>
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => {
          const createdAt = row.original?.createdAt;
          return (
            <p className="text-xs">
              {createdAt ? helpers.dDate(createdAt) : "-"}
            </p>
          );
        },
        size: 120,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="action flex gap-2">
              {/* View Button */}
              <SimpleTooltip text="View Details">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="btn-action text-green-500 hover:text-green-700 transition-colors"
                >
                  <Eye size={16} />
                </button>
              </SimpleTooltip>

              {hasPermission("hr.events_edit") && (
                <SimpleTooltip text="Edit Event">
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-action text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                </SimpleTooltip>
              )}
              {hasPermission("hr.events_delete") && (
                <SimpleTooltip text="Delete Event">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-action text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </SimpleTooltip>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleViewDetails],
  );
};
