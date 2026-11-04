import { useMemo } from "react";
import SwitchButton from "@/components/ui/SwitchButton";
import ButtonTw from "@/components/ui/ButtonTw";
import { Pencil, Trash2 } from "lucide-react";

export const useCategoryTableColumns = ({
  canUpdate,
  canDelete,
  toggleActiveStatus,
  openEdit,
  handleDelete,
  isMaster = false,
  isSuperAdmin = false,
  selectedIds = [],
  handleSelectRow = () => {},
  handleSelectAll = () => {},
  categories = [],
  masterCategoryNames = [],
}) => {
  return useMemo(
    () => [

      {
        id: "select",
        size: 40,
        header: () => {
          const selectable = categories.filter(c => isMaster || !masterCategoryNames.includes(c.name));
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-40"
                checked={selectable.length > 0 && selectedIds.length === selectable.length}
                onChange={handleSelectAll}
                disabled={selectable.length === 0}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const isImportedDefault = masterCategoryNames.includes(row.original.name);
          const disabled = !isMaster && isImportedDefault;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                checked={selectedIds.includes(row.original.id || row.original._id)}
                onChange={() => handleSelectRow(row.original.id || row.original._id)}
                disabled={disabled}
                title={disabled ? "Default categories cannot be deleted" : ""}
              />
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 250,
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {category.name}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Details",
        size: 300,
        cell: ({ row }) => {
          const category = row.original;
          return (
            <span className="text-xs text-gray-500">
              {category.description || (isMaster ? "Default" : "No description")}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Active",
        size: 100,
        cell: ({ row }) => {
          const category = row.original;
          const isImportedDefault = masterCategoryNames.includes(category.name);
          const disabled = isMaster ? (!canUpdate || !isSuperAdmin) : (!canUpdate || isImportedDefault);
          return (
            <SwitchButton
              name={`active-${category.id}`}
              enabled={category.isActive !== false}
              enabledText="Yes"
              disabledText="No"
              disabled={disabled}
              onChange={() => toggleActiveStatus(category)}
            />
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        size: 150,
        enableSorting: false,
        cell: ({ row }) => {
          const category = row.original;
          const isImportedDefault = masterCategoryNames.includes(category.name);
          const showEdit = isMaster ? (canUpdate && isSuperAdmin) : (canUpdate && !isImportedDefault);
          const showDelete = isMaster ? (canDelete && isSuperAdmin) : (canDelete && !isImportedDefault);

          return (
            <div className="flex items-center justify-end gap-1">
              {showEdit && (
                <ButtonTw
                  variant="light"
                  size="sm"
                  iconOnly
                  icon={<Pencil className="w-4 h-4 text-amber-500" />}
                  onClick={() => openEdit(category)}
                  className="hover:text-amber-600"
                  tooltip="Edit"
                />
              )}
              {showDelete && (
                <ButtonTw
                  variant="light"
                  size="sm"
                  iconOnly
                  icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                  onClick={() => handleDelete(category)}
                  className="hover:text-rose-600"
                  tooltip="Delete"
                />
              )}
            </div>
          );
        },
      },
    ],
    [canUpdate, canDelete, isMaster, isSuperAdmin, toggleActiveStatus, openEdit, handleDelete, selectedIds, handleSelectRow, handleSelectAll, categories, masterCategoryNames]
  );
};
