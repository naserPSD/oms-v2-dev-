import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import helpers from "@/utils/helpers";

applyPlugin(jsPDF);

const statusLabel = (item) => {
  if (item?.approvalStatus?.name) return item.approvalStatus.name;
  switch (item?.approvalStatusId) {
    case 51:
      return "Pending";
    case 52:
      return "Approved";
    case 53:
      return "Rejected";
    default:
      return "Unknown";
  }
};

export const mapLeaveReportToExportRow = (item, leaveTypeDataArray = []) => {
  const row = {
    SL: item?.sl ?? "",
    "Employee Name": item?.employeeName || "",
    "Employee Code": item?.employeeCode || "",
    Designation: item?.designation || "",
    "Total Leave Days": item?.totalLeaveDays ?? 0,
  };

  leaveTypeDataArray.forEach((lt) => {
    const leaveData = item?.leaveTypes?.find((l) => l.leaveTypeId === lt.id);
    row[`${lt.name} - Used Days`] = leaveData?.usedDays ?? 0;
    row[`${lt.name} - Remaining Days`] = leaveData?.remainingDays ?? 0;
  });

  return row;
};

const cardLeaveDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
  return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
};

const joinLines = (...parts) => parts.map((part) => String(part || "").trim()).filter(Boolean).join("\n");

const formatLeaveDates = (startDate, endDate) => {
  const startText = startDate ? helpers.dDate(startDate) : "";
  const endText = endDate ? helpers.dDate(endDate) : "";
  if (startText && endText) return `${startText}\nto\n${endText}`;
  return startText || endText;
};

const approverName = (item) =>
  item?.approver?.fullName ||
  [item?.approver?.firstName, item?.approver?.lastName].filter(Boolean).join(" ");

export const mapLeaveRequestToExportRow = (item) => {
  const user = item?.employee?.user;
  const employee = item?.employee;
  const profile = user?.profile;

  return {
    SL: item?.sl ?? "",
    Employee: joinLines(user?.fullName, user?.email),
    Phone: profile?.phoneWithCallingCode || profile?.phone || "",
    Designation: employee?.designation?.name || "",
    Office: employee?.office?.name || "",
    "Office Type": employee?.office?.officeType?.name || "",
    Department: employee?.designation?.department?.name || "",
    "Leave Type": item?.empLeaveType?.name || "",
    "Leave Dates": formatLeaveDates(item?.startDate, item?.endDate),
    Reason: item?.reason || "",
    Decision: item?.decisionReason || "",
    Status: statusLabel(item),
    Applied: item?.createdAt ? helpers.dDate(item.createdAt) : "",
    Approved: item?.approvalDate ? helpers.dDate(item.approvalDate) : "",
    "Action By": joinLines(
      approverName(item),
      item?.approver?.employee?.designation?.name,
    ),
    File: item?.attachmentMedia?.fileUrl ? "Yes" : "No",
  };
};

export const mapCardLeaveSummaryToExportRow = (item, index = 0) => {
  const isPlaceholderApproval =
    !item?.approvalDate ||
    item.approvalDate === "2023-01-01T00:00:00.000Z";

  return {
    SL: index + 1,
    Employee: joinLines(item?.employeeName, item?.email),
    "Leave Type": item?.leaveType || "",
    "Leave Dates": formatLeaveDates(item?.startDate, item?.endDate),
    Duration: cardLeaveDuration(item?.startDate, item?.endDate),
    Reason: item?.reason || "",
    Decision: item?.decisionReason || "",
    Status: item?.approveStatus?.name || "",
    Applied: item?.appliedOn ? helpers.dDate(item.appliedOn) : "",
    Approved: isPlaceholderApproval ? "Not Yet" : helpers.dDate(item.approvalDate),
    "Action By": joinLines(item?.actionByName, item?.actionByDesignation),
  };
};

const COLUMN_WIDTHS = {
  SL: 26,
  Employee: 160,
  Phone: 72,
  Designation: 62,
  Office: 58,
  "Office Type": 52,
  Department: 56,
  "Leave Type": 68,
  "Leave Dates": 96,
  Duration: 42,
  Reason: 70,
  Decision: 70,
  Status: 52,
  Applied: 56,
  Approved: 56,
  "Action By": 72,
  File: 32,
};

