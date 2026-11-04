import jsPDF from "jspdf";

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatDateShort = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (amount, currencySymbol = "$") => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return `${currencySymbol}0.00`;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `${currencySymbol}${formatted}`;
};

const getBase64ImageFromUrl = async (imageUrl) => {
  try {
    const res = await fetch(window.location.origin + imageUrl);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const generateVoucherPdf = async (row) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const marginX = 45;

  // Values extraction
  const voucherNumber =
    row?.voucherNumber ||
    row?.voucher_number ||
    row?.number ||
    (row?.invoiceId ? `VOU-${row.expenseId || row.id}` : "VOU-2025-001");
  const receiptNumber =
    row?.receiptNumber ||
    row?.receipt_number ||
    row?.transactionId ||
    row?.tranId ||
    row?.stripe_payment_intent_id ||
    (row?.id ? `2087-${row.id}` : "2087-3956");
  const datePaidRaw =
    row?.paidAt ||
    row?.paid_at ||
    row?.paymentDate ||
    row?.createdAt ||
    new Date();
  const datePaid = formatDate(datePaidRaw);
  const paymentMethod = row?.paymentMethod || row?.payment_method || "Link";

  const currencySymbol = row?.currency === "BDT" ? "BDT " : "$";
  const amountVal = row?.amount ?? row?.totalAmount ?? row?.total_amount ?? 0;
  const formattedAmount = formatCurrency(amountVal, currencySymbol);

  const description =
    row?.description ||
    row?.category ||
    row?.notes ||
    
    "Expense";
  const activeFrom = row?.activeFrom || row?.subscriptionStartDate;
  const activeTo = row?.activeTo || row?.subscriptionEndDate;
  const billingPeriod =
    activeFrom && activeTo
      ? `${formatDateShort(activeFrom)} – ${formatDateShort(activeTo)}`
      : row?.billingCycle
      ? `${row.billingCycle} billing`
      : "";

  const vendorName =
    row?.vendorName ||
    row?.vendor_name ||
    row?.vendor ||
    
    "Vendor";
  const vendorEmail =
    row?.vendorEmail ||
    row?.vendor_email ||
    
    "";

  // --- 1. TOP HEADER ---
  let y = 50;

  // Title: Receipt
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(17, 17, 17);
  doc.text("Payment Voucher", marginX, y);

  // Brand Logo on top right
  const logoData = await getBase64ImageFromUrl("/images/sanzio-logo-invoice.png");
  if (logoData) {
    // Assuming the logo has a 3:1 aspect ratio or similar, we set height to 25 and width accordingly.
    // Right align: we subtract the width from the right edge.
    const logoWidth = 110;
    const logoHeight = 25;
    doc.addImage(logoData, "PNG", pageWidth - marginX - logoWidth, y - 20, logoWidth, logoHeight);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(17, 17, 17);
    doc.text("Sanzio", pageWidth - marginX, y, { align: "right" });
  }

  y += 30;

  // Metadata block
  const metaLabels = [
    ["Voucher number", voucherNumber],
    ["Reference number", receiptNumber],
    ["Date paid", datePaid],
    ["Payment method", paymentMethod],
  ];

  doc.setFontSize(9.5);
  metaLabels.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 17, 17);
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 17, 17);
    doc.text(String(value || "-"), marginX + 105, y);
    y += 16;
  });

  y += 20;

  // --- 2. SENDER & BILL TO ADDRESS SECTION ---
  const col1X = marginX;
  const col2X = marginX + 230;
  let addressY = y;

  // Left Column: Company Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(17, 17, 17);
  doc.text("Revinr IT", col1X, addressY);
  addressY += 14;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("House 37, Road 3, Sector 9", col1X, addressY);
  addressY += 13;
  doc.text("Uttara, Dhaka 1230", col1X, addressY);
  addressY += 13;
  doc.text("Bangladesh", col1X, addressY);
  addressY += 13;
  doc.text("support@revinr.com", col1X, addressY);

  // Right Column: Bill To
  let rightY = y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(17, 17, 17);
  doc.text("Pay to", col2X, rightY);
  rightY += 14;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  doc.text(String(vendorName), col2X, rightY);
  rightY += 13;
  if (vendorEmail) {
    doc.text(String(vendorEmail), col2X, rightY);
    rightY += 13;
  }

  y = Math.max(addressY, rightY) + 35;

  // --- 3. HERO AMOUNT PAID BANNER ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 17, 17);
  doc.text(`${formattedAmount} paid on ${datePaid}`, marginX, y);

  y += 30;

  // --- 4. LINE ITEMS TABLE ---
  // Top border line
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 18;

  // Headers: Description | Qty | Unit price | Amount
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);

  const colQtyX = marginX + 310;
  const colPriceX = marginX + 390;
  const colAmountX = pageWidth - marginX;

  doc.text("Description", marginX, y);
  doc.text("Qty", colQtyX, y, { align: "right" });
  doc.text("Unit price", colPriceX, y, { align: "right" });
  doc.text("Amount", colAmountX, y, { align: "right" });

  y += 18;

  // Item Row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(17, 17, 17);
  doc.text(String(description), marginX, y);

  doc.text("1", colQtyX, y, { align: "right" });
  doc.text(formattedAmount, colPriceX, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(formattedAmount, colAmountX, y, { align: "right" });

  if (billingPeriod) {
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(billingPeriod, marginX, y);
  }

  y += 40;

  // --- 5. TOTALS SECTION ---
  const totalBoxWidth = 230;
  const totalBoxX = pageWidth - marginX - totalBoxWidth;

  const totals = [
    ["Subtotal", formattedAmount, false],
    ["Total", formattedAmount, false],
    ["Amount paid", formattedAmount, true],
  ];

  totals.forEach(([label, val, isBold]) => {
    // Top border line for each total row
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(totalBoxX, y - 10, pageWidth - marginX, y - 10);

    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 10 : 9.5);
    doc.setTextColor(17, 17, 17);

    doc.text(label, totalBoxX, y);
    doc.text(val, pageWidth - marginX, y, { align: "right" });

    y += 22;
  });

  // --- 6. FOOTER ---
  const footerY = pageHeight - 40;
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.5);
  doc.line(marginX, footerY - 15, pageWidth - marginX, footerY - 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);

  const footerLeftText = `${receiptNumber} · ${formattedAmount} paid on ${datePaid}`;
  doc.text(footerLeftText, marginX, footerY);
  doc.text("Page 1 of 1", pageWidth - marginX, footerY, { align: "right" });

  return doc;
};
