import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export const getMasterAssetTypesTableColumns = ({ onEdit, onDelete }) => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      ),
      size: 40,
    },
    {
      id: "sl",
      header: () => <div className="text-center w-full">SL.</div>,
      size: 50,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "label",
      header: () => <div className="text-center w-full">Asset Type Name</div>,
      size: 800,
      cell: ({ row }) => {
        return <div className="font-medium text-center">{row.original.label}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center w-full">Actions</div>,
      size: 50,
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onEdit(row.original)}
              className="btn-action text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(row.original.value)}
              className="btn-action text-red-500 hover:text-red-700"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];
};
