import React from "react";
import { Paperclip } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";

const AttachmentButton = ({
  onClick,
  tooltip = "View Attachment",
  className = "p-1.5 hover:text-blue-600",
  disabled = false,
  badge,
}) => {
  return (
    <ButtonTw
      variant="light"
      size="sm"
      iconOnly
      icon={<Paperclip className="w-3.5 h-3.5 text-blue-500" />}
      onClick={onClick}
      tooltip={tooltip}
      className={className}
      disabled={disabled}
      badge={badge}
    />
  );
};

export default AttachmentButton;
