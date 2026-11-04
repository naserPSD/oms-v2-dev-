import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import SwitchButton from "@/components/ui/SwitchButton";

export const useServiceTableColumn = ({
  handleEdit,
  handleDelete,
  changeServiceActiveStatus,
  hasPermission,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
        cell: ({ row }) => row.index + 1,
      },

      {
        accessorKey: "name",
        header: "Name",
        size: 200,
        cell: ({ row }) => (
          <span className="font-medium">{row.original?.name}</span>
        ),
      },

      {
        accessorKey: "typeName",
        header: "Type",
        size: 160,
        // accessorFn: (row) => row.original?.typeName,
        filterFn: "includesString",
        cell: ({ row }) => {
          const type = row.original?.type;
          const typeName = row.original?.typeName;

          return (
            <span
              className={`badge badge-rounded ${
                type === "Technical"
                  ? "badge-outline-success"
                  : "badge-outline-primary"
              }`}
            >
              {typeName}
            </span>
          );
        },
      },

      {
        accessorKey: "isActive",
        header: "Active",
        size: 120,
        cell: ({ row }) => {
          const { id, isActive } = row.original;
          return (
            <div className="flex justify-center">
              <SwitchButton
                onClick={() => changeServiceActiveStatus(id)}
                enabled={isActive}
                enabledText="Yes"
                disabledText="No"
                className="!mb-0"
                disabled={
                  !hasPermission(
                    "settings.company_settings_product_&_service_list_edit",
                  )
                }
              />
            </div>
          );
        },
      },

      {
        accessorKey: "actions",
        header: "Actions",
        size: 100,
        enableSorting: false,
        cell: ({ row }) => {
          const service = row.original;

          return (
            <div className="flex justify-center gap-2">
              {hasPermission(
                "settings.company_settings_product_&_service_list_edit",
              ) && (
                <button
                  onClick={() => handleEdit(service)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission(
                "settings.company_settings_product_&_service_list_delete",
              ) && (
                <button
                  onClick={() => handleDelete(service.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, changeServiceActiveStatus],
  );
};
