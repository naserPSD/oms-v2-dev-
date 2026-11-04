import React from "react";
import { Trash2 } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";

const DeleteButton = ({
  onClick,
  tooltip = "Delete",
  className = "p-1.5 hover:text-rose-600",
  disabled = false,
}) => {
  return (
    <ButtonTw
      variant="light"
      size="sm"
      iconOnly
      icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
      onClick={onClick}
      tooltip={tooltip}
      className={className}
      disabled={disabled}
    />
  );
};

export default DeleteButton;
