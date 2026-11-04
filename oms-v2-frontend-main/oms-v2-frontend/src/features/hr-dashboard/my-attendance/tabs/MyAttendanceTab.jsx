"use client";

import CommonTable from "@/components/common/CommonTable";
import Pagination from "@/components/common/Pagination";
import DataFilter from "@/components/common/DataFilter";
import Avatar from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyAttendanceHistoryQuery } from "@/hooks/queryApi/useMyAttendanceQuery";
import { useAuthStore } from "@/store/useAuthStore";
import helpers, { toaster } from "@/utils/helpers";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
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
  Timer,
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarDays,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";

applyPlugin(jsPDF);

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Present", label: "Present" },
  { value: "Late", label: "Late" },
  { value: "Absent", label: "Absent" },
  { value: "Weekend", label: "Weekend" },
  { value: "Holiday", label: "Holiday" },
  { value: "Leave", label: "Leave" },
];

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

const formatDuration = (hoursNum) => {
  if (!hoursNum || isNaN(hoursNum) || Number(hoursNum) === 0) return "—";
  const num = Number(hoursNum);
  const hrs = Math.floor(num);
  const mins = Math.round((num - hrs) * 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} hrs`;
  return `${mins} mins`;
};

const getStatusBadge = (attendanceStatus, checkInStatus) => {
  const code = (attendanceStatus?.code || attendanceStatus?.name || "").toLowerCase();
  const isLate = (checkInStatus?.code || checkInStatus?.name || "").toLowerCase().includes("late");

  if (code.includes("absent")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
        <XCircle className="w-3 h-3" />
        Absent
      </span>
    );
  }

  if (isLate) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
        <AlertCircle className="w-3 h-3" />
        Late
      </span>
    );
  }

  if (code.includes("holiday") || code.includes("weekend")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
        <CalendarDays className="w-3 h-3" />
        {attendanceStatus?.name || "Off Day"}
      </span>
    );
  }

  if (code.includes("leave")) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
        Leave
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
      <CheckCircle2 className="w-3 h-3" />
      Present
    </span>
  );
};

const MyAttendanceTab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authUser = useAuthStore((state) => state.user);

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialLimit = Number(searchParams.get("limit")) || 10;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("showMyAttendanceFilter")) ||
      "show",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [sorting, setSorting] = useState([]);

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const next = prev === "show" ? "hide" : "show";
      if (typeof window !== "undefined") {
        localStorage.setItem("showMyAttendanceFilter", next);
      }
      return next;
    });
  }, []);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
    };
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (Array.isArray(dateRange) && dateRange.length > 0) {
      if (dateRange[0]) params.startDate = dateRange[0];
      if (dateRange[1]) params.endDate = dateRange[1];
    }
    if (search.trim()) {
      params.search = search.trim();
    }
    return params;
  }, [page, limit, statusFilter, dateRange, search]);

  const { data: responseData, isLoading, isError } =
    useMyAttendanceHistoryQuery(queryParams);

  const list = useMemo(() => responseData?.data || [], [responseData?.data]);
  const total = useMemo(() => {
    return (
      responseData?.pagination?.total ??
      responseData?.total ??
      responseData?.summary?.totalDays ??
      (Array.isArray(list) ? list.length : 0)
    );
  }, [responseData, list]);
  const summary = responseData?.summary || {};
  const employee = responseData?.employee;
  const employeeName =
    employee?.name ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") ||
    authUser?.fullName ||
    "";
  const userProfilePic =
    authUser?.profile?.profilePicture?.fileUrl ||
    authUser?.userProfile?.profilePicture?.fileUrl ||
    "";

  const updateUrlParams = useCallback(
    (newPage, newLimit) => {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "my-attendance");
      url.searchParams.set("page", String(newPage));
      url.searchParams.set("limit", String(newLimit));
      window.history.replaceState(null, "", url.pathname + url.search);
      router.push(url.pathname + url.search, { scroll: false });
    },
    [router],
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateUrlParams(newPage, limit);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(1, newLimit);
  };

  const handleResetFilters = useCallback(() => {
    setStatusFilter("");
    setDateRange([]);
    setSearch("");
    setPage(1);
    updateUrlParams(1, limit);
  }, [limit, updateUrlParams]);

  const hasActiveFilters = Boolean(
    statusFilter ||
      (Array.isArray(dateRange) && dateRange.some(Boolean)) ||
      search.trim(),
  );

  const filterConfig = useMemo(
    () => [
      {
        component: "input",
        name: "search",
        label: "Search",
        placeholder: "Search remarks, note...",
        className: "col-span-12 sm:col-span-6 lg:col-span-4",
      },
      {
        component: "select",
        name: "status",
        label: "Select Status",
        options: STATUS_OPTIONS.filter((opt) => opt.value !== ""),
        placeholder: "Filter by Status",
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
      },
      {
        component: "datePicker",
        name: "dateRange",
        label: "Date Range",
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
      search,
      status: statusFilter,
      dateRange,
    }),
    [search, statusFilter, dateRange],
  );

  const handleFilterChange = useCallback((name, value) => {
    if (name === "search") {
      setSearch(value);
    } else if (name === "status") {
      setStatusFilter(value);
    } else if (name === "dateRange") {
      setDateRange(value);
    }
    setPage(1);
  }, []);

  // Table Columns (NOTE: NO EMPLOYEE NAME column, as requested: "name dorkar nai")
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-gray-500">
            {(page - 1) * limit + row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "attendanceDate",
        header: "Date",
        size: 140,
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
              <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
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
        accessorKey: "checkIn",
        header: "Check In",
        size: 150,
        cell: ({ row }) => {
          const item = row.original;
          const time = formatTime12(item.checkIn);
          if (!item.checkIn || time === "—") {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }
          const isLate = (item.checkInStatus?.code || item.checkInStatus?.name || "")
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
        accessorKey: "workedHour",
        header: "Working Hours",
        size: 140,
        cell: ({ row }) => {
          const hours = Number(row.original.workedHour) || 0;
          if (hours <= 0) {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }

          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60 whitespace-nowrap shadow-2xs">
              <Timer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-mono font-bold tracking-tight">
                {formatDuration(hours)}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "overtimeHours",
        header: "Overtime",
        size: 130,
        cell: ({ row }) => {
          const ot = Number(row.original.overtimeHours) || 0;
          if (ot <= 0) {
            return <span className="text-gray-400 text-xs font-medium">—</span>;
          }

          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60 whitespace-nowrap shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-mono font-bold tracking-tight">+{ot} hrs</span>
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 110,
        cell: ({ row }) => {
          return getStatusBadge(
            row.original.attendanceStatus,
            row.original.checkInStatus,
          );
        },
      },
      {
        accessorKey: "shift",
        header: "Shift",
        size: 130,
        cell: ({ row }) => {
          const shift = row.original.shift;
          if (!shift?.name) return <span className="text-gray-400 text-xs">—</span>;
          return (
            <div className="text-xs">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {shift.name}
              </p>
              {shift.startTime && shift.endTime ? (
                <p className="text-[10px] text-gray-400 font-mono">
                  {formatTime12(shift.startTime)} - {formatTime12(shift.endTime)}
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "remarks",
        header: "Remarks / Note",
        size: 160,
        cell: ({ row }) => {
          const item = row.original;
          const note = item.lateReason || item.remarks || "—";
          return (
            <span
              className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 max-w-40"
              title={note !== "—" ? note : ""}
            >
              {note}
            </span>
          );
        },
      },
    ],
    [page, limit],
  );

  const table = useReactTable({
    data: list,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = async (format) => {
    if (!list || list.length === 0) {
      toaster("No attendance history to export", "error");
      return;
    }

    setIsExporting(true);
    try {
      const empCodeStr = employee?.employeeCode ? `_${employee.employeeCode}` : "";
      const dateStr = new Date().toISOString().slice(0, 10);

      if (format === "excel") {
        const exportData = list.map((item, index) => ({
          SL: (page - 1) * limit + index + 1,
          Date: item.attendanceDate || "—",
          "Check In": formatTime12(item.checkIn),
          "Check Out": formatTime12(item.checkOut),
          "Working Hours": formatDuration(item.workedHour),
          Overtime: Number(item.overtimeHours) > 0 ? `+${item.overtimeHours} hrs` : "—",
          Status: item.attendanceStatus?.name || "Present",
          Shift: item.shift?.name || "—",
          Remarks: item.lateReason || item.remarks || "—",
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws["!cols"] = [
          { wch: 6 },
          { wch: 14 },
          { wch: 14 },
          { wch: 14 },
          { wch: 16 },
          { wch: 14 },
          { wch: 12 },
          { wch: 18 },
          { wch: 25 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "My Attendance History");
        XLSX.writeFile(wb, `My_Attendance_History${empCodeStr}_${dateStr}.xlsx`);
        toaster("Attendance history exported to Excel successfully!", "success");
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
          authUser?.appUser?.application?.name || "AI Powered HR Management System (OMS)";
        doc.text(`${appName} — My Attendance History`, 40, 40);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(70, 70, 70);

        const empName = employee?.name || "N/A";
        const empCode = employee?.employeeCode ? ` · ${employee.employeeCode}` : "";
        doc.text(`Employee: ${empName}${empCode}`, 40, 58);

        const filterDateDesc =
          Array.isArray(dateRange) && dateRange[0]
            ? dateRange[1]
              ? `Date Range: ${dateRange[0]} to ${dateRange[1]}`
              : `From Date: ${dateRange[0]}`
            : "Date Range: All Dates";
        const filterStatusDesc = statusFilter ? `Status: ${statusFilter}` : "Status: All";

        doc.text(filterDateDesc, pageWidth - 40, 58, { align: "right" });
        doc.text(filterStatusDesc, pageWidth - 40, 72, { align: "right" });
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
          { header: "Check In", dataKey: "checkIn" },
          { header: "Check Out", dataKey: "checkOut" },
          { header: "Working Hours", dataKey: "workedHours" },
          { header: "Overtime", dataKey: "overtime" },
          { header: "Status", dataKey: "status" },
          { header: "Shift", dataKey: "shift" },
          { header: "Remarks", dataKey: "remarks" },
        ];

        const tableRows = list.map((item, index) => ({
          sl: (page - 1) * limit + index + 1,
          date: item.attendanceDate || "—",
          checkIn: formatTime12(item.checkIn),
          checkOut: formatTime12(item.checkOut),
          workedHours: formatDuration(item.workedHour),
          overtime: Number(item.overtimeHours) > 0 ? `+${item.overtimeHours} hrs` : "—",
          status: item.attendanceStatus?.name || "Present",
          shift: item.shift?.name || "—",
          remarks: item.lateReason || item.remarks || "—",
        }));

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
            date: { halign: "center", cellWidth: 70 },
            checkIn: { halign: "center", cellWidth: 70 },
            checkOut: { halign: "center", cellWidth: 70 },
            workedHours: { halign: "center", cellWidth: 75 },
            overtime: { halign: "center", cellWidth: 65 },
            status: { halign: "left", cellWidth: 65 },
            shift: { halign: "left", cellWidth: 80 },
            remarks: { halign: "left" },
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
          doc.save(`My_Attendance_History${empCodeStr}_${dateStr}.pdf`);
          toaster("Attendance history exported to PDF successfully!", "success");
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toaster("Failed to export attendance history", "error");
    } finally {
      setIsExporting(false);
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
                {employeeName || "My Attendance History"}
              </h1>
              {employee?.employeeCode && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primaryColor/10 text-primaryColor dark:bg-primaryColor/20 dark:text-primaryColor-300 border border-primaryColor/20">
                  {employee.employeeCode}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              My Attendance History — View your complete daily attendance logs, working hours, and overtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={!list.length || isExporting}
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
          Loading your attendance history...
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Could not load attendance history. Please try refreshing.
        </div>
      )}

      {!isLoading && !isError && responseData && !responseData.isEmployee && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          My Attendance is available only when this account is linked to an employee.
        </div>
      )}

      {!isLoading && !isError && responseData?.isEmployee && (
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-5">
            <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Total Logged Days
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalDays || 0}
                </span>
                <span className="text-xs text-gray-400">days</span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Present Days
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {summary.presentDays || 0}
                </span>
                <span className="text-xs text-emerald-600/70">days</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Late In Days
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {summary.lateDays || 0}
                </span>
                <span className="text-xs text-amber-600/70">days</span>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 shadow-xs dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Total Worked
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-300">
                  {summary.totalWorkedHours ? Number(summary.totalWorkedHours).toFixed(1) : 0}
                </span>
                <span className="text-xs text-indigo-600/70">hrs</span>
              </div>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 shadow-xs dark:border-purple-900/40 dark:bg-purple-950/20">
              <span className="text-[11px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Overtime Hours
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-300">
                  {summary.totalOvertimeHours ? Number(summary.totalOvertimeHours).toFixed(1) : 0}
                </span>
                <span className="text-xs text-purple-600/70">hrs</span>
              </div>
            </div>
          </div>

          {/* 3. Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-900">
            <div className="p-4 overflow-x-auto">
              <CommonTable
                table={table}
                columns={columns}
                isFetching={isLoading}
                itemsPerPage={limit}
              />
            </div>

            {/* Pagination Component */}
            <div className="border-t border-gray-100 p-4 dark:border-gray-800">
              <Pagination
                currentPage={page}
                totalItems={total}
                resultRows={list.length}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleLimitChange}
                showItemsPerPage={true}
                showResultInfo={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendanceTab;
