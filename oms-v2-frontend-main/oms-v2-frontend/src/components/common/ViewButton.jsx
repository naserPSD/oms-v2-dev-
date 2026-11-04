import React from "react";
import { Eye } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";

const ViewButton = ({
  onClick,
  tooltip = "View",
  className = "p-1.5",
  disabled = false,
}) => {
  return (
    <ButtonTw
      variant="light"
      size="sm"
      iconOnly
      icon={<Eye className="w-3.5 h-3.5" />}
      onClick={onClick}
      tooltip={tooltip}
      className={className}
      disabled={disabled}
    />
  );
};

export default ViewButton;
