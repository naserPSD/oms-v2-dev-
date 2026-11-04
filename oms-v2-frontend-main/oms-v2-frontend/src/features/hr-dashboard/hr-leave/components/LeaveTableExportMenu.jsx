"use client";

import { useEffect, useRef, useState } from "react";
import ButtonTw from "@/components/ui/ButtonTw";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaChevronDown, FaDownload, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";
import { exportLeaveTable } from "../utils/leaveTableExport";

const LeaveTableExportMenu = ({
  title,
  data = [],
  variant = "leaveRequest",
  leaveTypeDataArray = [],
  disabled = false,
  /** Inside ModalTw: local dropdown (no portal) so menu shows correctly */
  inModal = false,
}) => {
  const authUser = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isDisabled = disabled || loading || !data?.length;

  const runExport = (format) => {
    if (isDisabled) return;

    setLoading(true);
    setOpen(false);
    try {
      exportLeaveTable({
        format,
        title,
        data,
        variant,
        leaveTypeDataArray,
        authUser,
      });
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!inModal || !open) return;

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [inModal, open]);

  // Modal-safe dropdown: stays in modal DOM tree (no Radix portal)
  if (inModal) {
    return (
      <div className="relative inline-block text-left" ref={menuRef}>
        <ButtonTw
          type="button"
          variant="alternative"
          className="gap-2"
          disabled={isDisabled}
          loading={loading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDisabled) setOpen((prev) => !prev);
          }}
        >
          <FaDownload />
          Export
          <FaChevronDown className="text-xs opacity-70" />
        </ButtonTw>

        {open && (
          <div
            className="absolute right-0 top-full mt-1 z-[120] w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                runExport("excel");
              }}
            >
              <FaFileExcel className="text-green-600" />
              Export Excel
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                runExport("pdf");
              }}
            >
              <FaFilePdf className="text-red-600" />
              Export PDF
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                runExport("print");
              }}
            >
              <FaPrint className="text-blue-600" />
              Print
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ButtonTw
          type="button"
          variant="alternative"
          className="gap-2"
          disabled={isDisabled}
          loading={loading}
        >
          <FaDownload />
          Export
        </ButtonTw>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 z-[100]">
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => runExport("excel")}
        >
          <FaFileExcel className="mr-2 text-green-600" />
          Export Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => runExport("pdf")}
        >
          <FaFilePdf className="mr-2 text-red-600" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => runExport("print")}
        >
          <FaPrint className="mr-2 text-blue-600" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeaveTableExportMenu;
