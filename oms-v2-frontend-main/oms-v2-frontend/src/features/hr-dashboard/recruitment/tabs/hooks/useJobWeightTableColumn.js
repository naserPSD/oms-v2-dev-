import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
export const useJobWeightTableColumn = ({ handleEdit, handleDelete }) => {
  return useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "jobTitle",
        header: "Weight Name",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original?.weightName}</p>
          </div>
        ),
      },
      {
        accessorKey: "weightValue",
        header: "Weight Value",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original?.weightValue}</p>
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const weight = row.original;
          return (
            <div className="gap-2 flex">
              <SimpleTooltip text="Edit">
                <button
                  onClick={() => handleEdit(weight)}
                  className="btn-action  text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              </SimpleTooltip>
              <SimpleTooltip text="Delete">
                <button
                  onClick={() => handleDelete(weight.id)}
                  className="btn-action  text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </SimpleTooltip>
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete],
  );
};
