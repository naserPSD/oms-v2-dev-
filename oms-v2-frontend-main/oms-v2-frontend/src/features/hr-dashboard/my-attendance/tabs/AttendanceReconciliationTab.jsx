"use client";

import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import { ModalTw } from "@/components/common/ModalTw";
import DataFilter from "@/components/common/DataFilter";
import Avatar from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMyAttendanceQuery,
  useRequestMyAttendanceReconciliation,
} from "@/hooks/queryApi/useMyAttendanceQuery";
import { useAuthStore } from "@/store/useAuthStore";
import helpers, { toaster } from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaChevronDown,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaPrint,
} from "react-icons/fa";
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  FileText,
} from "lucide-react";
import { z } from "zod";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";

applyPlugin(jsPDF);

const schema = z
  .object({
    requestType: z.enum(["check_in", "check_out", "both"]),
    requestedCheckInTime: z.string().optional(),
    requestedCheckOutTime: z.string().optional(),
    reason: z
      .string()
      .trim()
      .min(3, "Write why you are requesting reconciliation")
      .max(255, "Reason cannot be longer than 255 characters"),
  })
  .refine(
    (data) => {
      if (data.requestType === "check_in" || data.requestType === "both") {
        return Boolean(
          data.requestedCheckInTime && data.requestedCheckInTime.trim().length > 0,
        );
      }
      return true;
    },
    {
      message: "Requested check-in time is required",
      path: ["requestedCheckInTime"],
    },
  )
  .refine(
    (data) => {
      if (data.requestType === "check_out" || data.requestType === "both") {
        return Boolean(
          data.requestedCheckOutTime && data.requestedCheckOutTime.trim().length > 0,
        );
      }
      return true;
    },
    {
      message: "Requested check-out time is required",
      path: ["requestedCheckOutTime"],
    },
  );