const excelColumnWidth = {
  Employee: 32,
  "Leave Dates": 14,
  Reason: 28,
  Decision: 28,
  "Action By": 22,
  Phone: 16,
  "Leave Type": 18,
};

export const exportRowsToExcel = (rows, filename, sheetName = "Report") => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] || {}).map((key) => ({
    wch: excelColumnWidth[key] || Math.min(Math.max(String(key).length + 2, 12), 24),
  }));
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename);
};

const drawWatermark = (pdf, pageWidth, pageHeight) => {
  pdf.saveGraphicsState();
  const gState = pdf.GState({ opacity: 0.1 });
  pdf.setGState(gState);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(36);
  pdf.setTextColor(180, 180, 180);
  pdf.text(
    "AI Powerd HR Management System (OMS)",
    pageWidth / 2,
    pageHeight / 2,
    { align: "center", baseline: "middle", angle: 45 },
  );
  pdf.restoreGraphicsState();
};

const addPdfHeaderFooter = (pdf, data, title, authUser) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor("#006187");
  pdf.text(title, pageWidth / 2, 30, { align: "center" });

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor("#000000");
  pdf.text(
    `Generated by: ${authUser?.fullName || "N/A"}`,
    pageWidth / 2,
    45,
    { align: "center" },
  );
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Generated At: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    60,
    { align: "center" },
  );

  const pageCount = pdf.internal.getNumberOfPages();
  pdf.setFontSize(10);
  pdf.text(
    `Page ${data.pageNumber} of ${pageCount}`,
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" },
  );
};

const leftAlignedColumns = new Set(["Employee", "Reason", "Decision", "Action By"]);

export const buildLeaveRequestsPdf = (title, rows, authUser) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const headers = Object.keys(rows[0] || {});
  const body = rows.map((row) => headers.map((key) => row[key] ?? ""));
  const preferredTotal = headers.reduce(
    (sum, key) => sum + (COLUMN_WIDTHS[key] || 56),
    0,
  );
  const scale = contentWidth / (preferredTotal || 1);
  const columnStyles = {};
  headers.forEach((key, index) => {
    columnStyles[index] = {
      cellWidth: (COLUMN_WIDTHS[key] || 56) * scale,
      halign: leftAlignedColumns.has(key) ? "left" : "center",
      valign: "middle",
    };
  });

  pdf.autoTable({
    head: [headers],
    body,
    startY: 78,
    theme: "grid",
    tableWidth: contentWidth,
    headStyles: {
      fillColor: [0, 97, 135],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
      halign: "center",
      valign: "middle",
      overflow: "linebreak",
    },
    bodyStyles: { fontSize: 7, valign: "middle", overflow: "linebreak" },
    styles: {
      cellPadding: 3,
      overflow: "linebreak",
      fontSize: 7,
      lineWidth: 0.2,
    },
    columnStyles,
    didParseCell: (data) => {
      const header = headers[data.column.index];
      if (data.section === "body" && typeof data.cell.raw === "string" && data.cell.raw.includes("\n")) {
        data.cell.text = data.cell.raw.split("\n");
      }
      if (header === "Employee" || header === "Leave Dates") {
        data.cell.styles.minCellHeight = 32;
      }
    },
    willDrawPage: () => drawWatermark(pdf, pageWidth, pageHeight),
    didDrawPage: (data) => addPdfHeaderFooter(pdf, data, title, authUser),
    margin: { top: 70, bottom: 36, left: marginX, right: marginX },
  });

  return pdf;
};

export const leaveReportColumnLayout = (pageWidth, leaveTypeCount, marginX = 18) => {
  const contentWidth = pageWidth - marginX * 2;
  const typeCols = Math.max(Number(leaveTypeCount) || 0, 0) * 2;
  let fontSize = 7;
  let sl = 26;
  let employee = 160;
  let total = 56;
  let type = 48;

  const widthSum = () => sl + employee + total + typeCols * type;
  if (typeCols > 0 && widthSum() > contentWidth) {
    fontSize = 6;
    employee = 128;
    total = 46;
    type = 36;
  }
  if (typeCols > 0 && widthSum() > contentWidth) {
    const scale = contentWidth / widthSum();
    sl *= scale;
    employee *= scale;
    total *= scale;
    type *= scale;
    fontSize = 5.5;
  } else if (typeCols > 0 && widthSum() < contentWidth) {
    type += (contentWidth - widthSum()) / typeCols;
  } else if (typeCols === 0) {
    employee = Math.max(contentWidth - sl - total, 120);
  }

  const columnStyles = {
    0: { cellWidth: sl, halign: "center", valign: "middle" },
    1: { cellWidth: employee, halign: "left", valign: "middle" },
    2: { cellWidth: total, halign: "center", valign: "middle" },
  };
  for (let i = 0; i < typeCols; i += 1) {
    columnStyles[3 + i] = { cellWidth: type, halign: "center", valign: "middle" };
  }

  return { columnStyles, fontSize, marginX, contentWidth };
};

