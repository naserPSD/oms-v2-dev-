"use client";
import React, { useState, useRef } from "react";
import ButtonTw from "@/components/ui/ButtonTw";
import Modal from "@/components/common/Modal";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from "lucide-react";
import * as XLSX from "xlsx";
import helpers from "@/utils/helpers";

export default function ImportLeadsModal({
  showModal,
  handleClose,
  onImportSuccess,
  isLoading = false,
}) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError("");
    setIsDragOver(false);
  };

  const onClose = () => {
    resetState();
    handleClose();
  };

  const processFile = (uploadedFile) => {
    if (!uploadedFile) return;

    const fileExt = uploadedFile.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      setError("Invalid file format. Please upload a .csv or .xlsx file.");
      return;
    }

    setError("");
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          setError("The uploaded file is empty or missing data rows.");
          setParsedData([]);
          return;
        }

        // Standardize column mappings
        const mappedRows = rawJson.map((row) => ({
          name: row["Company Name"] || row["Company"] || row["Name"] || "",
          contactName: row["Contact Name"] || row["Key Contact"] || row["Contact"] || "",
          contactEmail: row["Contact Email"] || row["Email"] || "",
          contactPhone: row["Contact Phone"] || row["Phone"] || "",
          website: row["Website"] || "",
          leadSource: row["Source"] || row["Lead Source"] || "Imported",
          priorityStatus: row["Priority"] || row["Priority Status"] || "Medium",
          clientStatus: row["Client Status"] || row["Status"] || "New Lead",
          dealValue: Number(row["Deal Value"] || row["Value"] || 0),
          notes: row["Notes"] || "",
        }));

        setParsedData(mappedRows);
      } catch (err) {
        console.error("Error parsing file:", err);
        setError("Failed to parse file. Please ensure it is a valid CSV or Excel spreadsheet.");
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    processFile(uploadedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Company Name": "Acme Tech Solutions",
        "Key Contact": "John Doe",
        Email: "john@acmetech.com",
        Phone: "+1 (555) 234-5678",
        Website: "https://acmetech.com",
        "Lead Source": "LinkedIn",
        Priority: "High",
        "Client Status": "New Lead",
        "Deal Value": 15000,
        Notes: "Interested in enterprise ERP package.",
      },
      {
        "Company Name": "Global Logistics Inc",
        "Key Contact": "Sarah Connor",
        Email: "sarah@globallogistics.com",
        Phone: "+1 (555) 987-6543",
        Website: "https://globallogistics.com",
        "Lead Source": "Website",
        Priority: "Medium",
        "Client Status": "In Process",
        "Deal Value": 25000,
        Notes: "Followup call scheduled for next week.",
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "Sample_Leads");
    XLSX.writeFile(wb, "Sample_Leads_Template.xlsx");
  };

  const handleImportSubmit = async () => {
    if (!parsedData || parsedData.length === 0) return;
    try {
      if (onImportSuccess) {
        await onImportSuccess(parsedData);
      }
      helpers.toaster(`Successfully imported ${parsedData.length} lead(s)!`, "success");
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      helpers.toaster("Failed to import leads", "error");
    }
  };

  return (
    <Modal
      showModal={showModal}
      handleClose={onClose}
      title="Import Leads (CSV / Excel)"
      size="xl"
    >
      <div className="space-y-5">
        {/* Sample Download Bar */}
        <div className="flex items-center justify-between p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-200">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Need a template? Download our formatted sample Excel file.</span>
          </div>
          <ButtonTw
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="gap-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Download className="w-3.5 h-3.5" />
            Sample File
          </ButtonTw>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[0.99]"
              : file
              ? "border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400 bg-gray-50/50 dark:bg-gray-800/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {file ? file.name : "Click to upload or drag & drop CSV / Excel file"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports .csv, .xlsx, and .xls formats</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded-lg text-xs border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Preview Table */}
        {parsedData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" /> Ready to import {parsedData.length} row(s)
              </span>
              <button
                onClick={resetState}
                className="text-gray-400 hover:text-rose-500 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear file
              </button>
            </div>

            <div className="max-h-48 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 font-semibold text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="p-2 border-b">#</th>
                    <th className="p-2 border-b">Company</th>
                    <th className="p-2 border-b">Contact</th>
                    <th className="p-2 border-b">Email</th>
                    <th className="p-2 border-b">Phone</th>
                    <th className="p-2 border-b">Priority</th>
                    <th className="p-2 border-b">Deal Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {parsedData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="p-2 font-mono text-gray-400">{idx + 1}</td>
                      <td className="p-2 font-medium text-gray-900 dark:text-white">{row.name || "—"}</td>
                      <td className="p-2">{row.contactName || "—"}</td>
                      <td className="p-2">{row.contactEmail || "—"}</td>
                      <td className="p-2">{row.contactPhone || "—"}</td>
                      <td className="p-2">{row.priorityStatus || "Medium"}</td>
                      <td className="p-2 font-semibold text-emerald-600">${row.dealValue || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 10 && (
              <p className="text-[11px] text-gray-400 text-right italic">
                ...and {parsedData.length - 10} more rows
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <ButtonTw variant="outline.gray" onClick={onClose}>
            Cancel
          </ButtonTw>
          <ButtonTw
            variant="blue"
            onClick={handleImportSubmit}
            disabled={parsedData.length === 0 || isLoading}
            className="gap-2"
          >
            {isLoading ? "Importing..." : `Import ${parsedData.length} Lead(s)`}
          </ButtonTw>
        </div>
      </div>
    </Modal>
  );
}
