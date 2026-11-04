"use client";
import React, { useState, useRef, useMemo } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  Table as TableIcon,
  Eye,
  FileCheck,
  AlertCircle,
  FileDown,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";
import helpers from "@/utils/helpers";

const EXCEL_COLUMNS = [
  { id: "sl", label: "SL #", default: true },
  { id: "name", label: "Company Name", default: true },
  { id: "contactName", label: "Contact Person", default: true },
  { id: "contactEmail", label: "Contact Email", default: true },
  { id: "contactPhone", label: "Contact Phone", default: true },
  { id: "website", label: "Website", default: true },
  { id: "leadSource", label: "Lead Source", default: true },
  { id: "priorityStatus", label: "Priority", default: true },
  { id: "leadStatus", label: "Status", default: true },
  { id: "dealValue", label: "Deal Value ($)", default: true },
  { id: "assignedTo", label: "Account Manager", default: true },
];

const DEMO_TEMPLATE_LEADS = [
  {
    id: "demo-1",
    name: "Apex Tech Innovations Ltd.",
    contactName: "Tanvir Ahmed",
    contactEmail: "tanvir@apextech.io",
    contactPhone: "+880 1711-234567",
    website: "https://apextech.io",
    leadSource: "LinkedIn",
    priorityStatus: "High",
    leadStatus: "In Process",
    dealValue: 15000,
    assignedTo: "Tanvir Hasan",
    notes: "Interested in CRM enterprise tier",
  },
  {
    id: "demo-2",
    name: "Green Horizon Logistics",
    contactName: "Nusrat Jahan",
    contactEmail: "nusrat@greenhorizon.com",
    contactPhone: "+880 1819-876543",
    website: "https://greenhorizon.com",
    leadSource: "Website",
    priorityStatus: "Medium",
    leadStatus: "Converted",
    dealValue: 8400,
    assignedTo: "Farhana Yasmin",
    notes: "Requires contract review",
  },
  {
    id: "demo-3",
    name: "Nexus Global Corp",
    contactName: "Rafiqul Islam",
    contactEmail: "rafiq@nexusglobal.com",
    contactPhone: "+880 1912-345678",
    website: "https://nexusglobal.com",
    leadSource: "Referral",
    priorityStatus: "Low",
    leadStatus: "Open",
    dealValue: 5200,
    assignedTo: "Rashidul Karim",
    notes: "Initial discovery call scheduled",
  },
  {
    id: "demo-4",
    name: "Vertex Automation Ltd.",
    contactName: "Sadia Sultana",
    contactEmail: "sadia@vertexauto.net",
    contactPhone: "+880 1622-456789",
    website: "https://vertexauto.net",
    leadSource: "Facebook",
    priorityStatus: "High",
    leadStatus: "In Process",
    dealValue: 22000,
    assignedTo: "Tanvir Hasan",
    notes: "ERP and Lead automation modules",
  },
];

