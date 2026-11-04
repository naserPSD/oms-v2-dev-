// src/utils/generateRefundPdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue).slice(0, 10);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "0.00 BDT";
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) + " BDT"
  );
};

// Calculate human-readable duration between allocation date and return date
export const calculateUsageDuration = (startDateValue, endDateValue) => {
  if (!startDateValue || !endDateValue) return "N/A";
  const start = new Date(startDateValue);
  const end = new Date(endDateValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "N/A";

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return "0 days";

  const totalDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;

  const parts = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);

  return `${parts.join(" ")} (${totalDays} days)`;
};

const getBase64ImageFromUrl = async (imageUrl) => {
  if (typeof window === "undefined") return null;
  try {
    const url = imageUrl.startsWith("http")
      ? imageUrl
      : `${window.location.origin}${imageUrl}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return null;
  }
};

/**
 * Generate a professional, modern Asset Handover & Refund Certificate PDF
 * @param {Object|Array} rowOrItems - Single request object or array of asset items
 */
export const generateRefundPdf = async (rowOrItems) => {
  try {
    const isArray = Array.isArray(rowOrItems);
    const primaryItem = isArray ? rowOrItems[0] || {} : rowOrItems || {};
    const primaryPayload = primaryItem?.refundRequest
      ? { ...primaryItem, ...primaryItem.refundRequest }
      : primaryItem;

    const items = isArray
      ? rowOrItems
      : Array.isArray(primaryItem?.items)
      ? primaryItem.items
      : [primaryItem];

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
    const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
    const marginX = 40;
    const contentWidth = pageWidth - marginX * 2;

    // Extract employee & request info
    const requestNo =
      primaryPayload?.request_no ||
      (primaryPayload?.id ? `REF-REQ-${primaryPayload.id}` : "REF-REQ-0001");

    const employeeName =
      `${primaryPayload?.first_name || ""} ${primaryPayload?.last_name || ""}`.trim() ||
      primaryPayload?.employeeName ||
      "Authorized Employee";
    const employeeCode =
      primaryPayload?.employee_code || primaryPayload?.employeeCode || "-";
    const designation =
      primaryPayload?.designation_name || primaryPayload?.designation || "Employee";

    const defaultReturnDate =
      primaryPayload?.action_date ||
      primaryPayload?.withdrawal_date ||
      primaryPayload?.request_date ||
      new Date();

    const approverName =
      `${primaryPayload?.approver_first_name || ""} ${primaryPayload?.approver_last_name || ""}`.trim() ||
      primaryPayload?.approverName ||
      "Authorized HR Administrator";

    const reason =
      primaryPayload?.reason || "Asset handover and return upon request.";
    const actionNote =
      primaryPayload?.action_note ||
      "Asset inspected and accepted in good order. Official clearance approved.";

    let currentY = 40;

    // 1. Top Decorative Brand Bar
    doc.setFillColor(37, 99, 235); // Blue primary
    doc.rect(0, 0, pageWidth, 6, "F");

    // 2. Sanzio Logo & Header
    const logoBase64 =
      (await getBase64ImageFromUrl("/images/sanzio-logo-invoice.png")) ||
      (await getBase64ImageFromUrl("/images/sanzio-logo.png"));

    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", marginX, currentY, 110, 32);
      } catch (e) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text("SANZIO", marginX, currentY + 22);
      }
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("SANZIO", marginX, currentY + 22);
    }

    // Right Side Header Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("ASSET REFUND CERTIFICATE", pageWidth - marginX, currentY + 12, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Certificate No: ${requestNo}`, pageWidth - marginX, currentY + 26, {
      align: "right",
    });
    doc.text(
      `Date Issued: ${formatDate(defaultReturnDate)}`,
      pageWidth - marginX,
      currentY + 38,
      { align: "right" }
    );

    currentY += 60;

    // Horizontal Divider Line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(1);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);

    currentY += 15;

    // 3. Status Banner / Badge
    doc.setFillColor(236, 253, 245); // Light emerald green
    doc.roundedRect(marginX, currentY, contentWidth, 34, 4, 4, "F");
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(marginX, currentY, contentWidth, 34, 4, 4, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70); // Dark emerald
    doc.text(
      "OFFICIAL ACKNOWLEDGMENT: ASSET RETURN & REFUND APPROVED",
      marginX + 15,
      currentY + 21
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(4, 120, 87);
    doc.text("SETTLED", pageWidth - marginX - 15, currentY + 21, {
      align: "right",
    });

    currentY += 48;

    // 4. Employee Information Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text("EMPLOYEE / HANDOVER INFORMATION", marginX, currentY);

    currentY += 8;

    // Info Box (2 columns)
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(marginX, currentY, contentWidth, 68, 4, 4, "F");
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(marginX, currentY, contentWidth, 68, 4, 4, "S");

    const col1X = marginX + 14;
    const col2X = marginX + contentWidth / 2 + 10;
    let infoY = currentY + 18;

    // Column 1: Employee info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Employee Name:", col1X, infoY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(employeeName, col1X + 80, infoY);

    infoY += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Employee Code:", col1X, infoY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(employeeCode, col1X + 80, infoY);

    infoY += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Designation:", col1X, infoY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.text(designation, col1X + 80, infoY);

    // Column 2: Return details
    infoY = currentY + 18;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Request Date:", col2X, infoY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    doc.text(formatDate(primaryPayload?.request_date), col2X + 85, infoY);

    infoY += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Refund Date:", col2X, infoY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Green
    doc.text(formatDate(defaultReturnDate), col2X + 85, infoY);

    infoY += 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Approved By:", col2X, infoY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    doc.text(approverName, col2X + 85, infoY);

    currentY += 82;

    // 5. Refunded Assets Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text("REFUNDED ASSET DETAILS", marginX, currentY);

    currentY += 8;

    let totalAmount = 0;
    const tableBody = items.map((it) => {
      const p = it?.refundRequest ? { ...it, ...it.refundRequest } : (it || {});
      const aDesc =
        p.asset_description ||
        p.itemDescription ||
        p.description ||
        p.asset_model ||
        "Hardware Asset";
      const aType = p.asset_type_name || p.assetTypeName || "Equipment";
      const m = p.asset_model || p.model || "-";
      const s = p.asset_serial || p.serial || "-";
      const allocDate =
        p.asset_allocation_date ||
        p.allocation_date ||
        p.allocationDate ||
        p.created_at;
      const retDate =
        p.action_date ||
        p.withdrawal_date ||
        p.request_date ||
        defaultReturnDate;
      const uDuration = calculateUsageDuration(allocDate, retDate);
      const val = Number(p.asset_amount ?? p.amount ?? 0);
      totalAmount += isNaN(val) ? 0 : val;

      return [
        aDesc,
        aType,
        `Model: ${m}\nSN: ${s}`,
        formatDate(allocDate),
        formatDate(retDate),
        uDuration,
        formatCurrency(val),
      ];
    });

    if (items.length > 1) {
      tableBody.push([
        "Total Settled Value",
        "",
        "",
        "",
        "",
        `${items.length} Assets`,
        formatCurrency(totalAmount),
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [
        [
          "Asset / Item Details",
          "Category",
          "Model & Serial",
          "Allocated On",
          "Returned On",
          "Usage Period",
          "Asset Value",
        ],
      ],
      body: tableBody,
      theme: "striped",
      headStyles: {
        fillColor: [30, 58, 138], // Dark Navy
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: "bold",
        halign: "left",
        cellPadding: 6,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [31, 41, 55],
        cellPadding: 7,
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 105, fontStyle: "bold" },
        1: { cellWidth: 65 },
        2: { cellWidth: 85 },
        3: { cellWidth: 65 },
        4: { cellWidth: 65 },
        5: { cellWidth: 70, fontStyle: "bold", textColor: [37, 99, 235] },
        6: { cellWidth: 60, halign: "right", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (items.length > 1 && data.row.index === tableBody.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [243, 244, 246];
        }
      },
    });

    currentY = doc.lastAutoTable.finalY + 16;

    // 6. Notes & Reason Cards
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(marginX, currentY, contentWidth, 54, 4, 4, "F");
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(marginX, currentY, contentWidth, 54, 4, 4, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text("Handover Reason from Employee:", marginX + 12, currentY + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text(
      doc.splitTextToSize(reason, contentWidth - 24),
      marginX + 12,
      currentY + 28
    );

    doc.setFont("helvetica", "bold");
    doc.text("Admin Clearance Note:", marginX + 12, currentY + 42);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.text(
      doc.splitTextToSize(actionNote, contentWidth - 140),
      marginX + 115,
      currentY + 42
    );

    currentY += 72;

    // 7. Clearance Confirmation Statement
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Declaration: The equipment listed above has been returned to the company in satisfactory condition and officially documented. All associated hardware allocations and security clearances have been settled.",
      marginX,
      currentY,
      { maxWidth: contentWidth }
    );

    currentY += 46;

    // 8. Signatures Block
    const sigWidth = 160;
    const sigLeftX = marginX + 20;
    const sigRightX = pageWidth - marginX - sigWidth - 20;

    // Handed Over By
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.75);
    doc.line(sigLeftX, currentY, sigLeftX + sigWidth, currentY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text("Returned / Handed Over By", sigLeftX + sigWidth / 2, currentY + 14, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(employeeName, sigLeftX + sigWidth / 2, currentY + 26, {
      align: "center",
    });
    doc.text(`ID: ${employeeCode}`, sigLeftX + sigWidth / 2, currentY + 36, {
      align: "center",
    });

    // Received & Approved By
    doc.line(sigRightX, currentY, sigRightX + sigWidth, currentY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text("Received & Approved By", sigRightX + sigWidth / 2, currentY + 14, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(approverName, sigRightX + sigWidth / 2, currentY + 26, {
      align: "center",
    });
    doc.text("HR & Operations Team", sigRightX + sigWidth / 2, currentY + 36, {
      align: "center",
    });

    // 9. Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generated by Sanzio OMS on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} • Official Asset Clearance`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    // Download the PDF
    const cleanFilename = `Refund_Certificate_${requestNo}_${employeeCode}.pdf`.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
    doc.save(cleanFilename);
  } catch (error) {
    console.error("Failed to generate refund certificate PDF:", error);
    if (typeof window !== "undefined" && window.alert) {
      window.alert("Failed to generate PDF. Please try again.");
    }
  }
};
