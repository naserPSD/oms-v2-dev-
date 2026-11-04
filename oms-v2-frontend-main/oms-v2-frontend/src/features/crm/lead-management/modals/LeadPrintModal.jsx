"use client";
import React, { useState, useMemo, useEffect } from "react";
import { ModalTw } from "@/components/common/ModalTw";
import ButtonTw from "@/components/ui/ButtonTw";
import {
  Printer,
  Download,
  Eye,
  Sliders,
  Layout,
  Layers,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import helpers from "@/utils/helpers";

const PRINT_COLUMNS = [
  { id: "sl", label: "SL #", default: true },
  { id: "name", label: "Company Name", default: true },
  { id: "contactName", label: "Contact Person", default: true },
  { id: "contactEmail", label: "Email", default: true },
  { id: "contactPhone", label: "Phone", default: true },
  { id: "leadStatus", label: "Status", default: true },
  { id: "priorityStatus", label: "Priority", default: true },
  { id: "leadSource", label: "Source", default: true },
  { id: "dealValue", label: "Deal Value ($)", default: true },
  { id: "assignedTo", label: "Assigned To", default: true },
  { id: "createdAt", label: "Created Date", default: false },
];

const DEMO_PRINT_LEADS = [
  {
    id: "demo-1",
    name: "Apex Tech Innovations Ltd.",
    contactName: "Tanvir Ahmed",
    contactEmail: "tanvir@apextech.io",
    contactPhone: "+880 1711-234567",
    leadStatus: "In Process",
    priorityStatus: "High",
    leadSource: "LinkedIn",
    dealValue: 15000,
    assignedUser: { fullName: "Rashidul Karim" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Green Horizon Logistics",
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
    contactName: "Rafiqul Islam",
    contactEmail: "rafiq@nexusglobal.com",
    contactPhone: "+880 1912-345678",
    leadStatus: "Open",
    priorityStatus: "Low",
    leadSource: "Referral",
    dealValue: 5200,
    assignedUser: { fullName: "Tanvir Hasan" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-4",
    name: "Vertex Automation Ltd.",
    contactName: "Sadia Sultana",
    contactEmail: "sadia@vertexauto.net",
    contactPhone: "+880 1622-456789",
    leadStatus: "In Process",
    priorityStatus: "High",
    leadSource: "Facebook",
    dealValue: 22000,
    assignedUser: { fullName: "Tanvir Hasan" },
    createdAt: new Date().toISOString(),
  },
];

export default function LeadPrintModal({
  showModal,
  handleClose,
  allFilteredData = [],
  currentPageData = [],
  selectedRowsData = [],
  userMap = new Map(),
  employees = [],
}) {
  const [dataScope, setDataScope] = useState(
    selectedRowsData.length > 0 ? "selected" : "filtered"
  );
  const [orientation, setOrientation] = useState("landscape"); // 'portrait' | 'landscape'
  const [includeSummary, setIncludeSummary] = useState(true);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    PRINT_COLUMNS.filter((c) => c.default).map((c) => c.id)
  );

  // Safe client date format
  const [currentDateFormatted, setCurrentDateFormatted] = useState("");
  useEffect(() => {
    setCurrentDateFormatted(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

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

  // Get current dataset
  const currentDataset = useMemo(() => {
    if (dataScope === "selected" && selectedRowsData.length > 0) {
      return selectedRowsData;
    }
    if (dataScope === "current") {
      return currentPageData;
    }
    return allFilteredData.length > 0 ? allFilteredData : currentPageData;
  }, [dataScope, selectedRowsData, currentPageData, allFilteredData]);

  // Fallback demo leads if empty
  const isDemoFallback = currentDataset.length === 0;
  const displayDataset = isDemoFallback ? DEMO_PRINT_LEADS : currentDataset;

  // Active columns
  const activeCols = useMemo(() => {
    return PRINT_COLUMNS.filter((col) => selectedColumns.includes(col.id));
  }, [selectedColumns]);

  // Toggle single column
  const toggleColumn = (colId) => {
    setSelectedColumns((prev) =>
      prev.includes(colId)
        ? prev.length > 2
          ? prev.filter((id) => id !== colId)
          : prev
        : [...prev, colId]
    );
  };

  // Total deal value
  const totalDealValue = useMemo(() => {
    return displayDataset.reduce(
      (sum, item) => sum + (Number(item.dealValue) || 0),
      0
    );
  }, [displayDataset]);

  // Extract cell value helper
  const getCellValue = (lead, colId, idx) => {
    switch (colId) {
      case "sl":
        return idx + 1;
      case "name":
        return lead.name || "-";
      case "contactName":
        return lead.contactName || lead.contacts?.[0]?.name || "-";
      case "contactEmail":
        return lead.contactEmail || lead.contacts?.[0]?.email || "-";
      case "contactPhone":
        return lead.contactPhone || lead.contacts?.[0]?.phone || "-";
      case "leadStatus":
        return typeof lead.leadStatus === "string"
          ? lead.leadStatus
          : lead.leadStatus?.name || "Active";
      case "priorityStatus":
        return lead.priorityStatus || "-";
      case "leadSource":
        return lead.leadSource || "-";
      case "dealValue":
        return `$${Number(lead.dealValue || 0).toLocaleString()}`;
      case "assignedTo":
        return resolveAssignedUser(lead);
      case "createdAt":
        return lead.createdAt ? helpers.dDate(lead.createdAt) : "-";
      default:
        return "-";
    }
  };

  // Browser Print Trigger
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      helpers.toaster(
        "Popup was blocked by your browser. Please allow popups.",
        "warning"
      );
      return;
    }

    const headersHtml = activeCols
      .map(
        (col) =>
          `<th style="padding: 7px 8px; border: 1px solid #cbd5e1; background-color: #f1f5f9; color: #1e293b; font-size: 10px; text-transform: uppercase; font-weight: 700; text-align: left;">${col.label}</th>`
      )
      .join("");

    const rowsHtml = displayDataset
      .map((lead, idx) => {
        const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        const cells = activeCols
          .map(
            (col) =>
              `<td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10.5px; color: #334155;">${getCellValue(
                lead,
                col.id,
                idx
              )}</td>`
          )
          .join("");
        return `<tr style="background-color: ${bg};">${cells}</tr>`;
      })
      .join("");

    const summaryHtml = includeSummary
      ? `
      <div style="display: flex; gap: 14px; margin-bottom: 12px;">
        <div style="flex: 1; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div style="font-size: 9.5px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Leads Listed</div>
          <div style="font-size: 15px; font-weight: bold; color: #1e293b; margin-top: 2px;">${displayDataset.length} Leads</div>
        </div>
        <div style="flex: 1; padding: 8px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <div style="font-size: 9.5px; color: #15803d; font-weight: 700; text-transform: uppercase;">Total Pipeline Value</div>
          <div style="font-size: 15px; font-weight: bold; color: #16a34a; margin-top: 2px;">$${totalDealValue.toLocaleString()}</div>
        </div>
      </div>
    `
      : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CRM Leads Print Document - ${currentDateFormatted}</title>
          <style>
            @page {
              size: ${orientation};
              margin: 8mm 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 10px;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .title {
              font-size: 16px;
              font-weight: 800;
              color: #1e293b;
              margin: 0;
            }
            .subtitle {
              font-size: 10.5px;
              color: #64748b;
              margin: 2px 0 0 0;
            }
            .meta {
              font-size: 10px;
              color: #64748b;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
              table-layout: auto;
            }
            th, td {
              word-break: break-word;
            }
            tr {
              page-break-inside: avoid;
            }
            .footer-bar {
              margin-top: 12px;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              font-size: 9.5px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1 class="title">OMS CRM • Lead Management Report</h1>
              <p class="subtitle">Official CRM Lead Records & Pipeline Status</p>
            </div>
            <div class="meta">
              <div><strong>Print Date:</strong> ${currentDateFormatted}</div>
              <div><strong>Scope:</strong> ${dataScope.toUpperCase()}</div>
            </div>
          </div>

          ${summaryHtml}

          <table>
            <thead>
              <tr>${headersHtml}</tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer-bar">
            <span>Page 1 of 1 • OMS-v2 CRM</span>
            <span>Confidential Report</span>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    handleClose();
  };

  // PDF Export Function
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("OMS CRM • Lead Management Report", 14, 14);

      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated: ${currentDateFormatted} | Total: ${displayDataset.length} leads | Pipeline: $${totalDealValue.toLocaleString()}`,
        14,
        20
      );

      const headers = activeCols.map((c) => c.label);
      const rows = displayDataset.map((lead, idx) =>
        activeCols.map((col) => getCellValue(lead, col.id, idx))
      );

      autoTable(doc, {
        startY: 24,
        head: [headers],
        body: rows,
        theme: "striped",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 2, overflow: "linebreak" },
      });

      const dateStr = new Date().toISOString().split("T")[0];
      doc.save(`Leads_Print_Report_${dateStr}.pdf`);
      helpers.toaster("PDF document generated successfully!", "success");
      handleClose();
    } catch (err) {
      console.error("PDF generation failed:", err);
      helpers.toaster("Failed to generate PDF", "error");
    }
  };

  return (
    <ModalTw
      show={showModal}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Print Leads Document</span>
        </span>
      }
      size="4xl"
      dismissible={true}
      showHeader={true}
      showFooter={false}
      type="default"
      position="center"
    >
      <div className="space-y-3.5">
        {/* Top Control Bar: Clean, well-spaced 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
          {/* 1. Scope Selector */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
              <Layers className="w-3 h-3 text-blue-500" />
              <span>1. Target Scope</span>
            </label>
            <select
              value={dataScope}
              onChange={(e) => setDataScope(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-blue-500"
            >
              <option value="filtered">
                All Filtered ({allFilteredData.length})
              </option>
              <option value="current">
                Current Page ({currentPageData.length})
              </option>
              {selectedRowsData.length > 0 && (
                <option value="selected">
                  Selected Rows ({selectedRowsData.length})
                </option>
              )}
            </select>
          </div>

          {/* 2. Orientation Toggle */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
              <Layout className="w-3 h-3 text-indigo-500" />
              <span>2. Page Layout</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-all ${
                  orientation === "landscape"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="w-3.5 h-2.5 border border-current rounded-2xs"></div>
                <span>Landscape</span>
              </button>

              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-all ${
                  orientation === "portrait"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="w-2.5 h-3.5 border border-current rounded-2xs"></div>
                <span>Portrait</span>
              </button>
            </div>
          </div>

          {/* 3. Column Toggle & Options */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
              <Sliders className="w-3 h-3 text-emerald-500" />
              <span>3. Column Options</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 font-medium"
              >
                <span>Columns: {activeCols.length} active</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Change
                </span>
              </button>

              {/* Column Dropdown */}
              {showColumnDropdown && (
                <div className="absolute right-0 top-9 z-50 w-56 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl space-y-1">
                  <div className="flex justify-between items-center pb-1 mb-1 border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold text-gray-500">
                    <span>Toggle Columns</span>
                    <button
                      type="button"
                      onClick={() => setShowColumnDropdown(false)}
                      className="text-blue-600 hover:underline"
                    >
                      Done
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {PRINT_COLUMNS.map((col) => (
                      <label
                        key={col.id}
                        className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(col.id)}
                          onChange={() => toggleColumn(col.id)}
                          className="rounded text-blue-600"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── THE PRINT PREVIEW BOX (Clean, unbreakable, perfectly aligned) ── */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100/90 dark:bg-gray-950 p-3 sm:p-4">
          {/* Header Bar inside Preview Box */}
          <div className="flex items-center justify-between mb-2 px-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Print Preview</span>
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Include Summary Box</span>
              </label>
              <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 uppercase font-semibold text-[10px]">
                {orientation}
              </span>
            </div>
          </div>

          {/* Viewport: Smooth scrolling with clean white paper canvas */}
          <div className="max-h-[390px] overflow-auto rounded-lg border border-gray-300/80 dark:border-gray-800 bg-gray-200/50 dark:bg-gray-900/60 p-2 sm:p-4">
            {/* The Paper Sheet */}
            <div className="bg-white text-slate-800 shadow-md rounded-sm p-4 sm:p-6 border border-gray-200 mx-auto w-full transition-all">
              {/* Document Title Header */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-3 mb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-blue-600">OMS CRM</span> • Lead
                    Management Report
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Official Lead Directory & Pipeline Tracking
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500 leading-tight">
                  <div>
                    <strong>Date:</strong> {currentDateFormatted || "Today"}
                  </div>
                  <div>
                    <strong>Scope:</strong> {dataScope.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              {includeSummary && (
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[9px] uppercase font-bold text-slate-500">
                      Total Leads
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {displayDataset.length} Leads
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-50/70 rounded border border-emerald-200">
                    <span className="text-[9px] uppercase font-bold text-emerald-700">
                      Total Deal Value
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-emerald-600">
                      ${totalDealValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Table Container (with overflow-x-auto to prevent layout breaks) */}
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      {activeCols.map((col) => (
                        <th
                          key={col.id}
                          className="px-2.5 py-1.5 text-[9.5px] font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 last:border-0 whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayDataset.map((lead, idx) => (
                      <tr
                        key={lead.id || idx}
                        className={
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                        }
                      >
                        {activeCols.map((col) => (
                          <td
                            key={col.id}
                            className="px-2.5 py-1.5 text-[10px] text-slate-700 border-r border-slate-100 last:border-0 whitespace-nowrap"
                          >
                            {getCellValue(lead, col.id, idx)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Document Footer */}
              <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                <span>Page 1 of 1 • Generated by OMS CRM</span>
                <span className="font-semibold uppercase tracking-wider">
                  Confidential
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ready to print:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {displayDataset.length} leads
            </span>{" "}
            •{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {activeCols.length} columns
            </span>
          </p>

          <div className="flex items-center gap-2">
            <ButtonTw onClick={handleClose} variant="outline.gray" size="sm">
              Cancel
            </ButtonTw>

            <ButtonTw
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="gap-1.5 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download className="w-3.5 h-3.5 text-red-500" />
              <span>PDF Report</span>
            </ButtonTw>

            <ButtonTw
              onClick={handlePrint}
              variant="blue"
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </ButtonTw>
          </div>
        </div>
      </div>
    </ModalTw>
  );
}
