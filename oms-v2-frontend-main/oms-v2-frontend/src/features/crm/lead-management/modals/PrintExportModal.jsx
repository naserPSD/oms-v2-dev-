"use client";
import React, { useState } from "react";
import ButtonTw from "@/components/ui/ButtonTw";
import Modal from "@/components/common/Modal";
import { FileSpreadsheet, FileText, Printer, CheckSquare, Layout, Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import helpers from "@/utils/helpers";

const ALL_COLUMNS = [
  { id: "sl", label: "SL #", default: true },
  { id: "name", label: "Company Name", default: true },
  { id: "contactName", label: "Contact Person", default: true },
  { id: "contactEmail", label: "Email Address", default: true },
  { id: "contactPhone", label: "Phone", default: true },
  { id: "leadSource", label: "Lead Source", default: true },
  { id: "priorityStatus", label: "Priority", default: true },
  { id: "dealValue", label: "Deal Value ($)", default: true },
  { id: "status", label: "Status", default: true },
  { id: "assignedTo", label: "Assigned Employee", default: true },
  { id: "createdAt", label: "Created Date", default: false },
  { id: "notes", label: "Notes", default: false },
];

export default function PrintExportModal({
  showModal,
  handleClose,
  allFilteredData = [],
  currentPageData = [],
  selectedRowsData = [],
  userMap = new Map(),
  employees = [],
}) {
  const [exportFormat, setExportFormat] = useState("pdf"); // 'excel', 'pdf', 'print'
  const [dataTarget, setDataTarget] = useState(
    selectedRowsData.length > 0 ? "selected" : "filtered"
  ); // 'filtered', 'current', 'selected'
  const [pdfOrientation, setPdfOrientation] = useState("landscape"); // 'portrait', 'landscape'
  const [selectedColumns, setSelectedColumns] = useState(
    ALL_COLUMNS.filter((c) => c.default).map((c) => c.id)
  );

  const toggleColumn = (colId) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(ALL_COLUMNS.map((c) => c.id));
  };

  const deselectAllColumns = () => {
    setSelectedColumns(["sl", "name", "contactName", "status"]);
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

  const resolveAssignedUser = (assignedToId) => {
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

  const handleExport = () => {
    const rawDataset = getTargetDataset();
    if (!rawDataset || rawDataset.length === 0) {
      helpers.toaster("No dataset available to export", "warning");
      return;
    }

    const activeCols = ALL_COLUMNS.filter((c) => selectedColumns.includes(c.id));

    if (exportFormat === "excel") {
      generateExcel(rawDataset, activeCols);
    } else if (exportFormat === "pdf") {
      generatePDF(rawDataset, activeCols);
    } else if (exportFormat === "print") {
      generatePrintWindow(rawDataset, activeCols);
    }
  };

  const generateExcel = (dataset, activeCols) => {
    try {
      const exportRows = dataset.map((lead, idx) => {
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
              row["Contact Person"] = lead.contactName || "";
              break;
            case "contactEmail":
              row["Email"] = lead.contactEmail || "";
              break;
            case "contactPhone":
              row["Phone"] = lead.contactPhone || "";
              break;
            case "leadSource":
              row["Lead Source"] = lead.leadSource || "";
              break;
            case "priorityStatus":
              row["Priority"] = lead.priorityStatus || "";
              break;
            case "dealValue":
              row["Deal Value ($)"] = lead.dealValue || 0;
              break;
            case "status":
              row["Status"] =
                typeof lead.leadStatus === "string"
                  ? lead.leadStatus
                  : lead.leadStatus?.name || "Active";
              break;
            case "assignedTo":
              row["Assigned Employee"] = resolveAssignedUser(lead.assignedTo);
              break;
            case "createdAt":
              row["Created Date"] = lead.createdAt ? helpers.dDate(lead.createdAt) : "";
              break;
            case "notes":
              row["Notes"] = lead.notes || "";
              break;
            default:
              break;
          }
        });
        return row;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportRows);
      XLSX.utils.book_append_sheet(wb, ws, "Leads_Report");
      const dateStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `Leads_Report_${dateStr}.xlsx`);
      helpers.toaster(`Exported ${exportRows.length} record(s) to Excel`, "success");
      handleClose();
    } catch (err) {
      console.error("Excel generation error:", err);
      helpers.toaster("Failed to generate Excel file", "error");
    }
  };

  const generatePDF = (dataset, activeCols) => {
    try {
      const doc = new jsPDF({
        orientation: pdfOrientation,
        unit: "mm",
        format: "a4",
      });

      // Report Header Title
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("CRM Lead Management Summary Report", 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Total Records: ${dataset.length}`, 14, 21);

      // Map columns
      const headers = activeCols.map((c) => c.label);
      const rows = dataset.map((lead, idx) =>
        activeCols.map((col) => {
          switch (col.id) {
            case "sl":
              return idx + 1;
            case "name":
              return lead.name || "";
            case "contactName":
              return lead.contactName || "";
            case "contactEmail":
              return lead.contactEmail || "";
            case "contactPhone":
              return lead.contactPhone || "";
            case "leadSource":
              return lead.leadSource || "";
            case "priorityStatus":
              return lead.priorityStatus || "";
            case "dealValue":
              return `$${(lead.dealValue || 0).toLocaleString()}`;
            case "status":
              return typeof lead.leadStatus === "string"
                ? lead.leadStatus
                : lead.leadStatus?.name || "Active";
            case "assignedTo":
              return resolveAssignedUser(lead.assignedTo);
            case "createdAt":
              return lead.createdAt ? helpers.dDate(lead.createdAt) : "";
            case "notes":
              return lead.notes || "";
            default:
              return "";
          }
        })
      );

      autoTable(doc, {
        startY: 26,
        head: [headers],
        body: rows,
        theme: "striped",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 2, overflow: "linebreak" },
      });

      const dateStr = new Date().toISOString().split("T")[0];
      doc.save(`Leads_PDF_Report_${dateStr}.pdf`);
      helpers.toaster(`Generated PDF Report with ${dataset.length} record(s)`, "success");
      handleClose();
    } catch (err) {
      console.error("PDF generation error:", err);
      helpers.toaster("Failed to generate PDF Report", "error");
    }
  };

  const generatePrintWindow = (dataset, activeCols) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const headersHtml = activeCols.map((c) => `<th style="padding: 8px; border: 1px solid #ddd; background: #2563eb; color: white;">${c.label}</th>`).join("");
    const rowsHtml = dataset
      .map(
        (lead, idx) => `<tr>${activeCols
          .map((col) => {
            let val = "";
            if (col.id === "sl") val = idx + 1;
            else if (col.id === "name") val = lead.name || "";
            else if (col.id === "contactName") val = lead.contactName || "";
            else if (col.id === "contactEmail") val = lead.contactEmail || "";
            else if (col.id === "contactPhone") val = lead.contactPhone || "";
            else if (col.id === "leadSource") val = lead.leadSource || "";
            else if (col.id === "priorityStatus") val = lead.priorityStatus || "";
            else if (col.id === "dealValue") val = `$${lead.dealValue || 0}`;
            else if (col.id === "status") val = typeof lead.leadStatus === "string" ? lead.leadStatus : lead.leadStatus?.name || "Active";
            else if (col.id === "assignedTo") val = resolveAssignedUser(lead.assignedTo);
            else if (col.id === "createdAt") val = lead.createdAt ? helpers.dDate(lead.createdAt) : "";
            else if (col.id === "notes") val = lead.notes || "";
            return `<td style="padding: 6px; border: 1px solid #ddd; font-size: 12px;">${val}</td>`;
          })
          .join("")}</tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Leads Management Print Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #1e293b; margin-bottom: 5px; }
            p { color: #64748b; font-size: 12px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          </style>
        </head>
        <body>
          <h2>CRM Lead Management Summary</h2>
          <p>Generated on ${new Date().toLocaleString()} | Total Records: ${dataset.length}</p>
          <table>
            <thead><tr>${headersHtml}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    handleClose();
  };

  return (
    <Modal
      showModal={showModal}
      handleClose={handleClose}
      title="Print & Export Options"
      size="lg"
    >
      <div className="space-y-6">
        {/* Step 1: Export Format */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            1. Select Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setExportFormat("pdf")}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                exportFormat === "pdf"
                  ? "border-blue-600 bg-blue-50/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-600 dark:text-gray-300"
              }`}
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-xs">PDF Report</span>
            </button>

            <button
              onClick={() => setExportFormat("excel")}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                exportFormat === "excel"
                  ? "border-emerald-600 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 text-gray-600 dark:text-gray-300"
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span className="text-xs">Excel Sheet</span>
            </button>

            <button
              onClick={() => setExportFormat("print")}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                exportFormat === "print"
                  ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Printer className="w-5 h-5 text-indigo-600" />
              <span className="text-xs">Print Window</span>
            </button>
          </div>
        </div>

        {/* Step 2: Target Dataset & Orientation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Target Dataset */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              2. Target Dataset
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <input
                  type="radio"
                  name="dataTarget"
                  value="filtered"
                  checked={dataTarget === "filtered"}
                  onChange={() => setDataTarget("filtered")}
                  className="text-blue-600"
                />
                <span>All Filtered Leads ({allFilteredData.length})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <input
                  type="radio"
                  name="dataTarget"
                  value="current"
                  checked={dataTarget === "current"}
                  onChange={() => setDataTarget("current")}
                  className="text-blue-600"
                />
                <span>Current Page Only ({currentPageData.length})</span>
              </label>

              <label
                className={`flex items-center gap-2 cursor-pointer p-2 rounded border ${
                  selectedRowsData.length === 0
                    ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-800"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                }`}
              >
                <input
                  type="radio"
                  name="dataTarget"
                  value="selected"
                  disabled={selectedRowsData.length === 0}
                  checked={dataTarget === "selected"}
                  onChange={() => setDataTarget("selected")}
                  className="text-blue-600"
                />
                <span>Selected Rows ({selectedRowsData.length})</span>
              </label>
            </div>
          </div>

          {/* Orientation (PDF only) */}
          {exportFormat === "pdf" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                3. Page Layout
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setPdfOrientation("landscape")}
                  className={`p-2.5 rounded border flex items-center justify-center gap-2 ${
                    pdfOrientation === "landscape"
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Layout className="w-4 h-4 rotate-90" /> Landscape
                </button>
                <button
                  onClick={() => setPdfOrientation("portrait")}
                  className={`p-2.5 rounded border flex items-center justify-center gap-2 ${
                    pdfOrientation === "portrait"
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Layout className="w-4 h-4" /> Portrait
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Column Selector */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Select Included Columns ({selectedColumns.length}/{ALL_COLUMNS.length})
            </label>
            <div className="flex gap-3 text-xs text-blue-600 font-medium">
              <button onClick={selectAllColumns} className="hover:underline">Select All</button>
              <button onClick={deselectAllColumns} className="hover:underline">Reset</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs max-h-36 overflow-y-auto p-1">
            {ALL_COLUMNS.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col.id)}
                  onChange={() => toggleColumn(col.id)}
                  className="rounded text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{col.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <ButtonTw variant="outline.gray" onClick={handleClose}>
            Cancel
          </ButtonTw>
          <ButtonTw variant="blue" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Generate {exportFormat.toUpperCase()}
          </ButtonTw>
        </div>
      </div>
    </Modal>
  );
}
