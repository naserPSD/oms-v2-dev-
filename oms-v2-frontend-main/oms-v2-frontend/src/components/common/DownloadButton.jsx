import React from "react";
import { Download } from "lucide-react";
import ButtonTw from "@/components/ui/ButtonTw";

const DownloadButton = ({
  onClick,
  tooltip = "Download",
  className = "p-1.5 hover:text-emerald-600",
  disabled = false,
  isDownloading = false,
}) => {
  return (
    <ButtonTw
      variant="light"
      size="sm"
      iconOnly
      icon={
        <Download
          className={`w-3.5 h-3.5 text-emerald-500 ${
            isDownloading ? "animate-bounce" : ""
          }`}
        />
      }
      onClick={onClick}
      tooltip={tooltip}
      className={className}
      disabled={disabled || isDownloading}
    />
  );
};

export default DownloadButton;
