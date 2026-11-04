import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

export const useEmployeeInvitationTableColumn = ({
  handleEdit,
  handleDelete,
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
        accessorKey: "email",
        header: "Employee Email",
        cell: ({ row }) => {
          const email = row.original?.email;
          return (
            <div>
              <p className="font-semibold dark-title-color">{email}</p>
              <SimpleTooltip text="Invitation Code">
                <p className="text-xs text-gray-500 text-left">
                  {row.original?.code}
                </p>
              </SimpleTooltip>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => {
          const designation = row.original?.designation;
          return (
            <div>
              <p className="font-semibold dark-title-color">
                {designation?.name || "-"}
              </p>
              {/* <p className="text-xs text-gray-500">
                Level: {designation?.level}
              </p> */}
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "office",
        header: "Office Info",
        cell: ({ row }) => {
          const office = row.original?.office;
          return (
            <div>
              <p className="font-semibold dark-title-color">{office?.name}</p>
              <p className="text-xs text-gray-500">
                {office?.officeType?.name}
              </p>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "office Shift",
        header: "Shift Info",
        cell: ({ row }) => {
          const shift = row.original?.shift;
          return (
            <>
              {shift ? (
                <div>
                  <p className="text-sm font-semibold dark-title-color">
                    <SimpleTooltip text={`Shift name`}>
                      {shift?.name}
                    </SimpleTooltip>
                  </p>
                  <SimpleTooltip
                    text={`Start: ${shift?.startTime} | End: ${shift?.endTime}`}
                  >
                    <p className="text-xs title-color text-left">
                      {helpers.dTime(shift?.startTime)} -{" "}
                      {helpers.dTime(shift?.endTime)}
                    </p>
                  </SimpleTooltip>
                </div>
              ) : (
                <p className="text-xs text-gray-400">-</p>
              )}
            </>
          );
        },
        size: 200,
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
        size: 50,
      },

      {
        accessorKey: "sentAt",
        header: "Sent Date",
        cell: ({ row }) => {
          const sentAt = row.original?.sentAt;
          return (
            <p className="text-xs">{sentAt ? helpers.dDate(sentAt) : "-"}</p>
          );
        },
        size: 50,
      },
      {
        accessorKey: "confirmedAt",
        header: "Confirmed Date",
        cell: ({ row }) => {
          const confirmedAt = row.original?.confirmedAt;
          return (
            <p className="text-xs">
              {confirmedAt ? helpers.dDate(confirmedAt) : "-"}
            </p>
          );
        },
        size: 50,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="action flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="btn-action text-blue-500 hover:text-blue-700"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="btn-action text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete]
  );
};