export const buildLeaveReportPdf = (
  listData,
  leaveTypeDataArray,
  authUser,
) => {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const totalAllowedDays = leaveTypeDataArray.reduce(
    (sum, lt) => sum + (lt.maxDaysPerYear || 0),
    0,
  );

  const firstRow = [
    { content: "SL", rowSpan: 2 },
    { content: "EMPLOYEE DETAILS", rowSpan: 2 },
    {
      content: `Total Allowed Days (${totalAllowedDays} Days)`,
      colSpan: 1,
      styles: { halign: "center", fontStyle: "bold" },
    },
  ];

  leaveTypeDataArray.forEach((lt) => {
    const paidStatus = lt.isPaid ? "Paid" : "Unpaid";
    firstRow.push({
      content: `${lt.name} (${lt.maxDaysPerYear} Days) - ${paidStatus}`,
      colSpan: 2,
      styles: { halign: "center", fontStyle: "bold" },
    });
  });

  const secondRow = [
    {
      content: "Total Leave Days",
      styles: { halign: "center", fontStyle: "bold" },
    },
  ];

  leaveTypeDataArray.forEach(() => {
    secondRow.push(
      { content: "Used\nDays", styles: { halign: "center", fontStyle: "bold" } },
      {
        content: "Remaining\nDays",
        styles: { halign: "center", fontStyle: "bold" },
      },
    );
  });

  const tableRows = listData.map((item, index) => {
    const row = [
      item.sl || index + 1,
      {
        name: item.employeeName || "",
        code: item.employeeCode || "",
        designation: item.designation || "",
      },
      item.totalLeaveDays || 0,
    ];

    leaveTypeDataArray.forEach((lt) => {
      const leaveData = item.leaveTypes?.find((l) => l.leaveTypeId === lt.id);
      row.push(leaveData?.usedDays || 0);
      row.push(leaveData?.remainingDays || 0);
    });

    return row;
  });

  const { columnStyles, fontSize, marginX } = leaveReportColumnLayout(
    pageWidth,
    leaveTypeDataArray.length,
  );

  const title = `${authUser?.appUser?.application?.name || "Company"} — Yearly Leave Report`;

  pdf.autoTable({
    head: [firstRow, secondRow],
    body: tableRows,
    startY: 70,
    theme: "grid",
    tableWidth: pageWidth - marginX * 2,
    headStyles: {
      fillColor: [0, 97, 135],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fontSize,
      overflow: "linebreak",
      lineColor: [0, 97, 135],
      lineWidth: 0.2,
    },
    bodyStyles: {
      fontSize,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      textColor: [17, 24, 39],
      valign: "middle",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: {
      cellPadding: 3,
      font: "helvetica",
      overflow: "linebreak",
      fontSize,
      valign: "middle",
    },
    columnStyles,
    didParseCell: (data) => {
      if (
        data.section === "body" &&
        data.column.index === 1 &&
        typeof data.cell.raw === "object"
      ) {
        const emp = data.cell.raw;
        data.cell.text = [emp.name, emp.code, emp.designation].filter(Boolean);
      }
      if (data.section === "body" && data.column.index > 2) {
        const colIndex = data.column.index - 3;
        const isUsed = colIndex % 2 === 0;
        if (isUsed) {
          data.cell.styles.textColor = [37, 99, 235];
        } else {
          const remaining = parseFloat(data.cell.raw) || 0;
          data.cell.styles.textColor =
            remaining < 2 ? [234, 88, 12] : [22, 163, 74];
        }
        data.cell.styles.halign = "center";
        data.cell.styles.fontStyle = "bold";
      }
    },
    willDrawPage: () => drawWatermark(pdf, pageWidth, pageHeight),
    didDrawPage: (data) => addPdfHeaderFooter(pdf, data, title, authUser),
    margin: { top: 70, bottom: 36, left: marginX, right: marginX },
  });

  return pdf;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const renderExportCell = (header, value) => {
  const text = String(value ?? "");
  if (header === "Employee") {
    const [name, ...rest] = text.split("\n");
    const email = rest.join(" ").trim();
    return `<div class="emp-name">${escapeHtml(name)}</div>${
      email ? `<div class="emp-email">${escapeHtml(email)}</div>` : ""
    }`;
  }
  if (header === "Leave Dates") {
    return text
      .split("\n")
      .filter(Boolean)
      .map((line) => `<div class="${line === "to" ? "date-to" : "date-line"}">${escapeHtml(line)}</div>`)
      .join("");
  }
  if (header === "Action By") {
    const [name, ...rest] = text.split("\n");
    const designation = rest.join(" ").trim();
    return `<div class="emp-name">${escapeHtml(name)}</div>${
      designation ? `<div class="emp-email">${escapeHtml(designation)}</div>` : ""
    }`;
  }
  return escapeHtml(text).replace(/\n/g, "<br>");
};

export const printExportRows = (title, rows) => {
  const headers = Object.keys(rows[0] || {});
  const preferredTotal = headers.reduce(
    (sum, key) => sum + (COLUMN_WIDTHS[key] || 56),
    0,
  );
  const tableHead = headers
    .map((header) => {
      const width = (((COLUMN_WIDTHS[header] || 56) / preferredTotal) * 100).toFixed(2);
      return `<th style="width:${width}%">${escapeHtml(header)}</th>`;
    })
    .join("");
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((header) => {
            const align = leftAlignedColumns.has(header) ? "left" : "center";
            return `<td class="col-${header.replace(/\s+/g, "-").toLowerCase()}" style="text-align:${align}">${renderExportCell(header, row[header])}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Popup blocked");
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; margin: 0; color: #111; }
          h1 { font-size: 16px; margin: 0 0 4px; text-align: center; color: #006187; }
          p { font-size: 11px; color: #555; margin: 0 0 12px; text-align: center; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
          th, td { border: 1px solid #cbd5e1; padding: 4px 5px; vertical-align: middle; word-break: normal; overflow-wrap: break-word; }
          th { background: #006187; color: #fff; text-align: center; font-size: 8px; line-height: 1.2; }
          tr:nth-child(even) td { background: #f8fafc; }
          .emp-name { font-weight: 700; line-height: 1.25; }
          .emp-email { margin-top: 2px; color: #475569; font-size: 8px; line-height: 1.2; word-break: normal; }
          .date-line { white-space: nowrap; font-weight: 600; line-height: 1.2; }
          .date-to { color: #64748b; font-size: 8px; line-height: 1.1; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Generated At: ${escapeHtml(new Date().toLocaleString())}</p>
        <table>
          <thead><tr>${tableHead}</tr></thead>
          <tbody>${tableBody}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

export const exportLeaveTable = ({
  format,
  title,
  data,
  variant = "leaveRequest",
  leaveTypeDataArray = [],
  authUser,
}) => {
  if (!data?.length) {
    helpers.toaster("No data to export", "warning");
    return;
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/\s+/g, "_");
  const rows =
    variant === "leaveReport"
      ? data.map((item) => mapLeaveReportToExportRow(item, leaveTypeDataArray))
      : variant === "cardLeaveSummary"
        ? data.map((item, index) => mapCardLeaveSummaryToExportRow(item, index))
        : data.map(mapLeaveRequestToExportRow);

  if (format === "excel") {
    exportRowsToExcel(rows, `${safeTitle}_${dateStr}.xlsx`, title);
  } else if (format === "pdf") {
    const pdf =
      variant === "leaveReport"
        ? buildLeaveReportPdf(data, leaveTypeDataArray, authUser)
        : buildLeaveRequestsPdf(title, rows, authUser);
    pdf.save(`${safeTitle}_${dateStr}.pdf`);
  } else if (format === "print") {
    if (variant === "leaveReport") {
      const pdf = buildLeaveReportPdf(data, leaveTypeDataArray, authUser);
      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank");
    } else {
      printExportRows(title, rows);
    }
  }

  helpers.toaster(`Exported ${rows.length} record(s) successfully`, "success");
};
