import React from "react";
import { Edit } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";

const EditButton = ({
  onClick,
  tooltip = "Edit",
  className = "p-1.5 hover:text-amber-600",
  disabled = false,
}) => {
  return (
    <ButtonTw
      variant="light"
      size="sm"
      iconOnly
      icon={<Edit className="w-3.5 h-3.5 text-amber-500" />}
      onClick={onClick}
      tooltip={tooltip}
      className={className}
      disabled={disabled}
    />
  );
};

export default EditButton;
