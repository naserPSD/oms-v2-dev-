"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Receipt,
  Check,
  Banknote,
  Filter,
} from "lucide-react";
import InvoiceModal, { CURRENCIES, PAYMENT_METHODS } from "./InvoiceModal";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import { createOrUpdateInvoice, deleteInvoiceApi } from "@/services/accountsApi";
import { useCompanySettingsQueryApi } from "@/hooks/queryApi/useCompanySettingsQueryApi";
import { useAccountsQueryApi } from "@/hooks/queryApi/useAccountsQueryApi";
import { useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/utils/helpers";
import Swal from "sweetalert2";

// Invoice records loaded directly from database

// Helper to normalize invoice calculations consistently
const normalizeInvoice = (inv) => {
  const totalAmount = Number(inv.totalAmount || inv.subtotal || inv.baseAmount || 0);
  const statusStr = String(inv.status || "").toLowerCase();
  const paymentStatusStr = String(inv.paymentStatus || "").toLowerCase();

  const isExplicitPaid = statusStr === "paid" || paymentStatusStr === "paid";

  let paidAmount = 0;
  let dueAmount = 0;

  if (isExplicitPaid) {
    paidAmount = totalAmount;
    dueAmount = 0;
  } else {
    const rawPaid = Number(inv.paidAmount || 0);
    paidAmount = Math.min(totalAmount, Math.max(0, rawPaid));
    dueAmount = Math.max(0, totalAmount - paidAmount);

    if (dueAmount === 0 && totalAmount > 0 && rawPaid === 0) {
      dueAmount = totalAmount;
    }
  }

  const isPaid = isExplicitPaid || dueAmount === 0;

  let isOverdue = false;
  if (!isPaid && inv.dueDate) {
    try {
      const dueTimestamp = new Date(inv.dueDate).setHours(23, 59, 59, 999);
      if (!isNaN(dueTimestamp) && dueTimestamp < Date.now()) {
        isOverdue = true;
      }
    } catch {
      isOverdue = false;
    }
  }
  if (statusStr === "overdue") isOverdue = true;

  let finalStatus = "due";
  if (statusStr === "draft") {
    finalStatus = "draft";
  } else if (isPaid) {
    finalStatus = "paid";
  } else if (paidAmount > 0 && dueAmount > 0) {
    finalStatus = "partial";
  } else if (isOverdue) {
    finalStatus = "overdue";
  } else {
    finalStatus = "due";
  }

  return {
    ...inv,
    totalAmount,
    paidAmount,
    dueAmount,
    isPaid,
    isOverdue,
    status: finalStatus,
    paymentStatus: isPaid ? "paid" : paidAmount > 0 ? "partial" : "unpaid",
  };
};

export default function AccountsInvoice() {
  const queryClient = useQueryClient();
  const { useInvoicesQuery } = useAccountsQueryApi();
  const {
    data: invoicesRes,
    isLoading: isQueryLoading,
    isFetching,
    refetch,
  } = useInvoicesQuery({ limit: 50 });

  const [invoices, setInvoices] = useState([]);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const isLoading = (isQueryLoading && !invoicesRes && invoices.length === 0) || isManualLoading;

  // Responsive Filter States (Inspired by /employee DataFilter)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(true);

  // Company Profile from /company-settings
  const { useGetCompanyInfoQuery } = useCompanySettingsQueryApi({});
  const { data: companyRes } = useGetCompanyInfoQuery();
  const companyProfile = useMemo(() => {
    const raw = companyRes?.data?.data || companyRes?.data || companyRes;
    return (raw && typeof raw === "object" && "name" in raw)
      ? raw
      : ((raw && typeof raw === "object" && "data" in raw && raw.data) ? raw.data : (raw || null));
  }, [companyRes]);

  // Pagination State (Default 10 per page as requested)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("edit"); // "edit" | "preview"
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Parse and normalize raw invoices response into state
  const processInvoicesData = (res) => {
    let loaded = [];

    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      loaded = res.data.map((inv) => {
        let items = [];
        let meta = {};

        if (typeof inv.invoiceItems === "string") {
          try {
            const parsed = JSON.parse(inv.invoiceItems);
            if (Array.isArray(parsed)) {
              items = parsed;
            } else if (parsed && typeof parsed === "object") {
              items = parsed.items || [];
              meta = parsed;
            }
          } catch {
            items = [];
          }
        } else if (Array.isArray(inv.invoiceItems)) {
          items = inv.invoiceItems;
        } else if (inv.invoiceItems && typeof inv.invoiceItems === "object") {
          items = inv.invoiceItems.items || [];
          meta = inv.invoiceItems;
        }

        const clientName =
          meta.clientName ||
          (inv.user ? `${inv.user.firstName || ""} ${inv.user.lastName || ""}`.trim() : "") ||
          inv.clientName ||
          "Corporate Client";

        const clientEmail = meta.clientEmail || inv.user?.email || inv.clientEmail || "";
        const clientCompany = meta.clientCompany || inv.clientCompany || "";
        const clientPhone = meta.clientPhone || inv.user?.phone || inv.clientPhone || "";
        const clientAddress = meta.clientAddress || inv.clientAddress || "";
        const paymentMethod = meta.paymentMethod || inv.paymentMethod || (inv.status === "paid" ? "cash" : "due");

        const rawTotal = Number(inv.totalAmount || inv.subtotal || inv.baseAmount || 0);
        const rawPaid = meta.paidAmount !== undefined ? Number(meta.paidAmount) : (inv.status === "paid" || inv.paymentStatus === "paid" ? rawTotal : Number(inv.paidAmount || 0));
        const rawDue = meta.dueAmount !== undefined ? Number(meta.dueAmount) : Math.max(0, rawTotal - rawPaid);

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber || `INV-${inv.id}`,
          currency: inv.currency || "BDT",
          status: inv.status || "sent",
          paymentStatus: inv.paymentStatus || (rawDue === 0 ? "paid" : rawPaid > 0 ? "partial" : "unpaid"),
          paymentMethod,
          paidAmount: rawPaid,
          dueAmount: rawDue,
          issueDate: inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : "",
          subtotal: Number(inv.subtotal || inv.baseAmount || 0),
          taxAmount: Number(inv.taxAmount || 0),
          discountAmount: Number(inv.discountAmount || 0),
          totalAmount: rawTotal,
          clientName,
          clientEmail,
          clientCompany,
          clientPhone,
          clientAddress,
          fromCompany: meta.fromCompany || "",
          fromEmail: meta.fromEmail || "",
          fromPhone: meta.fromPhone || "",
          fromAddress: meta.fromAddress || "",
          items: items.length > 0 ? items : [
            { id: "1", title: inv.planName || "OMS Enterprise Subscription", quantity: inv.userCount || 1, unitPrice: Number(inv.subtotal || rawTotal || 0) },
          ],
          notes: meta.notes || inv.notes || "",
          paymentTerms: meta.paymentTerms || inv.paymentTerms || "",
          createdAt: inv.createdAt,
        };
      });
    }

    // Check if there is an in-progress draft saved locally from current session
    let draftInvoice = null;
    if (typeof window !== "undefined") {
      try {
        const draftStr = localStorage.getItem("oms_active_invoice_draft");
        if (draftStr) {
          const parsedDraft = JSON.parse(draftStr);
          if (parsedDraft && (parsedDraft.clientName || parsedDraft.items?.length > 0)) {
            draftInvoice = {
              ...parsedDraft,
              id: parsedDraft.id || "draft_active",
              status: "draft",
              paymentStatus: "unpaid",
            };
          }
        }
      } catch {
        draftInvoice = null;
      }
    }

    if (draftInvoice) {
      const alreadyInLoaded = loaded.some((i) => String(i.id) === String(draftInvoice.id) || i.invoiceNumber === draftInvoice.invoiceNumber);
      if (!alreadyInLoaded) {
        loaded = [draftInvoice, ...loaded];
      }
    }

    return loaded.map(normalizeInvoice);
  };

  // Populate invoices automatically when cache or network query updates
  useEffect(() => {
    if (invoicesRes) {
      const normalized = processInvoicesData(invoicesRes);
      setInvoices(normalized);
    }
  }, [invoicesRes]);

  // Load / Refresh invoices strictly from database API with query invalidation
  const loadInvoices = async () => {
    setIsManualLoading(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["accountsInvoices"] });
      const fresh = await refetch();
      if (fresh?.data) {
        const normalized = processInvoicesData(fresh.data);
        setInvoices(normalized);
      }
    } catch (err) {
      console.error("Failed loading invoices from API:", err);
      toaster("Failed to load invoices from database", "error");
    } finally {
      setIsManualLoading(false);
    }
  };

  // Filter helpers (Inspired by /employee)
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchTerm.trim() ||
      statusFilter !== "all" ||
      paymentMethodFilter !== "all" ||
      currencyFilter !== "all" ||
      startDate ||
      endDate
    );
  }, [searchTerm, statusFilter, paymentMethodFilter, currencyFilter, startDate, endDate]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== "all") count++;
    if (paymentMethodFilter !== "all") count++;
    if (currencyFilter !== "all") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [searchTerm, statusFilter, paymentMethodFilter, currencyFilter, startDate, endDate]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setCurrencyFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    toaster("All filters reset", "info");
  };

  const filterValues = useMemo(
    () => ({
      search: searchTerm,
      paymentMethod: paymentMethodFilter,
      currency: currencyFilter,
      dateRange: [startDate, endDate].filter(Boolean),
    }),
    [searchTerm, paymentMethodFilter, currencyFilter, startDate, endDate]
  );

  const handleFilterChange = (filterName, value) => {
    if (filterName === "search") {
      setSearchTerm(value || "");
    } else if (filterName === "paymentMethod") {
      setPaymentMethodFilter(value || "all");
    } else if (filterName === "currency") {
      setCurrencyFilter(value || "all");
    } else if (filterName === "dateRange") {
      if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
        setStartDate(value[0]);
        setEndDate(value[1]);
      } else {
        setStartDate("");
        setEndDate("");
      }
    }
  };

  const filterConfig = useMemo(
    () => [
      {
        component: "input",
        name: "search",
        label: "Search",
        placeholder: "Search invoice #, client, company...",
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
      },
      {
        component: "select",
        name: "paymentMethod",
        label: "Payment Method",
        placeholder: "All Payment Methods",
        options: [
          { label: "All Payment Methods", value: "all" },
          ...PAYMENT_METHODS.map((m) => ({
            label: m.label,
            value: m.value,
          })),
        ],
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
      },
      {
        component: "select",
        name: "currency",
        label: "Currency",
        placeholder: "All Currencies",
        options: [
          { label: "All Currencies", value: "all" },
          ...CURRENCIES.map((c) => ({
            label: `${c.code} (${c.symbol})`,
            value: c.code,
          })),
        ],
        className: "col-span-12 sm:col-span-6 lg:col-span-2",
      },
      {
        component: "datePicker",
        name: "dateRange",
        label: "Issue Date Range",
        placeholder: "Select Date Range",
        mode: "range",
        className: "col-span-12 sm:col-span-6 lg:col-span-3",
      },
      {
        component: "clear",
        label: "Clear",
        className: "col-span-12 sm:col-span-6 lg:col-span-1",
      },
    ],
    []
  );

  // Reset pagination to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentMethodFilter, currencyFilter, startDate, endDate, searchTerm]);

  // Format amount helper (Uses Tk for BDT, $ for USD, etc.)
  const formatAmount = (amount, currencyCode = "BDT") => {
    const symbol = CURRENCIES.find((c) => c.code === currencyCode)?.symbol || "Tk";
    const num = Number(amount || 0);
    return `${symbol} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Status badge styling helper
  const getBadgeClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "partial":
        return "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "sent":
      case "pending":
      case "due":
        return "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "overdue":
        return "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "draft":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  // Accurate Metrics calculation
  const metrics = useMemo(() => {
    const totalCount = invoices.length;
    const paidList = invoices.filter((i) => i.status === "paid" || i.dueAmount === 0);
    const partialList = invoices.filter((i) => i.status === "partial" || (i.paidAmount > 0 && i.dueAmount > 0));
    const dueList = invoices.filter((i) => i.status === "due" || (i.paidAmount === 0 && i.dueAmount > 0 && !i.isOverdue));
    const overdueList = invoices.filter((i) => i.status === "overdue" || i.isOverdue);
    const draftList = invoices.filter((i) => i.status === "draft");

    const totalSum = invoices.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
    const paidSum = invoices.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
    const dueSum = invoices.reduce((acc, i) => acc + (Number(i.dueAmount) || 0), 0);
    const overdueSum = overdueList.reduce((acc, i) => acc + (Number(i.dueAmount) || 0), 0);

    return {
      totalCount,
      totalSum,
      paidCount: paidList.length,
      paidSum,
      partialCount: partialList.length,
      dueCount: dueList.length,
      dueSum,
      overdueCount: overdueList.length,
      overdueSum,
      draftCount: draftList.length,
    };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Status Filter
      if (statusFilter === "paid") {
        if (inv.status !== "paid" && inv.dueAmount > 0) return false;
      } else if (statusFilter === "partial") {
        if (inv.status !== "partial" && !(inv.paidAmount > 0 && inv.dueAmount > 0)) return false;
      } else if (statusFilter === "due" || statusFilter === "sent") {
        if (inv.status !== "due" && !(inv.paidAmount === 0 && inv.dueAmount > 0 && !inv.isOverdue)) return false;
      } else if (statusFilter === "overdue") {
        if (inv.status !== "overdue" && !inv.isOverdue) return false;
      } else if (statusFilter === "draft") {
        if (inv.status !== "draft") return false;
      }

      // 2. Payment Method Filter
      if (paymentMethodFilter !== "all") {
        const method = (inv.paymentMethod || "").toLowerCase();
        if (method !== paymentMethodFilter.toLowerCase()) return false;
      }

      // 3. Currency Filter
      if (currencyFilter !== "all") {
        const curr = (inv.currency || "BDT").toUpperCase();
        if (curr !== currencyFilter.toUpperCase()) return false;
      }

      // 4. Issue Date Range (From - To)
      const invIssueDate = inv.issueDate || (inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 10) : "");
      if (startDate && invIssueDate) {
        if (invIssueDate < startDate) return false;
      }
      if (endDate && invIssueDate) {
        if (invIssueDate > endDate) return false;
      }

      // 5. Search Term (Invoice #, Client Name, Email, Company, Phone)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const numberMatch = inv.invoiceNumber?.toLowerCase().includes(query);
        const nameMatch = inv.clientName?.toLowerCase().includes(query);
        const emailMatch = inv.clientEmail?.toLowerCase().includes(query);
        const companyMatch = inv.clientCompany?.toLowerCase().includes(query);
        const phoneMatch = inv.clientPhone?.toLowerCase().includes(query);
        if (!numberMatch && !nameMatch && !emailMatch && !companyMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, statusFilter, paymentMethodFilter, currencyFilter, startDate, endDate, searchTerm]);

  // Paginated Invoices (10 items per page by default)
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  // Ensure currentPage stays within valid bounds if items are deleted or filtered
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredInvoices.length, itemsPerPage, currentPage]);

  // Handle Save / Generate from Modal - Persist directly to Database
  const handleSaveInvoice = async (invoiceData) => {
    setIsManualLoading(true);
    try {
      const isFullPaid = invoiceData.status === "paid" || invoiceData.dueAmount === 0;
      const finalPaidAmount = isFullPaid ? Number(invoiceData.totalAmount || 0) : Number(invoiceData.paidAmount || 0);
      const finalDueAmount = isFullPaid ? 0 : Math.max(0, Number(invoiceData.totalAmount || 0) - finalPaidAmount);

      // Optimistic update for instant UI response
      setInvoices((prev) =>
        prev.map((i) =>
          String(i.id) === String(invoiceData.id) || (invoiceData.invoiceNumber && i.invoiceNumber === invoiceData.invoiceNumber)
            ? normalizeInvoice({
                ...i,
                ...invoiceData,
                status: isFullPaid ? "paid" : (invoiceData.status || i.status),
                paymentStatus: isFullPaid ? "paid" : (invoiceData.paymentStatus || i.paymentStatus),
                paymentMethod: invoiceData.paymentMethod || i.paymentMethod || "cash",
                paidAmount: finalPaidAmount,
                dueAmount: finalDueAmount,
              })
            : i
        )
      );

      const itemsPayload = {
        items: invoiceData.items || [],
        clientName: invoiceData.clientName || "",
        clientEmail: invoiceData.clientEmail || "",
        clientCompany: invoiceData.clientCompany || "",
        clientPhone: invoiceData.clientPhone || "",
        clientAddress: invoiceData.clientAddress || "",
        fromCompany: invoiceData.fromCompany || "",
        fromEmail: invoiceData.fromEmail || "",
        fromPhone: invoiceData.fromPhone || "",
        fromAddress: invoiceData.fromAddress || "",
        paymentMethod: invoiceData.paymentMethod || "cash",
        paidAmount: finalPaidAmount,
        dueAmount: finalDueAmount,
        notes: invoiceData.notes || "",
        paymentTerms: invoiceData.paymentTerms || "",
      };

      const isNumericDbId = invoiceData.id && !String(invoiceData.id).startsWith("draft_") && !isNaN(Number(invoiceData.id));

      const payload = {
        id: isNumericDbId ? Number(invoiceData.id) : undefined,
        invoiceNumber: invoiceData.invoiceNumber,
        currency: invoiceData.currency || "BDT",
        status: isFullPaid ? "paid" : (invoiceData.status || "sent"),
        paymentStatus: isFullPaid ? "paid" : finalPaidAmount > 0 ? "partial" : "unpaid",
        baseAmount: Number(invoiceData.subtotal || invoiceData.baseAmount || 0),
        subtotal: Number(invoiceData.subtotal || 0),
        taxAmount: Number(invoiceData.taxAmount || 0),
        discountAmount: Number(invoiceData.discountAmount || 0),
        totalAmount: Number(invoiceData.totalAmount || 0),
        dueDate: invoiceData.dueDate || undefined,
        userCount: invoiceData.items?.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0) || 1,
        invoiceItems: JSON.stringify(itemsPayload),
      };

      await createOrUpdateInvoice(payload);

      if (typeof window !== "undefined") {
        localStorage.removeItem("oms_active_invoice_draft");
      }

      toaster(
        isFullPaid && invoiceData.paymentStatus === "paid"
          ? "Invoice marked as paid in database!"
          : isNumericDbId
          ? "Invoice updated in database!"
          : "Invoice generated & saved to database!",
        "success"
      );
      await loadInvoices();
    } catch (err) {
      console.error("Save invoice error:", err);
      toaster("Failed to save invoice to database", "error");
      await loadInvoices();
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleSaveDraft = (draftInvoice) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("oms_active_invoice_draft", JSON.stringify(draftInvoice));
      } catch (e) {
        console.warn("Could not save draft to storage:", e);
      }
    }
    const normalizedDraft = normalizeInvoice({
      ...draftInvoice,
      id: draftInvoice.id || "draft_active",
      status: "draft",
      paymentStatus: "unpaid",
    });

    setInvoices((prev) => {
      const filtered = prev.filter((i) => i.id !== "draft_active" && i.id !== draftInvoice.id && i.invoiceNumber !== draftInvoice.invoiceNumber);
      return [normalizedDraft, ...filtered];
    });
  };

  const handleDiscardDraft = (id) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("oms_active_invoice_draft");
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id && i.id !== "draft_active"));
  };

  const handleOpenCreateModal = () => {
    setSelectedInvoice(null);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleOpenPreviewModal = (invoice) => {
    setSelectedInvoice(invoice);
    setModalMode("preview");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = async (invoice) => {
    const invNumber = invoice.invoiceNumber || (invoice.id ? `INV-${invoice.id}` : "this invoice");
    const totalAmount = Number(invoice.totalAmount || invoice.subtotal || 0);

    const result = await Swal.fire({
      title: "Mark Invoice as Paid?",
      text: `Are you sure you want to mark invoice ${invNumber} as fully paid in cash?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Mark as Paid",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "swal-popup rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl dark:bg-[#111827]",
        title: "text-gray-900 dark:text-white font-bold text-xl",
        htmlContainer: "text-gray-600 dark:text-gray-300 text-sm",
        confirmButton: "rounded-xl font-bold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 cursor-pointer",
        cancelButton: "rounded-xl font-semibold px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 transition active:scale-95 cursor-pointer",
        actions: "gap-3 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    const updated = {
      ...invoice,
      status: "paid",
      paymentStatus: "paid",
      paymentMethod: invoice.paymentMethod === "due" ? "cash" : (invoice.paymentMethod || "cash"),
      paidAmount: totalAmount,
      dueAmount: 0,
    };
    await handleSaveInvoice(updated);
  };

  const handleDeleteInvoice = async (invoiceOrId) => {
    const targetInvoice = typeof invoiceOrId === "object" ? invoiceOrId : invoices.find((i) => String(i.id) === String(invoiceOrId));
    const targetId = typeof invoiceOrId === "object" ? invoiceOrId.id : invoiceOrId;
    const invNumber = targetInvoice?.invoiceNumber || (targetId ? `INV-${targetId}` : "this invoice");
    const isDraft = targetInvoice?.status === "draft" || String(targetId).startsWith("draft_") || Number(targetId) > 100000000000;

    const result = await Swal.fire({
      title: "Delete Invoice?",
      text: `Are you sure you want to delete invoice ${invNumber}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete Invoice",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "swal-popup rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl dark:bg-[#111827]",
        title: "text-gray-900 dark:text-white font-bold text-xl",
        htmlContainer: "text-gray-600 dark:text-gray-300 text-sm",
        confirmButton: "rounded-xl font-bold px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-sm transition active:scale-95 cursor-pointer",
        cancelButton: "rounded-xl font-semibold px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 transition active:scale-95 cursor-pointer",
        actions: "gap-3 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      setIsManualLoading(true);

      if (isDraft) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("oms_active_invoice_draft");
        }
        setInvoices((prev) => prev.filter((i) => String(i.id) !== String(targetId)));
        toaster("Draft invoice discarded", "success");
        await loadInvoices();
        return;
      }

      await deleteInvoiceApi(targetId);
      toaster("Invoice deleted successfully from database", "success");
      await loadInvoices();
    } catch (err) {
      console.warn("Delete invoice API warning:", err);
      if (err?.response?.status === 404 || err?.status === 404 || String(err?.message).includes("404")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("oms_active_invoice_draft");
        }
        setInvoices((prev) => prev.filter((i) => String(i.id) !== String(targetId)));
        toaster("Invoice removed", "success");
        await loadInvoices();
      } else {
        toaster(err?.response?.data?.message || "Failed to delete invoice from database", "error");
      }
    } finally {
      setIsManualLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-80px)] py-6 space-y-6 ${isModalOpen ? "print:p-0 print:m-0 print:min-h-0 print:space-y-0" : ""}`}>
      {/* Background Dashboard Content (Hidden in Print when Invoice Modal is open) */}
      <div className={`space-y-6 ${isModalOpen ? "print:hidden" : ""}`}>
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/accounts" className="hover:text-blue-600 transition">
              Accounts
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Invoices
            </span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-blue-600" />
            Invoices & Billing
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage customer billing, cash collection receipts, and outstanding dues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadInvoices}
            title="Refresh Invoices"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isFetching ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition shadow-sm active:scale-95 ${
              showFilter || hasActiveFilters
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Invoices */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Invoices
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {metrics.totalCount}
            </h3>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Total: {formatAmount(metrics.totalSum)}
            </span>
          </div>
        </div>

        {/* Card 2: Paid / Collected */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Collected & Settled
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.paidCount}
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Paid: {formatAmount(metrics.paidSum)}
            </span>
          </div>
        </div>

        {/* Card 3: Outstanding Due */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Outstanding Due
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {metrics.dueCount}
            </h3>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Due: {formatAmount(metrics.dueSum)}
            </span>
          </div>
        </div>

        {/* Card 4: Overdue Invoices */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Overdue Accounts
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {metrics.overdueCount}
            </h3>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {formatAmount(metrics.overdueSum)}
            </span>
          </div>
        </div>
      </div>

      {/* DataFilter Component */}
      <DataFilter
        showFilter={showFilter}
        filters={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {[
          { key: "all", label: "All Invoices", count: invoices.length },
          { key: "paid", label: "Paid", count: metrics.paidCount },
          { key: "partial", label: "Partial Paid", count: metrics.partialCount },
          { key: "due", label: "Due / Pending", count: metrics.dueCount },
          { key: "draft", label: "Drafts", count: metrics.draftCount },
          { key: "overdue", label: "Overdue", count: metrics.overdueCount },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              statusFilter === tab.key
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm"
            }`}
          >
            {tab.label} <span className="opacity-75 text-[10px] font-mono">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Corporate Invoices Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading invoice records...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No Invoices Found
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? `No invoices matched "${searchTerm}". Try a different keyword or filter.`
                  : "No invoice records available in this view."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Generate First Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Billed To / Client</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount (Paid / Due)</th>
                  <th className="py-3.5 px-4 text-center">Status / Method</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-gray-800/40 transition group cursor-pointer"
                    onClick={() => handleOpenPreviewModal(inv)}
                  >
                    {/* Invoice # */}
                    <td className="py-4 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 opacity-60" />
                        {inv.invoiceNumber}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {inv.clientName || "Corporate Client"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {inv.clientCompany ? `${inv.clientCompany} • ` : ""}
                        {inv.clientEmail}
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {inv.issueDate || "—"}
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {inv.dueDate || "—"}
                    </td>

                    {/* Amount (Total, Paid & Due breakdown) */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-black text-gray-900 dark:text-white">
                        {formatAmount(inv.totalAmount, inv.currency)}
                      </div>
                      {inv.status === "paid" || inv.dueAmount === 0 ? (
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <Check className="w-3 h-3" /> Paid: {formatAmount(inv.paidAmount || inv.totalAmount, inv.currency)}
                        </div>
                      ) : inv.paidAmount > 0 ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Paid: {formatAmount(inv.paidAmount, inv.currency)}
                          </div>
                          <div className="text-rose-600 dark:text-rose-400 font-semibold">
                            Due: {formatAmount(inv.dueAmount, inv.currency)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          Due: {formatAmount(inv.dueAmount || inv.totalAmount, inv.currency)}
                        </div>
                      )}
                    </td>

                    {/* Status Badge & Method */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getBadgeClasses(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                      {inv.paymentMethod && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                          {inv.paymentMethod === "cash"
                            ? "Cash"
                            : inv.paymentMethod === "due"
                            ? "On Credit"
                            : inv.paymentMethod === "bank_transfer"
                            ? "Bank"
                            : inv.paymentMethod}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview button */}
                        <button
                          type="button"
                          onClick={() => handleOpenPreviewModal(inv)}
                          title="Preview Invoice"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(inv)}
                          title="Edit Invoice"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Mark Paid button */}
                        {!inv.isPaid && inv.status !== "paid" && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsPaid(inv)}
                            title="Mark as Paid in Cash"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
                          >
                            <Banknote className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv)}
                          title="Delete Invoice"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Project UI Pagination (10 per page default) */}
      {filteredInvoices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredInvoices.length}
          resultRows={paginatedInvoices.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          size="sm"
          variant="primary"
          showItemsPerPage={true}
          showResultInfo={true}
        />
      )}
      </div>

      {/* Invoice Modal (Handles both Edit and Preview) */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedInvoice}
        initialMode={modalMode}
        onSave={handleSaveInvoice}
        onSaveDraft={handleSaveDraft}
        onDiscard={handleDiscardDraft}
        companyProfile={companyProfile}
      />
    </div>
  );
}
