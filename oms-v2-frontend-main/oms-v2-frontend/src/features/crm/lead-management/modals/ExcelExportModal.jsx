"use client";
import React, { useState, useMemo } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Table as TableIcon,
  Eye,
} from "lucide-react";
import * as XLSX from "xlsx";
import helpers from "@/utils/helpers";

const EXPORT_COLUMNS = [
  { id: "sl", label: "SL #", default: true },
  { id: "name", label: "Company Name", default: true },
  { id: "leadType", label: "Lead Type", default: false },
  { id: "companyType", label: "Company Type", default: false },
  { id: "website", label: "Website", default: true },
  { id: "contactName", label: "Contact Person", default: true },
  { id: "contactEmail", label: "Contact Email", default: true },
  { id: "contactPhone", label: "Contact Phone", default: true },
  { id: "leadStatus", label: "Lead Status", default: true },
  { id: "priorityStatus", label: "Priority", default: true },
  { id: "leadSource", label: "Lead Source", default: true },
  { id: "dealValue", label: "Deal Value ($)", default: true },
  { id: "assignedTo", label: "Account Manager", default: true },
  { id: "createdAt", label: "Created Date", default: false },
];

const DEMO_LEADS = [
  {
    id: "demo-1",
    name: "Apex Tech Innovations Ltd.",
    leadType: "Enterprise",
    companyType: "Technology",
    website: "https://apextech.io",
    contactName: "Tanvir Ahmed",
    contactEmail: "tanvir@apextech.io",
    contactPhone: "+880 1711-234567",
    leadStatus: "In Process",
    priorityStatus: "High",
    leadSource: "LinkedIn",
    dealValue: 12500,
    assignedUser: { fullName: "Rashidul Karim" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Green Horizon Logistics",
    leadType: "Mid-Market",
    companyType: "Supply Chain",
    website: "https://greenhorizon.com",
    contactName: "Nusrat Jahan",
    contactEmail: "nusrat@greenhorizon.com",
    contactPhone: "+880 1819-876543",
    leadStatus: "Converted",
    priorityStatus: "Medium",
    leadSource: "Website",
    dealValue: 8400,
    assignedUser: { fullName: "Farhana Yasmin" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    name: "Nexus Global Corp",
    leadType: "Startup",
    companyType: "Consulting",
    website: "https://nexusglobal.org",
    contactName: "Mahmud Hasan",
    contactEmail: "mahmud@nexusglobal.org",
    contactPhone: "+880 1912-345678",
    leadStatus: "Active",
    priorityStatus: "Low",
    leadSource: "Referral",
    dealValue: 4200,
    assignedUser: { fullName: "Kamrul Islam" },
    createdAt: new Date().toISOString(),
  },
];

export default function ExcelExportModal({
  showModal,
  handleClose,
  allFilteredData = [],
  currentPageData = [],
  selectedRowsData = [],
  userMap = new Map(),
  employees = [],
}) {
  const [dataTarget, setDataTarget] = useState(
    selectedRowsData.length > 0 ? "selected" : "filtered"
  );
  const [fileName, setFileName] = useState(
    `leads_export_${new Date().toISOString().split("T")[0]}`
  );
  const [selectedColumns, setSelectedColumns] = useState(
    EXPORT_COLUMNS.filter((c) => c.default).map((c) => c.id)
  );

  React.useEffect(() => {
    if (showModal) {
      if (selectedRowsData.length > 0) {
        setDataTarget("selected");
      } else {
        setDataTarget("filtered");
      }
    }
  }, [showModal, selectedRowsData.length]);

  const toggleColumn = (colId) => {
    setSelectedColumns((prev) =>
      prev.includes(colId)
        ? prev.filter((id) => id !== colId)
        : [...prev, colId]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(EXPORT_COLUMNS.map((c) => c.id));
  };

  const deselectAllColumns = () => {
    setSelectedColumns(["sl", "name", "contactName", "leadStatus", "dealValue"]);
  };

  const getTargetDataset = () => {
    if (dataTarget === "selected" && selectedRowsData.length > 0) {
      return selectedRowsData;
    }
    if (dataTarget === "current") {
      return currentPageData;
    }
    return allFilteredData;
  };

  const resolveAssignedUser = (lead) => {
    if (lead.assignedUser?.fullName) return lead.assignedUser.fullName;
    if (lead.assignedUser?.name) return lead.assignedUser.name;
    const assignedToId = lead.assignedTo;
    if (!assignedToId) return "Unassigned";

    const user =
      userMap.get(String(assignedToId)) ||
      userMap.get(Number(assignedToId)) ||
      employees.find(
        (emp) =>
          emp.user?.id?.toString() === String(assignedToId) ||
          emp.id?.toString() === String(assignedToId)
      )?.user;

    return user?.fullName || user?.name || `User #${assignedToId}`;
  };

  const activeCols = useMemo(() => {
    return EXPORT_COLUMNS.filter((c) => selectedColumns.includes(c.id));
  }, [selectedColumns]);

  const currentDataset = getTargetDataset();
  const isDemo = !currentDataset || currentDataset.length === 0;
  const previewData = isDemo ? DEMO_LEADS : currentDataset.slice(0, 4);

  const formatCellValue = (lead, colId, idx) => {
    switch (colId) {
      case "sl":
        return idx + 1;
      case "name":
        return lead.name || "";
      case "leadType":
        return lead.leadType || "-";
      case "companyType":
        return lead.companyType || "-";
      case "website":
        return lead.website || "-";
      case "contactName":
        return lead.contactName || "-";
      case "contactEmail":
        return lead.contactEmail || "-";
      case "contactPhone":
        return lead.contactPhone || "-";
      case "leadStatus":
        return lead.leadStatus || "Active";
      case "priorityStatus":
        return lead.priorityStatus || "-";
      case "leadSource":
        return lead.leadSource || "-";
      case "dealValue":
        return lead.dealValue ? `$${Number(lead.dealValue).toLocaleString()}` : "$0";
      case "assignedTo":
        return resolveAssignedUser(lead);
      case "createdAt":
        return lead.createdAt ? helpers.formatDate(lead.createdAt) : "-";
      default:
        return lead[colId] || "-";
    }
  };

  const handleExport = () => {
    const rawDataset = isDemo ? DEMO_LEADS : currentDataset;
    if (!rawDataset || rawDataset.length === 0) {
      helpers.toaster("No dataset available to export", "warning");
      return;
    }

    if (selectedColumns.length === 0) {
      helpers.toaster("Please select at least one column to export", "warning");
      return;
    }

    try {
      const rows = rawDataset.map((lead, idx) => {
        const row = {};
        activeCols.forEach((col) => {
          switch (col.id) {
            case "sl":
              row[col.label] = idx + 1;
              break;
            case "name":
              row[col.label] = lead.name || "";
              break;
            case "leadType":
              row[col.label] = lead.leadType || "";
              break;
            case "companyType":
              row[col.label] = lead.companyType || "";
              break;
            case "website":
              row[col.label] = lead.website || "";
              break;
            case "contactName":
              row[col.label] = lead.contactName || "";
              break;
            case "contactEmail":
              row[col.label] = lead.contactEmail || "";
              break;
            case "contactPhone":
              row[col.label] = lead.contactPhone || "";
              break;
            case "leadStatus":
              row[col.label] = lead.leadStatus || "Active";
              break;
            case "priorityStatus":
              row[col.label] = lead.priorityStatus || "";
              break;
            case "leadSource":
              row[col.label] = lead.leadSource || "";
              break;
            case "dealValue":
              row[col.label] = lead.dealValue ? Number(lead.dealValue) : 0;
              break;
            case "assignedTo":
              row[col.label] = resolveAssignedUser(lead);
              break;
            case "createdAt":
              row[col.label] = lead.createdAt
                ? helpers.formatDate(lead.createdAt)
                : "";
              break;
            default:
              row[col.label] = lead[col.id] || "";
          }
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths
      const colWidths = activeCols.map((col) => {
        let maxLen = col.label.length;
        rows.forEach((r) => {
          const val = r[col.label];
          if (val) {
            const len = String(val).length;
            if (len > maxLen) maxLen = len;
          }
        });
        return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
      });
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads Data");

      const finalFileName = fileName.trim()
        ? `${fileName.replace(/\.xlsx$/i, "")}.xlsx`
        : `leads_export_${new Date().toISOString().split("T")[0]}.xlsx`;

      XLSX.writeFile(workbook, finalFileName);

      helpers.toaster(
        `Successfully exported ${rows.length} lead(s) to Excel!`,
        "success"
      );
      handleClose();
    } catch (err) {
      console.error("Excel generation error:", err);
      helpers.toaster("Failed to export Excel file", "error");
    }
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title="Export Leads to Excel"
      size="2xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-5 py-1">
        {/* Top Header Banner */}
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                Excel (.xlsx) Data Export
                {isDemo && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200/60">
                    Demo Mode Active
                  </span>
                )}
              </h4>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                Customize target leads, toggle spreadsheet columns, and preview before downloading.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <span>{activeCols.length} Columns</span>
            <span>•</span>
            <span>{isDemo ? DEMO_LEADS.length : currentDataset.length} Rows</span>
          </div>
        </div>

        {/* 1. Target Data Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            1. Select Export Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filtered Records */}
            <div
              onClick={() => setDataTarget("filtered")}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${dataTarget === "filtered"
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/40 shadow-xs"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  All Filtered
                </span>
                {dataTarget === "filtered" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {allFilteredData.length}
              </p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Matching current filters
              </span>
            </div>

            {/* Current Page */}
            <div
              onClick={() => setDataTarget("current")}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${dataTarget === "current"
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/40 shadow-xs"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Current Page
                </span>
                {dataTarget === "current" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                {currentPageData.length}
              </p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Visible on active page
              </span>
            </div>

            {/* Selected Rows */}
            <div
              onClick={() => selectedRowsData.length > 0 && setDataTarget("selected")}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${selectedRowsData.length === 0
                  ? "opacity-50 cursor-not-allowed border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20"
                  : dataTarget === "selected"
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/40 shadow-xs cursor-pointer"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 cursor-pointer bg-white dark:bg-gray-800/50"
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Selected Rows
                </span>
                {dataTarget === "selected" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                {selectedRowsData.length}
              </p>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {selectedRowsData.length > 0 ? "Checked table rows" : "No rows checked"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Choose Columns */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span>2. Select Columns</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ({selectedColumns.length}/{EXPORT_COLUMNS.length})
              </span>
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllColumns}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <button
                type="button"
                onClick={deselectAllColumns}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Default Columns
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60">
            {EXPORT_COLUMNS.map((col) => {
              const isChecked = selectedColumns.includes(col.id);
              return (
                <label
                  key={col.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-all ${isChecked
                      ? "bg-white dark:bg-gray-800 font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs border border-emerald-200/50 dark:border-emerald-800/40"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/40"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(col.id)}
                    className="accent-emerald-600 rounded w-4 h-4 cursor-pointer"
                  />
                  <span className="truncate">{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Live Demo / Spreadsheet Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>3. Live Spreadsheet Demo & Preview</span>
            </label>
            <span className="text-[11px] text-gray-400 italic">
              {isDemo ? "Showing sample demo records" : "Showing first 4 records"}
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-2xs">
            {/* Fake Excel Tab Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 font-mono">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {fileName || "leads_export"}.xlsx
                </span>
                <span className="text-gray-400">▸ Sheet1 (Leads)</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <TableIcon className="w-3 h-3" />
                <span>{activeCols.length} Columns Active</span>
              </div>
            </div>

            {/* Excel Grid Preview */}
            <div className="overflow-x-auto max-h-44 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 px-2.5 w-10 text-center border-r border-gray-200 dark:border-gray-700 bg-emerald-100/50 dark:bg-emerald-900/40 text-[10px] text-gray-500">
                      #
                    </th>
                    {activeCols.map((col) => (
                      <th
                        key={col.id}
                        className="py-2 px-3 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap text-[11px]"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {previewData.map((lead, idx) => (
                    <tr
                      key={lead.id || idx}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-2 px-2.5 text-center border-r border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-mono">
                        {idx + 1}
                      </td>
                      {activeCols.map((col) => (
                        <td
                          key={col.id}
                          className="py-2 px-3 border-r border-gray-200/60 dark:border-gray-800 whitespace-nowrap text-[11px]"
                        >
                          {col.id === "leadStatus" ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${lead.leadStatus === "Converted"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : lead.leadStatus === "In Process"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                            >
                              {formatCellValue(lead, col.id, idx)}
                            </span>
                          ) : (
                            formatCellValue(lead, col.id, idx)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. File Name Configuration */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
            4. File Name
          </label>
          <div className="relative flex items-center">
            <Input
              value={fileName}
              onChange={(val) => setFileName(val)}
              placeholder="Enter file name"
              className="!mb-0 pr-16"
            />
            <span className="absolute right-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 pointer-events-none">
              .xlsx
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ready to download:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {isDemo ? DEMO_LEADS.length : currentDataset.length} leads
            </span>{" "}
            with{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {activeCols.length} columns
            </span>
          </p>

          <div className="flex items-center gap-2.5">
            <ButtonTw onClick={handleClose} variant="outline.gray" size="sm">
              Cancel
            </ButtonTw>
            <ButtonTw
              onClick={handleExport}
              variant="success"
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel</span>
            </ButtonTw>
          </div>
        </div>
      </div>
    </ModalTw>
  );
}