const getStatusBadge = (code, label) => {
  const c = (code || label || "").toLowerCase();
  if (c.includes("approved") || c.includes("completed")) {
    return (
      <span className="whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="whitespace-nowrap">{label || "Approved"}</span>
      </span>
    );
  }
  if (c.includes("rejected")) {
    return (
      <span className="whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60 shadow-2xs">
        <XCircle className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
        <span className="whitespace-nowrap">{label || "Rejected"}</span>
      </span>
    );
  }
  if (c.includes("pending")) {
    return (
      <span className="whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60 shadow-2xs">
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="whitespace-nowrap">{label || "Pending"}</span>
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-gray-500 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
      <HelpCircle className="w-3 h-3 text-gray-400 shrink-0" />
      <span className="whitespace-nowrap">{label || "Not requested"}</span>
    </span>
  );
};

const formatTime12 = (value) => {
  if (!value) return "—";
  const text = String(value).trim();
  const twelveHour = text.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (twelveHour) {
    const hour = Number(twelveHour[1]) % 12 || 12;
    return `${hour}:${twelveHour[2]} ${twelveHour[3].toUpperCase()}`;
  }
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "—";
  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
};

const formatTimeTo24 = (timeStr) => {
  if (!timeStr) return "";
  const str = String(timeStr).trim();
  const twelveHour = str.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const min = twelveHour[2];
    const isPm = twelveHour[3].toUpperCase() === "PM";
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${min}`;
  }
  const match24 = str.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    return `${String(match24[1]).padStart(2, "0")}:${match24[2]}`;
  }
  return "";
};

const kindClass = (kind) => {
  if (kind === "Absent") {
    return "bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60";
  }
  if (kind === "Present") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";
  }
  return "bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
};

const getStatusText = (item) => {
  if (item?.inTimeStatus || item?.outTimeStatus) {
    const parts = [];
    if (item.inTimeStatus) parts.push(`In: ${item.inTimeStatus}`);
    if (item.outTimeStatus) parts.push(`Out: ${item.outTimeStatus}`);
    return parts.join(" | ");
  }
  if (item?.reconciliationStatus) {
    return item.reconciliationStatus;
  }
  if (item?.kind === "Present") {
    return "Present";
  }
  return "Not requested";
};

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "Late", label: "Late" },
  { value: "Absent", label: "Absent" },
  { value: "Present", label: "Present" },
];

const AttendanceReconciliationTab = () => {
  const { data, isLoading, isError } = useMyAttendanceQuery();
  const requestReconciliation = useRequestMyAttendanceReconciliation();
  const [selected, setSelected] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [kindFilter, setKindFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [showFilter, setShowFilter] = useState(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("showMyAttendanceReconFilter")) ||
      "show",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const authUser = useAuthStore((state) => state.user);
  const employee = data?.employee;
  const employeeName =
    employee?.name ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") ||
    authUser?.fullName ||
    "";
  const userProfilePic =
    authUser?.profile?.profilePicture?.fileUrl ||
    authUser?.userProfile?.profilePicture?.fileUrl ||
    "";

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const next = prev === "show" ? "hide" : "show";
      if (typeof window !== "undefined") {
        localStorage.setItem("showMyAttendanceReconFilter", next);
      }
      return next;
    });
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      requestType: "check_in",
      requestedCheckInTime: "09:00",
      requestedCheckOutTime: "18:00",
      reason: "",
    },
  });

  const requestType = watch("requestType");

  useEffect(() => {
    if (selected) {
      const defaultType = selected.kind === "Absent" ? "both" : "check_in";
      const checkIn24 =
        formatTimeTo24(selected.requestedInTime || selected.checkIn) || "09:00";
      const checkOut24 =
        formatTimeTo24(selected.requestedOutTime || selected.checkOut) || "18:00";

      reset({
        requestType: defaultType,
        requestedCheckInTime: checkIn24,
        requestedCheckOutTime: checkOut24,
        reason: selected.reason || "",
      });
    }
  }, [selected, reset]);

  const rows = useMemo(() => data?.list || [], [data?.list]);
  const approvers = data?.approvers || [];

  const summary = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (const item of rows) {
      const code = (
        item.reconciliationStatusCode ||
        item.inTimeStatusCode ||
        item.outTimeStatusCode ||
        ""
      ).toLowerCase();
      if (code.includes("approved") || code.includes("completed")) {
        approved++;
      } else if (code.includes("rejected")) {
        rejected++;
      } else if (code.includes("pending") || item.reconciliationId) {
        pending++;
      }
    }
    return {
      total: rows.length,
      pending,
      approved,
      rejected,
    };
  }, [rows]);

  const visibleRows = useMemo(() => {
    let list = rows;
    if (kindFilter) {
      list = list.filter((row) => row.kind === kindFilter);
    }
    if (Array.isArray(dateRange) && dateRange.length > 0) {
      const [start, end] = dateRange;
      if (start && end) {
        list = list.filter((row) => {
          if (!row.attendanceDate) return false;
          return row.attendanceDate >= start && row.attendanceDate <= end;
        });
      } else if (start) {
        list = list.filter((row) => {
          if (!row.attendanceDate) return false;
          return row.attendanceDate >= start;
        });
      } else if (end) {
        list = list.filter((row) => {
          if (!row.attendanceDate) return false;
          return row.attendanceDate <= end;
        });
      }
    }
    return list.map((item, index) => ({
      ...item,
      sl: index + 1,
    }));
  }, [rows, kindFilter, dateRange]);

  const hasActiveFilters = Boolean(
    kindFilter ||
      (Array.isArray(dateRange) &&
        dateRange.length > 0 &&
        dateRange.some((d) => Boolean(d))) ||
      globalFilter,
  );

  const handleResetFilters = useCallback(() => {
    setKindFilter("");
    setDateRange([]);
    setGlobalFilter("");
    setCurrentPage(1);
  }, []);

  const filterConfig = useMemo(
    () => [
      {
        component: "input",
        name: "search",
        label: "Search",
        placeholder: "Search remarks, reason...",
        className: "col-span-12 sm:col-span-6 lg:col-span-4",
      },
      {
        component: "select",
        name: "kind",
        label: "Select Type",
        options: TYPE_OPTIONS.filter((opt) => opt.value !== ""),
        placeholder: "Filter by Type",
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
      },
      {
        component: "datePicker",
        name: "dateRange",
        label: "Attendance Date (Range)",
        mode: "range",
        placeholder: "Select Date Range",
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
      },
      {
        component: "clear",
        className: "col-span-12 sm:col-span-6 lg:col-span-2 flex items-center justify-center mt-1.5",
      },
    ],
    [],
  );

  const filters = useMemo(
    () => ({
      search: globalFilter,
      kind: kindFilter,
      dateRange,
    }),
    [globalFilter, kindFilter, dateRange],
  );

  const handleFilterChange = useCallback((name, value) => {
    if (name === "search") {
      setGlobalFilter(value);
    } else if (name === "kind") {
      setKindFilter(value);
    } else if (name === "dateRange") {
      setDateRange(value);
    }
    setCurrentPage(1);
  }, []);

  const approverLabel = approvers
    .map((person) =>
      person.designation ? `${person.name} (${person.designation})` : person.name,
    )
    .join(", ");

  const handleExport = async (format) => {
    if (!visibleRows || visibleRows.length === 0) {
      toaster("No attendance records to export", "error");
      return;
    }

    setIsExporting(true);
    try {
      const empCodeStr = employee?.employeeCode ? `_${employee.employeeCode}` : "";
      const dateStr = new Date().toISOString().slice(0, 10);

      if (format === "excel") {
        const exportData = visibleRows.map((item) => ({
          SL: item.sl,
          Date: item.attendanceDate || "—",
          Type: item.kind || "—",
          "Check In": formatTime12(item.checkIn),
          "Check Out": formatTime12(item.checkOut),
          "Reconciliation In": item.requestedInTime
            ? formatTime12(item.requestedInTime)
            : "—",
          "Reconciliation Out": item.requestedOutTime
            ? formatTime12(item.requestedOutTime)
            : "—",
          Reason: item.reason || "—",
          Status: getStatusText(item),
          "Approved By": item.decidedBy
            ? `${item.decidedBy}${item.decidedByDesignation ? ` (${item.decidedByDesignation})` : ""}`
            : "—",
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws["!cols"] = [
          { wch: 6 },
          { wch: 14 },
          { wch: 10 },
          { wch: 12 },
          { wch: 12 },
          { wch: 18 },
          { wch: 18 },
          { wch: 32 },
          { wch: 22 },
          { wch: 24 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Reconciliation");
        XLSX.writeFile(
          wb,
          `Attendance_Reconciliation_Report${empCodeStr}_${dateStr}.xlsx`,
        );
        toaster(
          "Attendance reconciliation report exported to Excel successfully!",
          "success",
        );
      } else if (format === "pdf" || format === "print") {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(8, 145, 178);
        const appName =
          authUser?.appUser?.application?.name ||
          "AI Powered HR Management System (OMS)";
        doc.text(`${appName} — Attendance Reconciliation Report`, 40, 40);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(70, 70, 70);

        const empName = employee?.name || "N/A";
        const empCode = employee?.employeeCode ? ` · ${employee.employeeCode}` : "";
        doc.text(`Employee: ${empName}${empCode}`, 40, 58);

        if (approverLabel) {
          doc.text(`Approver: ${approverLabel}`, 40, 72);
        }

        const filterDateDesc =
          Array.isArray(dateRange) && dateRange[0]
            ? dateRange[1]
              ? `Date Range: ${dateRange[0]} to ${dateRange[1]}`
              : `From Date: ${dateRange[0]}`
            : "Date Range: All Dates";
        const filterTypeDesc = kindFilter ? `Type: ${kindFilter}` : "Type: All";

        doc.text(filterDateDesc, pageWidth - 40, 58, { align: "right" });
        doc.text(filterTypeDesc, pageWidth - 40, 72, { align: "right" });
        doc.text(
          `Generated: ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}`,
          pageWidth - 40,
          86,
          { align: "right" },
        );

        const tableColumns = [
          { header: "SL", dataKey: "sl" },
          { header: "Date", dataKey: "date" },
          { header: "Type", dataKey: "type" },
          { header: "Check In", dataKey: "checkIn" },
          { header: "Check Out", dataKey: "checkOut" },
          { header: "Reconciliation In / Out", dataKey: "recon" },
          { header: "Reason", dataKey: "reason" },
          { header: "Status", dataKey: "status" },
          { header: "Approved By", dataKey: "approvedBy" },
        ];

        const tableRows = visibleRows.map((item) => {
          let reconText = "—";
          if (item.requestedInTime || item.requestedOutTime) {
            const parts = [];
            if (item.requestedInTime)
              parts.push(`In: ${formatTime12(item.requestedInTime)}`);
            if (item.requestedOutTime)
              parts.push(`Out: ${formatTime12(item.requestedOutTime)}`);
            reconText = parts.join("\n");
          }

          return {
            sl: item.sl,
            date: item.attendanceDate || "—",
            type: item.kind || "—",
            checkIn: formatTime12(item.checkIn),
            checkOut: formatTime12(item.checkOut),
            recon: reconText,
            reason: item.reason || "—",
            status: getStatusText(item),
            approvedBy: item.decidedBy
              ? `${item.decidedBy}${item.decidedByDesignation ? `\n(${item.decidedByDesignation})` : ""}`
              : "—",
          };
        });

        doc.autoTable({
          startY: 100,
          columns: tableColumns,
          body: tableRows,
          theme: "grid",
          headStyles: {
            fillColor: [8, 145, 178],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: "bold",
            halign: "left",
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [40, 40, 40],
            cellPadding: 5,
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          columnStyles: {
            sl: { halign: "center", cellWidth: 35 },
            date: { halign: "center", cellWidth: 65 },
            type: { halign: "center", cellWidth: 55 },
            checkIn: { halign: "center", cellWidth: 60 },
            checkOut: { halign: "center", cellWidth: 60 },
            recon: { halign: "left", cellWidth: 95 },
            reason: { halign: "left" },
            status: { halign: "left", cellWidth: 90 },
            approvedBy: { halign: "left", cellWidth: 90 },
          },
          didDrawPage: (pageData) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
              `Page ${pageData.pageNumber} of ${pageCount}`,
              pageWidth / 2,
              pageHeight - 20,
              { align: "center" },
            );
          },
          margin: { left: 40, right: 40, top: 100, bottom: 40 },
        });

        if (format === "print") {
          doc.autoPrint();
          window.open(doc.output("bloburl"), "_blank");
        } else {
          doc.save(
            `Attendance_Reconciliation_Report${empCodeStr}_${dateStr}.pdf`,
          );
          toaster(
            "Attendance reconciliation report exported to PDF successfully!",
            "success",
          );
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toaster("Failed to export attendance reconciliation report", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-gray-500">
            {(currentPage - 1) * itemsPerPage + row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "attendanceDate",
        header: "Date",
        size: 150,
        cell: ({ row }) => {
          const dateStr = row.original.attendanceDate;
          if (!dateStr) return "—";
          const d = new Date(dateStr);
          const formatted = isNaN(d.getTime())
            ? dateStr
            : d.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
          const dayName = isNaN(d.getTime())
            ? ""
            : d.toLocaleDateString("en-US", { weekday: "short" });

          return (
            <div>
              <p className="font-semibold text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {formatted}
              </p>
              {dayName ? (
                <p className="text-[10px] text-gray-400 font-medium">{dayName}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "kind",
        header: "Type",
        size: 100,
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs whitespace-nowrap ${kindClass(
              row.original.kind,
            )}`}
          >
            {row.original.kind}
          </span>
        ),
      },
      {
        accessorKey: "checkIn",
        header: "Check In",
        size: 150,
        cell: ({ row }) => {
          const item = row.original;
          const time = formatTime12(item.checkIn);
          if (!item.checkIn || time === "—") {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }
          const isLate =
            item.kind === "Late" ||
            (item.checkInStatus?.code || item.checkInStatus?.name || "")
              .toLowerCase()
              .includes("late");

          if (isLate) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 whitespace-nowrap shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Late In:</span>
                <span className="font-mono font-bold tracking-tight">{time}</span>
              </span>
            );
          }

          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 whitespace-nowrap shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>In:</span>
              <span className="font-mono font-bold tracking-tight">{time}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "checkOut",
        header: "Check Out",
        size: 140,
        cell: ({ row }) => {
          const item = row.original;
          const time = formatTime12(item.checkOut);
          if (!item.checkOut || time === "—") {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }

          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60 whitespace-nowrap shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Out:</span>
              <span className="font-mono font-bold tracking-tight">{time}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "reconciliationTime",
        header: "Reconciliation In / Out",
        size: 170,
        cell: ({ row }) => {
          const { requestedInTime, requestedOutTime } = row.original;
          if (!requestedInTime && !requestedOutTime) {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }
          return (
            <div className="flex flex-col gap-1 text-xs">
              {requestedInTime ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primaryColor/10 text-primaryColor dark:bg-primaryColor/20 dark:text-primaryColor-300 border border-primaryColor/20 whitespace-nowrap shadow-2xs">
                  <Clock className="w-3 h-3 text-primaryColor dark:text-primaryColor-400 shrink-0" />
                  <span>Req In:</span>
                  <span className="font-mono font-bold">
                    {formatTime12(requestedInTime)}
                  </span>
                </span>
              ) : null}
              {requestedOutTime ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60 whitespace-nowrap shadow-2xs">
                  <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>Req Out:</span>
                  <span className="font-mono font-bold">
                    {formatTime12(requestedOutTime)}
                  </span>
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        size: 180,
        cell: ({ row }) => {
          const item = row.original;
          const hasReason = Boolean(item.reason && item.reason.trim());
          const hasReconciliation = Boolean(
            item.reconciliationId ||
              item.requestedInTime ||
              item.requestedOutTime ||
              item.inTimeStatus ||
              item.outTimeStatus,
          );

          if (!hasReason && !hasReconciliation) {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }

          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDetailsItem(item);
              }}
              className="group inline-flex items-center gap-1.5 text-left max-w-48 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-primaryColor/10 dark:bg-gray-800/60 dark:hover:bg-primaryColor-950/40 border border-gray-200/60 hover:border-primaryColor/30 dark:border-gray-700/60 dark:hover:border-primaryColor-700/60 transition-all cursor-pointer text-xs shadow-2xs"
              title="Click to view full reconciliation details"
            >
              <span className="truncate font-medium text-gray-700 dark:text-gray-200 group-hover:text-primaryColor dark:group-hover:text-primaryColor-400">
                {hasReason ? item.reason : "View details"}
              </span>
              <Eye className="w-3.5 h-3.5 shrink-0 text-primaryColor dark:text-primaryColor-400 group-hover:scale-110 transition-transform" />
            </button>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 170,
        cell: ({ row }) => {
          const item = row.original;
          if (item.inTimeStatus || item.outTimeStatus) {
            return (
              <div className="flex flex-col gap-1 items-start whitespace-nowrap">
                {item.inTimeStatus
                  ? getStatusBadge(item.inTimeStatusCode, `In: ${item.inTimeStatus}`)
                  : null}
                {item.outTimeStatus
                  ? getStatusBadge(
                      item.outTimeStatusCode,
                      `Out: ${item.outTimeStatus}`,
                    )
                  : null}
              </div>
            );
          }
          if (item.reconciliationStatus) {
            return (
              <div className="whitespace-nowrap">
                {getStatusBadge(
                  item.reconciliationStatusCode,
                  item.reconciliationStatus,
                )}
              </div>
            );
          }
          if (item.kind === "Present") {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }
          return (
            <div className="whitespace-nowrap">
              {getStatusBadge("", "Not requested")}
            </div>
          );
        },
      },
      {
        accessorKey: "decidedBy",
        header: "Approved By",
        size: 160,
        cell: ({ row }) => {
          const item = row.original;
          if (!item.decidedBy)
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Avatar
                text={helpers.avatarText(item.decidedBy)}
                value={item.decidedBy}
                alt={item.decidedBy}
                color="primary"
                size="sm"
              />
              <div className="whitespace-nowrap">
                <p className="font-semibold text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {item.decidedBy}
                </p>
                {item.decidedByDesignation ? (
                  <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {item.decidedByDesignation}
                  </p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Action",
        size: 140,
        cell: ({ row }) => {
          const item = row.original;
          if (item.kind === "Present") {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }
          if (item.canRequest) {
            return (
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="whitespace-nowrap inline-flex items-center justify-center rounded-full bg-primaryColor hover:bg-primaryColor-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
              >
                {item.reconciliationId ? "Update Reason" : "Reconciliation"}
              </button>
            );
          }
          return (
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Closed</span>
          );
        },
      },
    ],
    [currentPage, itemsPerPage],
  );

  const paginationState = useMemo(
    () => ({
      pageIndex: currentPage - 1,
      pageSize: itemsPerPage,
    }),
    [currentPage, itemsPerPage],
  );

  const table = useReactTable({
    data: visibleRows,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: (val) => {
      setGlobalFilter(val);
      setCurrentPage(1);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const onSubmit = async (values) => {
    if (!selected?.attendanceId) return;
    try {
      await requestReconciliation.mutateAsync({
        attendanceId: selected.attendanceId,
        reason: values.reason,
        requestType: values.requestType,
        requestedCheckInTime:
          values.requestType === "check_in" || values.requestType === "both"
            ? `${values.requestedCheckInTime}:00`
            : null,
        requestedCheckOutTime:
          values.requestType === "check_out" || values.requestType === "both"
            ? `${values.requestedCheckOutTime}:00`
            : null,
      });
      toaster("Reconciliation request submitted successfully");
      setSelected(null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Could not save the reconciliation request";
      toaster(Array.isArray(message) ? message[0] : message, "error");
    }
  };

  return (
    <div>
      {/* Header Info with Profile Avatar & Actions */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar
            image={userProfilePic}
            text={helpers.avatarText(employeeName)}
            value={employeeName}
            alt={employeeName}
            color="primary"
            size="lg"
            ring={!userProfilePic}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {employeeName || "Attendance Reconciliation"}
              </h1>
              {employee?.employeeCode && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primaryColor/10 text-primaryColor dark:bg-primaryColor/20 dark:text-primaryColor-300 border border-primaryColor/20">
                  {employee.employeeCode}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Attendance Reconciliation — Request reconciliation for your late or absent attendance
            </p>
            {approverLabel ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Approver: {approverLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={!visibleRows.length || isExporting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors shadow-2xs cursor-pointer"
              >
                <FaDownload className="h-3.5 w-3.5 text-primaryColor dark:text-primaryColor-400" />
                <span>{isExporting ? "Exporting..." : "Export"}</span>
                <FaChevronDown className="h-2.5 w-2.5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-100">
              <DropdownMenuItem
                onClick={() => handleExport("excel")}
                disabled={isExporting}
                className="cursor-pointer gap-2"
              >
                <FaFileExcel className="h-4 w-4 text-emerald-600" />
                <span>Export to Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                className="cursor-pointer gap-2"
              >
                <FaFilePdf className="h-4 w-4 text-red-600" />
                <span>Export to PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("print")}
                disabled={isExporting}
                className="cursor-pointer gap-2"
              >
                <FaPrint className="h-4 w-4 text-blue-600" />
                <span>Print Report</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2 p-2"
            >
              <FaFilter className="w-3.5 h-3.5" />
            </ButtonTw>
          </SimpleTooltip>
        </div>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-sm text-gray-500">
          Loading reconciliation records...
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Could not load reconciliation records.
        </div>
      )}

      {!isLoading && !isError && data && !data.isEmployee && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          Attendance Reconciliation is available only when this account is linked to an employee.
        </div>
      )}

      {!isLoading && !isError && data?.isEmployee && (
        <>
          {/* 1. Standard DataFilter Bar */}
          <DataFilter
            showFilter={showFilter === "show"}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleResetFilters}
            filterConfig={filterConfig}
            hasActiveFilters={hasActiveFilters}
          />

          {/* 2. Summary KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Total Records
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.total}
                </span>
                <span className="text-xs text-gray-400">days</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pending Approval
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {summary.pending}
                </span>
                <span className="text-xs text-amber-600/70">requests</span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Approved
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {summary.approved}
                </span>
                <span className="text-xs text-emerald-600/70">requests</span>
              </div>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5 shadow-xs dark:border-red-900/40 dark:bg-red-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-red-700 dark:text-red-400">
                Rejected
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {summary.rejected}
                </span>
                <span className="text-xs text-red-600/70">requests</span>
              </div>
            </div>
          </div>

          {/* 3. Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-900">
            <div className="p-4 overflow-x-auto">
              <CommonTable
                table={table}
                columns={columns}
                itemsPerPage={itemsPerPage}
              />
            </div>

            {/* Pagination Component */}
            <div className="border-t border-gray-100 p-4 dark:border-gray-800">
              <Pagination
                currentPage={currentPage}
                totalItems={visibleRows.length}
                resultRows={table.getRowModel().rows.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(newPage) => {
                  setCurrentPage(newPage);
                  table.setPageIndex(newPage - 1);
                }}
                onItemsPerPageChange={(newLimit) => {
                  setItemsPerPage(newLimit);
                  setCurrentPage(1);
                  table.setPageSize(newLimit);
                  table.setPageIndex(0);
                }}
                showItemsPerPage={true}
                showResultInfo={true}
              />
            </div>
          </div>
        </>
      )}

      {/* Modal for Reconciliation */}
      <ModalTw
        show={Boolean(selected)}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={
          selected?.reconciliationId
            ? "Update Attendance Reconciliation"
            : "Request Attendance Reconciliation"
        }
        size="md"
        showFooter={false}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/60">
            <Avatar
              image={userProfilePic}
              text={helpers.avatarText(employeeName)}
              value={employeeName}
              alt={employeeName}
              color="primary"
              size="md"
              ring={!userProfilePic}
            />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {employeeName}
              </p>
              {employee?.employeeCode && (
                <p className="text-[10px] text-gray-400 font-medium">
                  {employee.employeeCode}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3.5 text-xs text-gray-600 border border-gray-200/70 dark:bg-gray-800/60 dark:border-gray-700/60 dark:text-gray-300 space-y-1.5">
            <p className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Date:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
                {selected?.attendanceDate}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Type:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${kindClass(
                  selected?.kind,
                )}`}
              >
                {selected?.kind}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Recorded Times:</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                {formatTime12(selected?.checkIn)} / {formatTime12(selected?.checkOut)}
              </span>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Request Type
            </label>
            <select
              {...register("requestType")}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-cyan-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="check_in">Check In</option>
              <option value="check_out">Check Out</option>
              <option value="both">Both (Check In & Out)</option>
            </select>
          </div>

          {(requestType === "check_in" || requestType === "both") && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Requested Check-in Time
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="time"
                step="60"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primaryColor dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                {...register("requestedCheckInTime")}
              />
              {errors.requestedCheckInTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.requestedCheckInTime.message}
                </p>
              )}
            </div>
          )}

          {(requestType === "check_out" || requestType === "both") && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Requested Check-out Time
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="time"
                step="60"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primaryColor dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                {...register("requestedCheckOutTime")}
              />
              {errors.requestedCheckOutTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.requestedCheckOutTime.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Reason for reconciliation
              <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              maxLength={255}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primaryColor dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="State the reason why check-in/out needs to be reconciled"
              {...register("reason")}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestReconciliation.isPending}
              className="rounded-full bg-primaryColor px-4 py-1.5 text-xs font-semibold text-white hover:bg-primaryColor-700 disabled:opacity-60 shadow-2xs transition-colors cursor-pointer"
            >
              {requestReconciliation.isPending ? "Saving..." : "Submit Request"}
            </button>
          </div>
        </form>
      </ModalTw>

      {/* Modal for Viewing Full Reconciliation Details */}
      <ModalTw
        show={Boolean(detailsItem)}
        isOpen={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        title="Attendance Reconciliation Details"
        size="md"
        showFooter={false}
      >
        {detailsItem && (
          <div className="space-y-4">
            {/* Top Date & Kind Header */}
            <div className="rounded-xl bg-linear-to-r from-primaryColor/10 via-primaryColor-400/10 to-transparent p-3.5 border border-primaryColor/20">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Avatar
                    image={userProfilePic}
                    text={helpers.avatarText(employeeName)}
                    value={employeeName}
                    alt={employeeName}
                    color="primary"
                    size="md"
                    ring={!userProfilePic}
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {detailsItem.attendanceDate
                        ? (() => {
                            const d = new Date(detailsItem.attendanceDate);
                            return isNaN(d.getTime())
                              ? detailsItem.attendanceDate
                              : d.toLocaleDateString("en-GB", {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                });
                          })()
                        : "—"}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      Attendance Date · {employeeName}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs whitespace-nowrap ${kindClass(
                    detailsItem.kind,
                  )}`}
                >
                  {detailsItem.kind}
                </span>
              </div>
            </div>

            {/* Recorded vs Requested Times Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Check-In Card */}
              <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-3.5 bg-gray-50/70 dark:bg-gray-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primaryColor dark:text-primaryColor-400" />
                    Check In Time
                  </span>
                  {detailsItem.inTimeStatus && (
                    getStatusBadge(
                      detailsItem.inTimeStatusCode,
                      detailsItem.inTimeStatus,
                    )
                  )}
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[11px]">Recorded:</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                      {formatTime12(detailsItem.checkIn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[11px]">Requested:</span>
                    <span className="font-mono font-bold text-primaryColor dark:text-primaryColor-400">
                      {detailsItem.requestedInTime
                        ? formatTime12(detailsItem.requestedInTime)
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-Out Card */}
              <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-3.5 bg-gray-50/70 dark:bg-gray-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Check Out Time
                  </span>
                  {detailsItem.outTimeStatus && (
                    getStatusBadge(
                      detailsItem.outTimeStatusCode,
                      detailsItem.outTimeStatus,
                    )
                  )}
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[11px]">Recorded:</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                      {formatTime12(detailsItem.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-[11px]">Requested:</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      {detailsItem.requestedOutTime
                        ? formatTime12(detailsItem.requestedOutTime)
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primaryColor dark:text-primaryColor-400" />
                Reason for Reconciliation
              </label>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 bg-white dark:bg-gray-900/80 text-xs text-gray-800 dark:text-gray-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {detailsItem.reason ? (
                  detailsItem.reason
                ) : (
                  <span className="text-gray-400 italic">
                    No reason provided for this record.
                  </span>
                )}
              </div>
            </div>

            {/* Approval / Decision Information */}
            <div className="rounded-xl border border-gray-200/80 dark:border-gray-700/80 p-3 bg-gray-50/50 dark:bg-gray-800/40 text-xs flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Decision By</p>
                <div className="flex items-center gap-2 mt-1">
                  {detailsItem.decidedBy ? (
                    <Avatar
                      text={helpers.avatarText(detailsItem.decidedBy)}
                      value={detailsItem.decidedBy}
                      alt={detailsItem.decidedBy}
                      color="primary"
                      size="sm"
                    />
                  ) : null}
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {detailsItem.decidedBy || "Pending Review"}
                    {detailsItem.decidedByDesignation
                      ? ` (${detailsItem.decidedByDesignation})`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Status</p>
                <div>
                  {detailsItem.reconciliationStatus
                    ? getStatusBadge(
                        detailsItem.reconciliationStatusCode,
                        detailsItem.reconciliationStatus,
                      )
                    : getStatusBadge("", "Not requested")}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setDetailsItem(null)}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              {detailsItem.canRequest && (
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = detailsItem;
                    setDetailsItem(null);
                    setSelected(itemToEdit);
                  }}
                  className="rounded-full bg-primaryColor hover:bg-primaryColor-700 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                >
                  {detailsItem.reconciliationId ? "Update Reason" : "Reconciliation"}
                </button>
              )}
            </div>
          </div>
        )}
      </ModalTw>
    </div>
  );
};

export default AttendanceReconciliationTab;
