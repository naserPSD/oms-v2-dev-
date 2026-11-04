import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";

const TableActions = ({
  item,
  canView = true,
  canUpdate = true,
  canDelete = true,
  onView,
  onEdit,
  onDelete,
  viewTooltip = "View",
  editTooltip = "Edit",
  deleteTooltip = "Delete",
}) => {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {canView && onView && (
        <ButtonTw
          variant="light"
          size="sm"
          iconOnly
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => onView(item)}
          tooltip={viewTooltip}
          className="p-1.5"
        />
      )}

      {canUpdate && onEdit && (
        <ButtonTw
          variant="light"
          size="sm"
          iconOnly
          icon={<Edit className="w-3.5 h-3.5 text-amber-500" />}
          onClick={() => onEdit(item)}
          tooltip={editTooltip}
          className="p-1.5 hover:text-amber-600"
        />
      )}

      {canDelete && onDelete && (
        <ButtonTw
          variant="light"
          size="sm"
          iconOnly
          icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
          onClick={() => onDelete(item)}
          tooltip={deleteTooltip}
          className="p-1.5 hover:text-rose-600"
        />
      )}
    </div>
  );
};

export default TableActions;