export default function ExcelHubModal({
  showModal,
  handleClose,
  onImportSuccess,
  allFilteredData = [],
  currentPageData = [],
  selectedRowsData = [],
  userMap = new Map(),
  employees = [],
  isLoading = false,
}) {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'demo' | 'export'

  // Upload States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Export States
  const [exportScope, setExportScope] = useState(
    selectedRowsData.length > 0 ? "selected" : "filtered"
  );
  const [exportFileName, setExportFileName] = useState("Leads_Export");
  const [selectedColumns, setSelectedColumns] = useState(
    EXCEL_COLUMNS.filter((c) => c.default).map((c) => c.id)
  );

  const resetUploadState = () => {
    setUploadedFile(null);
    setParsedRows([]);
    setUploadError("");
    setIsDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onClose = () => {
    resetUploadState();
    handleClose();
  };

  // Resolve assigned user helper
  const resolveAssignedUser = (lead) => {
    if (lead.assignedUser?.fullName) return lead.assignedUser.fullName;
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

    return user?.name || user?.fullName || `User ${assignedToId}`;
  };

  // 1. Process Uploaded File
  const processFile = (file) => {
    if (!file) return;

    const fileExt = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      setUploadError("Invalid file type. Please upload a valid .xlsx, .xls, or .csv file.");
      return;
    }

    setUploadError("");
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          setUploadError("The uploaded file does not contain any lead records.");
          setParsedRows([]);
          return;
        }

        // Standardize column mappings
        const mappedRows = rawJson.map((row, idx) => ({
          id: `imported-${idx + 1}`,
          name: row["Company Name"] || row["Company"] || row["Name"] || "",
          contactName: row["Contact Person"] || row["Contact Name"] || row["Contact"] || "",
          contactEmail: row["Contact Email"] || row["Email"] || "",
          contactPhone: row["Contact Phone"] || row["Phone"] || "",
          website: row["Website"] || "",
          leadSource: row["Lead Source"] || row["Source"] || "Imported",
          priorityStatus: row["Priority"] || row["Priority Status"] || "Medium",
          leadStatus: row["Status"] || row["Lead Status"] || "Open",
          dealValue: Number(row["Deal Value"] || row["Value"] || 0),
          notes: row["Notes"] || "",
        }));

        setParsedRows(mappedRows);
      } catch (err) {
        console.error("Excel parse error:", err);
        setUploadError("Failed to parse file. Please verify the spreadsheet format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Submit Uploaded Leads
  const handleUploadSubmit = async () => {
    if (!parsedRows || parsedRows.length === 0) return;
    try {
      setIsUploading(true);
      if (onImportSuccess) {
        await onImportSuccess(parsedRows);
      }
      helpers.toaster(`Successfully imported ${parsedRows.length} lead(s)!`, "success");
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      helpers.toaster("Failed to import leads", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Download Demo Template
  const handleDownloadDemoTemplate = () => {
    try {
      const templateData = DEMO_TEMPLATE_LEADS.map((lead) => ({
        "Company Name": lead.name,
        "Contact Person": lead.contactName,
        "Contact Email": lead.contactEmail,
        "Contact Phone": lead.contactPhone,
        Website: lead.website,
        "Lead Source": lead.leadSource,
        Priority: lead.priorityStatus,
        Status: lead.leadStatus,
        "Deal Value": lead.dealValue,
        Notes: lead.notes,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Auto-fit column widths
      ws["!cols"] = [
        { wch: 28 }, // Company Name
        { wch: 20 }, // Contact Person
        { wch: 26 }, // Contact Email
        { wch: 18 }, // Contact Phone
        { wch: 24 }, // Website
        { wch: 15 }, // Lead Source
        { wch: 12 }, // Priority
        { wch: 14 }, // Status
        { wch: 14 }, // Deal Value
        { wch: 35 }, // Notes
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Leads_Template");
      XLSX.writeFile(wb, "OMS_Leads_Demo_Template.xlsx");
      helpers.toaster("Demo Excel template downloaded successfully!", "success");
    } catch (err) {
      console.error("Template download error:", err);
      helpers.toaster("Failed to generate demo template", "error");
    }
  };

  // 3. Handle Export to Excel
  const getExportDataset = () => {
    if (exportScope === "selected" && selectedRowsData.length > 0) {
      return selectedRowsData;
    }
    if (exportScope === "current") {
      return currentPageData;
    }
    return allFilteredData.length > 0 ? allFilteredData : currentPageData;
  };

  const handleExportToExcel = () => {
    try {
      const rawData = getExportDataset();
      const dataset = rawData.length > 0 ? rawData : DEMO_TEMPLATE_LEADS;
      const activeCols = EXCEL_COLUMNS.filter((col) => selectedColumns.includes(col.id));

      const rows = dataset.map((lead, idx) => {
        const row = {};
        activeCols.forEach((col) => {
          switch (col.id) {
            case "sl":
              row["SL #"] = idx + 1;
              break;
            case "name":
              row["Company Name"] = lead.name || "";
              break;
            case "contactName":
              row["Contact Person"] = lead.contactName || lead.contacts?.[0]?.name || "";
              break;
            case "contactEmail":
              row["Contact Email"] = lead.contactEmail || lead.contacts?.[0]?.email || "";
              break;
            case "contactPhone":
              row["Contact Phone"] = lead.contactPhone || lead.contacts?.[0]?.phone || "";
              break;
            case "website":
              row["Website"] = lead.website || "";
              break;
            case "leadSource":
              row["Lead Source"] = lead.leadSource || "";
              break;
            case "priorityStatus":
              row["Priority"] = lead.priorityStatus || "";
              break;
            case "leadStatus":
              row["Status"] =
                typeof lead.leadStatus === "string"
                  ? lead.leadStatus
                  : lead.leadStatus?.name || "Active";
              break;
            case "dealValue":
              row["Deal Value ($)"] = Number(lead.dealValue || 0);
              break;
            case "assignedTo":
              row["Account Manager"] = resolveAssignedUser(lead);
              break;
            default:
              break;
          }
        });
        return row;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      const cleanFileName = exportFileName.trim() || "Leads_Export";
      XLSX.writeFile(wb, `${cleanFileName}.xlsx`);
      helpers.toaster(`Exported ${rows.length} leads to Excel!`, "success");
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      helpers.toaster("Failed to export Excel file", "error");
    }
  };

  return (
    <ModalTw
      show={showModal}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Excel Management Hub</span>
        </span>
      }
      size="3xl"
      showFooter={false}
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Excel Sheet</span>
            {parsedRows.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full">
                {parsedRows.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("demo")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "demo"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Demo Sheet & Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "export"
                ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-xs"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 1: UPLOAD EXCEL SHEET                                  */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            {/* Download Demo Template Banner */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
              <div className="flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Don&apos;t have the correct format? Download our official Demo Template.
                </span>
              </div>
              <ButtonTw
                variant="outline"
                size="sm"
                onClick={handleDownloadDemoTemplate}
                className="gap-1.5 text-xs border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Demo</span>
              </ButtonTw>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 scale-[0.99]"
                  : uploadedFile
                  ? "border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-gray-300 dark:border-gray-700 hover:border-emerald-400 bg-gray-50/60 dark:bg-gray-800/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  {uploadedFile ? (
                    <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                {uploadedFile ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • {parsedRows.length} leads detected
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Click or drop another file to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Click to upload or drag and drop Excel sheet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Supports .xlsx, .xls, or .csv formats
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Parsed Leads Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Preview of Uploaded Leads ({parsedRows.length})
                  </span>
                  <button
                    type="button"
                    onClick={resetUploadState}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Clear File
                  </button>
                </div>

                <div className="max-h-48 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">#</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">Company</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">Contact</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">Email</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">Phone</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">Source</th>
                        <th className="p-2 border-b border-gray-200 dark:border-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {parsedRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="p-2 text-gray-500">{idx + 1}</td>
                          <td className="p-2 font-medium text-gray-800 dark:text-gray-200">{row.name || "-"}</td>
                          <td className="p-2 text-gray-600 dark:text-gray-300">{row.contactName || "-"}</td>
                          <td className="p-2 text-gray-600 dark:text-gray-300">{row.contactEmail || "-"}</td>
                          <td className="p-2 text-gray-600 dark:text-gray-300">{row.contactPhone || "-"}</td>
                          <td className="p-2 text-gray-600 dark:text-gray-300">{row.leadSource || "-"}</td>
                          <td className="p-2 font-semibold text-emerald-600">${Number(row.dealValue || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedRows.length > 10 && (
                  <p className="text-[11px] text-gray-400 text-center">
                    Showing first 10 rows of {parsedRows.length} leads
                  </p>
                )}
              </div>
            )}

            {/* Upload Tab Footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <ButtonTw onClick={onClose} variant="outline.gray" size="sm">
                Cancel
              </ButtonTw>
              <ButtonTw
                onClick={handleUploadSubmit}
                disabled={parsedRows.length === 0 || isUploading}
                variant="green"
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Save {parsedRows.length > 0 ? `(${parsedRows.length} Leads)` : ""}</span>
                  </>
                )}
              </ButtonTw>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 2: DEMO SHEET & TEMPLATE                               */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "demo" && (
          <div className="space-y-4">
            {/* Header / Intro */}
            <div className="flex items-center justify-between p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Official Leads Excel Demo Sheet
                </h4>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  Use this demo spreadsheet format to prepare your leads for batch upload.
                </p>
              </div>

              <ButtonTw
                onClick={handleDownloadDemoTemplate}
                variant="blue"
                size="sm"
                className="gap-1.5 shadow-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download Demo File (.xlsx)</span>
              </ButtonTw>
            </div>

            {/* Interactive Demo Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-blue-500" />
                  Demo Spreadsheet View
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {DEMO_TEMPLATE_LEADS.length} sample records
                </span>
              </div>

              <div className="overflow-x-auto max-h-56">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Company Name</th>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Contact Person</th>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Email</th>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Phone</th>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Source</th>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Priority</th>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Status</th>
                      <th className="p-2 border-b border-gray-200 dark:border-gray-700">Deal Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono text-[11px]">
                    {DEMO_TEMPLATE_LEADS.map((lead) => (
                      <tr key={lead.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
                        <td className="p-2 font-sans font-medium text-gray-800 dark:text-gray-200">{lead.name}</td>
                        <td className="p-2 font-sans text-gray-600 dark:text-gray-300">{lead.contactName}</td>
                        <td className="p-2 text-blue-600 dark:text-blue-400">{lead.contactEmail}</td>
                        <td className="p-2 text-gray-600 dark:text-gray-300">{lead.contactPhone}</td>
                        <td className="p-2 font-sans text-gray-600 dark:text-gray-300">{lead.leadSource}</td>
                        <td className="p-2 font-sans">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              lead.priorityStatus === "High"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                : lead.priorityStatus === "Medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {lead.priorityStatus}
                          </span>
                        </td>
                        <td className="p-2 font-sans text-gray-700 dark:text-gray-300">{lead.leadStatus}</td>
                        <td className="p-2 font-sans font-semibold text-emerald-600">${lead.dealValue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <ButtonTw
                onClick={() => setActiveTab("upload")}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              >
                <span>Ready to upload? Go to Upload Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </ButtonTw>

              <ButtonTw onClick={onClose} variant="outline.gray" size="sm">
                Close
              </ButtonTw>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 3: EXPORT TO EXCEL                                     */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "export" && (
          <div className="space-y-4">
            {/* Scope Selection */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                1. Select Export Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    value="filtered"
                    checked={exportScope === "filtered"}
                    onChange={() => setExportScope("filtered")}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    All Filtered Leads ({allFilteredData.length})
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    value="current"
                    checked={exportScope === "current"}
                    onChange={() => setExportScope("current")}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Current Page ({currentPageData.length})
                  </span>
                </label>

                <label
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    selectedRowsData.length === 0
                      ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    value="selected"
                    disabled={selectedRowsData.length === 0}
                    checked={exportScope === "selected"}
                    onChange={() => setExportScope("selected")}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium">
                    Selected Rows ({selectedRowsData.length})
                  </span>
                </label>
              </div>
            </div>

            {/* Column Selection */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  2. Select Included Columns ({selectedColumns.length}/{EXCEL_COLUMNS.length})
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedColumns(EXCEL_COLUMNS.map((c) => c.id))}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedColumns(EXCEL_COLUMNS.filter((c) => c.default).map((c) => c.id))}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs max-h-36 overflow-y-auto">
                {EXCEL_COLUMNS.map((col) => {
                  const isChecked = selectedColumns.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className={`flex items-center gap-2 p-1.5 rounded border cursor-pointer ${
                        isChecked
                          ? "bg-purple-50/60 border-purple-300 text-purple-900 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-200"
                          : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedColumns((prev) =>
                            prev.includes(col.id) ? prev.filter((id) => id !== col.id) : [...prev, col.id]
                          )
                        }
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>{col.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* File Name & Download */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="text-xs text-gray-500 font-medium">File Name:</span>
                <div className="relative flex-1">
                  <Input
                    value={exportFileName}
                    onChange={(val) => setExportFileName(val)}
                    placeholder="Enter file name"
                    className="!mb-0 pr-12 text-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] font-bold text-gray-400 pointer-events-none">
                    .xlsx
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ButtonTw onClick={onClose} variant="outline.gray" size="sm">
                  Cancel
                </ButtonTw>
                <ButtonTw
                  onClick={handleExportToExcel}
                  variant="green"
                  size="sm"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel</span>
                </ButtonTw>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalTw>
  );
}
