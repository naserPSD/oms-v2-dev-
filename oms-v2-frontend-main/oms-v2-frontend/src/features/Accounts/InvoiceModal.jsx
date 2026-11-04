"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Trash2,
  Printer,
  Eye,
  Edit3,
  FileText,
  Building,
  User,
  Check,
  CreditCard,
  Banknote,
  Clock,
  RefreshCw,
} from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { fetchCompanyInfo } from "@/services/companySettingsApi";
import { fetchLeads, addOrUpdateLead } from "@/services/leadManagementApi";
import { toaster, resolveImageUrl } from "@/utils/helpers";
import Swal from "sweetalert2";

export const CURRENCIES = [
  { code: "BDT", symbol: "Tk", label: "BDT (Tk)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700" },
  { value: "sent", label: "Pending / Due", color: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { value: "paid", label: "Paid", color: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { value: "overdue", label: "Overdue", color: "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
];

export const PAYMENT_METHODS = [
  {
    value: "cash",
    label: "Cash Payment",
    icon: Banknote,
    defaultDetails: "Payment received in cash in full.",
  },
  {
    value: "due",
    label: "Due / On Credit (Pay Later)",
    icon: Clock,
    defaultDetails: "Net 15 Days (Payable on or before Due Date)",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: Building,
    defaultDetails: "Bank Name: City Bank Ltd.\nAccount Name: Revinr IT Solutions Ltd\nAccount Number: 1234-5678-9012\nRouting Number: 225273390\nBranch: Uttara Corporate Branch, Dhaka",
  },
  {
    value: "mobile_banking",
    label: "Mobile Banking (bKash / Nagad)",
    icon: CreditCard,
    defaultDetails: "bKash / Nagad Merchant Number: +880 1715 864162\nPayment Type: Make Payment\nCounter: 1 | Reference: Use Invoice Number",
  },
  {
    value: "card",
    label: "Credit / Debit Card",
    icon: CreditCard,
    defaultDetails: "Card Gateway: Online Payment / POS Terminal Settlement.",
  },
];

export const getCompanyInitials = (name) => {
  if (!name) return "OMS";
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}/${parts[1][0]}`.toUpperCase();
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// Module-level in-memory cache for CRM leads to avoid repeated queries
let cachedLeads = null;

export const isLeadActive = (l) => {
  if (!l) return false;
  if (l.isActive === false) return false;
  const statusStr = String(l.leadStatus || l.status || "").trim().toLowerCase();
  if (statusStr) {
    return statusStr === "active";
  }
  return l.isActive !== false;
};

export default function InvoiceModal({
  isOpen,
  onClose,
  initialData = null,
  initialMode = "edit", // "edit" | "preview"
  onSave,
  onSaveDraft,
  onDiscard,
  companyProfile = null,
}) {
  const [activeTab, setActiveTab] = useState(initialMode);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const [itemErrors, setItemErrors] = useState({});

  // CRM Leads & Company Settings state
  const [companyInfo, setCompanyInfo] = useState(companyProfile || null);
  const [leads, setLeads] = useState(cachedLeads || []);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [showQuickAddLead, setShowQuickAddLead] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    invoiceNumber: "",
    currency: "BDT",
    status: "draft",
    paymentStatus: "unpaid",
    paymentMethod: "cash",
    paidAmount: 0,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),

    // Billed From (Populated from /company-settings)
    fromCompany: companyProfile?.name || "",
    fromEmail: companyProfile?.email || "",
    fromPhone: companyProfile?.phone || "",
    fromAddress: companyProfile?.address || "",

    // Billed To
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    clientAddress: "",

    // Line items based on OMS modules
    items: [
      {
        id: "item-1",
        title: "OMS Enterprise Core License",
        description: "Monthly enterprise subscription with multi-department support",
        quantity: 1,
        unitPrice: 15000,
      },
      {
        id: "item-2",
        title: "HR & Meeting Automation Add-on",
        description: "Automated attendance tracking and live meeting collaboration",
        quantity: 1,
        unitPrice: 5000,
      },
    ],

    taxRate: 0,
    discountType: "%",
    discountValue: 0,
    discountAmount: 0,
    notes: "Thank you for choosing our services! Payments should be processed within 15 days of invoice date.",
    paymentTerms: "Payment received in cash in full.",
  });

  // Keep companyInfo in sync if prop changes
  useEffect(() => {
    if (companyProfile) {
      setCompanyInfo(companyProfile);
      setFormData((prev) => {
        const isNewInvoice = !initialData?.id;
        const isDummyName = !prev.fromCompany || prev.fromCompany.includes("Revinr IT Solutions Ltd");
        const isDummyEmail = !prev.fromEmail || prev.fromEmail === "billing@revinr.com";
        const isDummyPhone = !prev.fromPhone || prev.fromPhone === "+880 1715 864162";
        const isDummyAddress = !prev.fromAddress || prev.fromAddress.includes("House 37, Road 3, Sector 9");

        return {
          ...prev,
          fromCompany: (isNewInvoice || isDummyName || !prev.fromCompany) ? (companyProfile.name || prev.fromCompany || "") : prev.fromCompany,
          fromEmail: (isNewInvoice || isDummyEmail || !prev.fromEmail) ? (companyProfile.email || prev.fromEmail || "") : prev.fromEmail,
          fromPhone: (isNewInvoice || isDummyPhone || !prev.fromPhone) ? (companyProfile.phone || prev.fromPhone || "") : prev.fromPhone,
          fromAddress: (isNewInvoice || isDummyAddress || !prev.fromAddress) ? (companyProfile.address || prev.fromAddress || "") : prev.fromAddress,
        };
      });
    }
  }, [companyProfile, initialData]);

  // Sync initialData when modal opens
  useEffect(() => {
    setItemErrors({});
    if (!isOpen) return;

    setActiveTab(initialMode || "edit");

    const activeComp = companyProfile || companyInfo;

    if (initialData) {
      let parsedItems = [];
      if (typeof initialData.invoiceItems === "string") {
        try {
          parsedItems = JSON.parse(initialData.invoiceItems);
        } catch {
          parsedItems = [];
        }
      } else if (Array.isArray(initialData.invoiceItems)) {
        parsedItems = initialData.invoiceItems;
      } else if (Array.isArray(initialData.items)) {
        parsedItems = initialData.items;
      }

      if (!parsedItems || parsedItems.length === 0) {
        parsedItems = [
          {
            id: "item-1",
            title: initialData.planName || "OMS Enterprise Subscription",
            description: "Full suite operations management license",
            quantity: initialData.userCount || 1,
            unitPrice: Number(initialData.baseAmount || initialData.subtotal || 0),
          },
        ];
      }

      const clientName = initialData.clientName || (initialData.user?.firstName ? `${initialData.user?.firstName || ""} ${initialData.user?.lastName || ""}`.trim() : "");
      const isPaid = initialData.status === "paid" || initialData.paymentStatus === "paid";
      const totalAmt = Number(initialData.totalAmount || initialData.subtotal || 0);
      const paidAmt = isPaid ? totalAmt : Number(initialData.paidAmount || 0);

      // Clean out any legacy placeholder values
      const initialFromCompany = (initialData.fromCompany && !initialData.fromCompany.includes("Revinr IT Solutions Ltd"))
        ? initialData.fromCompany
        : (activeComp?.name || "");
      const initialFromEmail = (initialData.fromEmail && initialData.fromEmail !== "billing@revinr.com")
        ? initialData.fromEmail
        : (activeComp?.email || "");
      const initialFromPhone = (initialData.fromPhone && initialData.fromPhone !== "+880 1715 864162")
        ? initialData.fromPhone
        : (activeComp?.phone || "");
      const initialFromAddress = (initialData.fromAddress && !initialData.fromAddress.includes("House 37, Road 3, Sector 9"))
        ? initialData.fromAddress
        : (activeComp?.address || "");

      const savedDiscountAmount = Number(initialData.discountAmount || initialData.discount_amount || 0);
      let resolvedDiscountType = initialData.discountType || "%";
      let resolvedDiscountValue = 0;

      if (initialData.discountType) {
        resolvedDiscountType = initialData.discountType === "%" ? "%" : "amount";
        resolvedDiscountValue = Number(initialData.discountValue ?? initialData.discountAmount ?? 0);
      } else if (savedDiscountAmount > 0) {
        resolvedDiscountType = "amount";
        resolvedDiscountValue = savedDiscountAmount;
      } else {
        resolvedDiscountType = "%";
        resolvedDiscountValue = 0;
      }

      setFormData({
        id: initialData.id || null,
        invoiceNumber: initialData.invoiceNumber || initialData.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        currency: initialData.currency || "BDT",
        status: initialData.status || (isPaid ? "paid" : "sent"),
        paymentStatus: initialData.paymentStatus || (isPaid ? "paid" : "unpaid"),
        paymentMethod: initialData.paymentMethod || (isPaid ? "cash" : "due"),
        paidAmount: paidAmt,
        issueDate: initialData.createdAt
          ? new Date(initialData.createdAt).toISOString().slice(0, 10)
          : initialData.issueDate || new Date().toISOString().slice(0, 10),
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().slice(0, 10)
          : new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),

        fromCompany: initialFromCompany,
        fromEmail: initialFromEmail,
        fromPhone: initialFromPhone,
        fromAddress: initialFromAddress,

        clientName: clientName || "Corporate Client",
        clientEmail: initialData.clientEmail || initialData.user?.email || "client@company.com",
        clientPhone: initialData.clientPhone || initialData.user?.phone || "+880 1700 000000",
        clientCompany: initialData.clientCompany || "",
        clientAddress: initialData.clientAddress || "Dhaka, Bangladesh",

        items: parsedItems.map((it, idx) => ({
          id: it.id || `item-${idx + 1}`,
          title: it.title || it.name || "",
          description: it.description || "",
          quantity: Number(it.quantity || 1),
          unitPrice: Number(it.unitPrice ?? it.unit_price ?? 0),
        })),

        taxRate: Number(initialData.taxRate || (initialData.taxAmount && initialData.subtotal ? Math.round((initialData.taxAmount / initialData.subtotal) * 100) : 0)),
        discountType: resolvedDiscountType,
        discountValue: resolvedDiscountValue,
        discountAmount: savedDiscountAmount,
        notes: initialData.notes || "Thank you for choosing our services! Payments should be processed within 15 days of invoice date.",
        paymentTerms: initialData.paymentTerms || (initialData.paymentMethod === "due"
          ? "Net 15 Days (Payable on or before Due Date)"
          : "Payment received in cash in full."),
      });
      setHasDraftRestored(false);
    } else {
      let restoredDraft = null;
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("oms_active_invoice_draft");
          if (stored) {
            restoredDraft = JSON.parse(stored);
          }
        } catch (e) {
          console.warn("Could not read invoice draft:", e);
        }
      }

      if (restoredDraft && typeof restoredDraft === "object" && (restoredDraft.clientName || restoredDraft.items?.length > 0)) {
        setFormData(restoredDraft);
        setHasDraftRestored(true);
      } else {
        setHasDraftRestored(false);
        const randomId = Math.floor(1000 + Math.random() * 9000);
        setFormData({
          id: null,
          invoiceNumber: `INV-${new Date().getFullYear()}-${randomId}`,
          currency: "BDT",
          status: "draft",
          paymentStatus: "unpaid",
          paymentMethod: "cash",
          paidAmount: 0,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),

          fromCompany: activeComp?.name || "",
          fromEmail: activeComp?.email || "",
          fromPhone: activeComp?.phone || "",
          fromAddress: activeComp?.address || "",

          clientName: "",
          clientEmail: "",
          clientPhone: "",
          clientCompany: "",
          clientAddress: "",

          items: [
            {
              id: "item-1",
              title: "OMS Enterprise Core License",
              description: "Monthly enterprise subscription with multi-department support",
              quantity: 1,
              unitPrice: 15000,
            },
            {
              id: "item-2",
              title: "HR & Meeting Automation Add-on",
              description: "Automated attendance tracking and live meeting collaboration",
              quantity: 1,
              unitPrice: 5000,
            },
          ],

          taxRate: 0,
          discountType: "%",
          discountValue: 0,
          discountAmount: 0,
          notes: "Thank you for choosing our services! Payments should be processed within 15 days of invoice date.",
          paymentTerms: "Payment received in cash in full.",
        });
      }
    }
  }, [isOpen, initialData, initialMode, companyProfile]);

  // Helper to load CRM leads safely (reusing cache, lazy-load in background)
  const loadLeadsData = useCallback(async (isMounted = true) => {
    // If cached in memory, restore strictly active leads instantly
    if (cachedLeads && cachedLeads.length > 0) {
      const activeCached = cachedLeads.filter(isLeadActive);
      if (isMounted) {
        setLeads(activeCached);
        if (initialData?.clientName || initialData?.clientCompany) {
          const match = activeCached.find(
            (l) =>
              (l.name && (l.name === initialData.clientCompany || l.name === initialData.clientName)) ||
              (l.contactName && l.contactName === initialData.clientName)
          );
          if (match) setSelectedLeadId(match.id);
        }
      }
      return;
    }

    setIsLoadingLeads(true);
    try {
      // Query with limit 100 and leadStatus Active
      const res = await fetchLeads({ limit: 100, page: 1, leadStatus: "Active" });
      const raw = res?.data?.data || res?.data || res;
      const list = Array.isArray(raw)
        ? raw
        : (Array.isArray(raw?.list)
          ? raw.list
          : (Array.isArray(raw?.leads)
            ? raw.leads
            : (Array.isArray(res?.list)
              ? res.list
              : (Array.isArray(res?.data) ? res.data : []))));

      const normalizedList = list.map((l) => {
        let cleanId = "";
        if (typeof l.id === "string" && l.id && l.id !== "[object Object]") {
          cleanId = l.id;
        } else if (typeof l._id === "string" && l._id && l._id !== "[object Object]") {
          cleanId = l._id;
        } else if (l.id) {
          cleanId = String(l.id);
        } else if (l._id) {
          cleanId = String(l._id);
        }
        return {
          ...l,
          id: cleanId,
          _id: cleanId,
        };
      });

      // Strict filter: only leads that are Active (leadStatus === 'Active' && isActive !== false)
      const onlyActiveLeads = normalizedList.filter(isLeadActive);

      cachedLeads = onlyActiveLeads;

      if (isMounted) {
        setLeads(onlyActiveLeads);
        // If invoice has clientName or clientCompany, find match
        if (initialData?.clientName || initialData?.clientCompany) {
          const match = onlyActiveLeads.find(
            (l) =>
              (l.name && (l.name === initialData.clientCompany || l.name === initialData.clientName)) ||
              (l.contactName && l.contactName === initialData.clientName)
          );
          if (match) {
            setSelectedLeadId(match.id);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch leads for invoice:", err);
    } finally {
      if (isMounted) setIsLoadingLeads(false);
    }
  }, [initialData]);

  // Load company settings profile & CRM leads (only when needed)
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadCompany = async () => {
      // Re-use companyProfile passed from parent if available (0ms)
      if (companyProfile && (companyProfile.name || companyProfile.address)) {
        setCompanyInfo(companyProfile);
        return;
      }

      try {
        const res = await fetchCompanyInfo();
        const raw = res?.data?.data || res?.data || res;
        let comp = null;
        if (raw && typeof raw === "object") {
          if ("data" in raw && raw.data && typeof raw.data === "object" && ("name" in raw.data || "address" in raw.data)) {
            comp = raw.data;
          } else {
            comp = raw;
          }
        }

        if (comp && isMounted) {
          setCompanyInfo(comp);
          setFormData((prev) => {
            const isNewInvoice = !initialData?.id;
            return {
              ...prev,
              fromCompany: (isNewInvoice || !prev.fromCompany) ? (comp.name || prev.fromCompany || "") : prev.fromCompany,
              fromEmail: (isNewInvoice || !prev.fromEmail) ? (comp.email || prev.fromEmail || "") : prev.fromEmail,
              fromPhone: (isNewInvoice || !prev.fromPhone) ? (comp.phone || prev.fromPhone || "") : prev.fromPhone,
              fromAddress: (isNewInvoice || !prev.fromAddress) ? (comp.address || prev.fromAddress || "") : prev.fromAddress,
            };
          });
        }
      } catch (err) {
        console.warn("Could not fetch company info for invoice:", err);
      }
    };

    loadCompany();

    // If modal was opened in edit mode, fetch leads; if in preview mode, skip CRM fetch entirely!
    if (initialMode !== "preview") {
      loadLeadsData(isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialData, initialMode, companyProfile, loadLeadsData]);

  if (!isOpen) return null;

  // Currency helper
  const currencyObj = CURRENCIES.find((c) => c.code === formData.currency) || CURRENCIES[0];

  const formatPrice = (amount) => {
    const num = Number(amount || 0);
    return `${currencyObj.symbol} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  const taxAmount = (subtotal * (Number(formData.taxRate) || 0)) / 100;

  const discountType = formData.discountType || "%";
  const discountVal = Number(formData.discountValue ?? 0);
  const rawDiscount = discountType === "%"
    ? (subtotal * discountVal) / 100
    : discountVal;
  // Ensure discount cannot be negative and cannot exceed subtotal
  const discountAmount = Math.max(0, Math.min(subtotal, rawDiscount));

  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  // Effective Paid and Due calculations
  const effectivePaidAmount = formData.status === "paid"
    ? grandTotal
    : Math.min(grandTotal, Math.max(0, Number(formData.paidAmount) || 0));
  const dueAmount = Math.max(0, grandTotal - effectivePaidAmount);

  // Handlers
  const handleTextChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDiscountTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      discountType: newType,
      discountValue: newType === "%" ? Math.min(100, Number(prev.discountValue || 0)) : Number(prev.discountValue || 0),
    }));
  };

  // Sync latest details from Company Settings
  const handleSyncFromCompanySettings = async () => {
    try {
      const res = await fetchCompanyInfo();
      const raw = res?.data?.data || res?.data || res;
      const comp = (raw && typeof raw === "object" && "data" in raw && raw.data) ? raw.data : raw;
      const finalComp = comp || companyProfile || companyInfo;
      if (finalComp) {
        setCompanyInfo(finalComp);
        setFormData((prev) => ({
          ...prev,
          fromCompany: finalComp.name || "",
          fromEmail: finalComp.email || "",
          fromPhone: finalComp.phone || "",
          fromAddress: finalComp.address || "",
        }));
        toaster("Synced latest information from Company Settings", "success");
      } else {
        toaster("No company info found in settings", "info");
      }
    } catch {
      const finalComp = companyProfile || companyInfo;
      if (finalComp) {
        setFormData((prev) => ({
          ...prev,
          fromCompany: finalComp.name || "",
          fromEmail: finalComp.email || "",
          fromPhone: finalComp.phone || "",
          fromAddress: finalComp.address || "",
        }));
        toaster("Synced from Company Settings", "success");
      } else {
        toaster("Could not reach Company Settings", "error");
      }
    }
  };

  // When a CRM Lead is chosen from the dropdown, auto-populate all To fields
  const handleSelectLead = (leadId) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;
    const lead = leads.find((l) => {
      const lid = String(l.id || l._id || "");
      return lid === String(leadId) || l.name === leadId || (l.contactName && l.contactName === leadId);
    });
    if (lead) {
      const clientName = (lead.contactName || lead.name || "").trim();
      const clientCompany = (lead.name || "").trim();
      const clientEmail = (lead.contactEmail || lead.email || "").trim();
      const clientPhone = (lead.contactPhone || lead.phone || "").trim();
      const addressParts = [lead.address, lead.city, lead.country].filter(Boolean);
      const clientAddress = addressParts.length > 0 ? addressParts.join(", ") : (lead.address || "");

      setFormData((prev) => ({
        ...prev,
        clientName: clientName || prev.clientName || "",
        clientCompany: clientCompany || prev.clientCompany || "",
        clientEmail: clientEmail || prev.clientEmail || "",
        clientPhone: clientPhone || prev.clientPhone || "",
        clientAddress: clientAddress || prev.clientAddress || "",
      }));
      toaster(`Selected lead: ${clientCompany || clientName}`, "success");
    }
  };

  // When a new CRM Lead is created via Quick Add Lead modal
  const handleLeadCreated = (newLead) => {
    if (!newLead) return;
    const leadId = newLead._id || newLead.id || String(Date.now());
    const enriched = { ...newLead, _id: leadId, id: leadId, leadStatus: "Active", isActive: true };
    if (isLeadActive(enriched)) {
      setLeads((prev) => [enriched, ...prev.filter((l) => l.id !== leadId)]);
      cachedLeads = [enriched, ...(cachedLeads || []).filter((l) => l.id !== leadId)];
    }
    setSelectedLeadId(leadId);

    const clientName = (enriched.contactName || enriched.name || "").trim();
    const clientCompany = (enriched.name || "").trim();
    const clientEmail = (enriched.contactEmail || enriched.email || "").trim();
    const clientPhone = (enriched.contactPhone || enriched.phone || "").trim();
    const addressParts = [enriched.address, enriched.city, enriched.country].filter(Boolean);
    const clientAddress = addressParts.length > 0 ? addressParts.join(", ") : (enriched.address || "");

    setFormData((prev) => ({
      ...prev,
      clientName: clientName || prev.clientName,
      clientCompany: clientCompany || prev.clientCompany,
      clientEmail: clientEmail || prev.clientEmail,
      clientPhone: clientPhone || prev.clientPhone,
      clientAddress: clientAddress || prev.clientAddress,
    }));
  };

  const handlePaymentMethodChange = (newMethod) => {
    const methodConfig = PAYMENT_METHODS.find((m) => m.value === newMethod);
    const newDetails = methodConfig?.defaultDetails || "";

    setFormData((prev) => {
      let newStatus = prev.status;
      let newPaid = prev.paidAmount;

      if (newMethod === "due") {
        newStatus = "sent";
        newPaid = 0;
      } else if (newMethod === "cash" && prev.status === "paid") {
        newPaid = grandTotal;
      }

      return {
        ...prev,
        paymentMethod: newMethod,
        paymentTerms: newDetails,
        status: newStatus,
        paidAmount: newPaid,
      };
    });
  };

  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
      paymentStatus: newStatus === "paid" ? "paid" : "unpaid",
      paidAmount: newStatus === "paid" ? grandTotal : 0,
      paymentMethod: newStatus === "paid" && prev.paymentMethod === "due" ? "cash" : prev.paymentMethod,
    }));
  };

  const handleItemChange = (index, field, value) => {
    if (field === "title" && itemErrors[index] && String(value).trim()) {
      setItemErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
    setFormData((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, items: nextItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          title: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setItemErrors((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        const i = Number(k);
        if (i < index) next[i] = prev[i];
        else if (i > index) next[i - 1] = prev[i];
      });
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (targetStatus = null) => {
    // 1. Line items validation: at least 1 item
    if (!formData.items || formData.items.length === 0) {
      toaster("Please add at least one line item to the invoice.", "error");
      setActiveTab("edit");
      return;
    }

    // 2. Validate Item Name (required) for each item
    const errors = {};
    let firstErrorIndex = -1;
    formData.items.forEach((it, idx) => {
      if (!it.title || !it.title.trim()) {
        errors[idx] = "Item Name is required";
        if (firstErrorIndex === -1) firstErrorIndex = idx;
      }
    });

    if (firstErrorIndex !== -1) {
      setItemErrors(errors);
      toaster(`Item Name is required for Item #${firstErrorIndex + 1}`, "error");
      setActiveTab("edit");
      setTimeout(() => {
        const el = document.getElementById(`item-title-${firstErrorIndex}`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    setIsSaving(true);
    try {
      const finalStatus = targetStatus || formData.status;
      const isFullPaid = finalStatus === "paid" || dueAmount === 0;

      const invoicePayload = {
        ...formData,
        status: isFullPaid ? "paid" : finalStatus,
        paymentStatus: isFullPaid ? "paid" : (dueAmount === grandTotal ? "unpaid" : "partial"),
        paidAmount: isFullPaid ? grandTotal : effectivePaidAmount,
        dueAmount: isFullPaid ? 0 : dueAmount,
        subtotal,
        taxAmount,
        discountAmount: Number(discountAmount.toFixed(2)),
        discountType: formData.discountType === "%" ? "%" : "amount",
        discountValue: Number(formData.discountValue || 0),
        totalAmount: grandTotal,
        baseAmount: subtotal,
        userCount: formData.items.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0),
        invoiceItems: JSON.stringify(formData.items),
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("oms_active_invoice_draft");
        } catch (e) {
          // ignore
        }
      }

      if (onSave) {
        await onSave(invoicePayload);
      }
      onClose();
    } catch (err) {
      console.error("Save invoice error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (activeTab !== "preview") {
      setActiveTab("preview");
      setTimeout(() => {
        window.print();
      }, 150);
      return;
    }
    window.print();
  };

  const handleDiscardDraftAndReset = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("oms_active_invoice_draft");
      } catch (e) {
        // ignore
      }
    }
    setHasDraftRestored(false);
    const activeComp = companyProfile || companyInfo;
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      id: null,
      invoiceNumber: `INV-${new Date().getFullYear()}-${randomId}`,
      currency: "BDT",
      status: "draft",
      paymentStatus: "unpaid",
      paymentMethod: "cash",
      paidAmount: 0,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      fromCompany: activeComp?.name || "",
      fromEmail: activeComp?.email || "",
      fromPhone: activeComp?.phone || "",
      fromAddress: activeComp?.address || "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientCompany: "",
      clientAddress: "",
      items: [
        {
          id: "item-1",
          title: "OMS Enterprise Core License",
          description: "Monthly enterprise subscription with multi-department support",
          quantity: 1,
          unitPrice: 15000,
        },
        {
          id: "item-2",
          title: "HR & Meeting Automation Add-on",
          description: "Automated attendance tracking and live meeting collaboration",
          quantity: 1,
          unitPrice: 5000,
        },
      ],
      taxRate: 0,
      discountType: "%",
      discountValue: 0,
      discountAmount: 0,
      notes: "Thank you for choosing our services! Payments should be processed within 15 days of invoice date.",
      paymentTerms: "Payment received in cash in full.",
    });
    toaster("Draft cleared, started fresh invoice", "info");
  };

  const handleCloseWithDraft = () => {
    if (activeTab === "edit") {
      const hasUserData = Boolean(
        formData.clientName?.trim() ||
        formData.clientEmail?.trim() ||
        (formData.items && formData.items.length > 0 && formData.items.some((i) => i.title || i.unitPrice > 0))
      );

      if (hasUserData && (!initialData || initialData.status === "draft")) {
        const draftObj = {
          ...formData,
          id: formData.id || `draft_${Date.now()}`,
          status: "draft",
          paymentStatus: "unpaid",
          paidAmount: Number(formData.paidAmount || 0),
          dueAmount: Math.max(0, grandTotal - Number(formData.paidAmount || 0)),
          totalAmount: grandTotal,
          subtotal,
          taxAmount,
          discountAmount: Number(discountAmount.toFixed(2)),
          discountType: formData.discountType === "%" ? "%" : "amount",
          discountValue: Number(formData.discountValue || 0),
          isDraft: true,
          updatedAt: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("oms_active_invoice_draft", JSON.stringify(draftObj));
          } catch (e) {
            console.warn("Could not save draft:", e);
          }
        }

        if (onSaveDraft) {
          onSaveDraft(draftObj);
        }
        toaster("Invoice draft saved to table & storage", "info");
      }
    }
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseWithDraft();
    }
  };

  const handleCancelClick = () => {
    Swal.fire({
      title: "Are you sure you want to cancel generating this invoice?",
      text: "If you cancel, this invoice will be discarded and will no longer exist.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel Invoice",
      cancelButtonText: "No, Keep Editing",
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
    }).then((result) => {
      if (result.isConfirmed) {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("oms_active_invoice_draft");
          } catch (e) {
            console.warn("Could not clear active draft:", e);
          }
        }
        if (onDiscard) {
          onDiscard(formData.id);
        }
        toaster("Invoice generation cancelled", "info");
        onClose();
      }
    });
  };

  const activeMethodObj = PAYMENT_METHODS.find((m) => m.value === formData.paymentMethod) || PAYMENT_METHODS[0];

  return (
    <div
      id="invoice-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 print:static print:inset-auto print:z-auto print:overflow-visible print:bg-white print:p-0 print:m-0 print:block print:w-full"
      onClick={handleBackdropClick}
    >
      {/* Scoped Embedded Print Styles for Precise Invoice Alignment & Clean Output */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            color: #111827 !important;
            overflow: visible !important;
            height: auto !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          *, *::before, *::after {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            box-shadow: none !important;
          }
          *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .tsqd-parent-container,
          [data-tanstack-query-devtools],
          div[class*="tsqd"],
          button[class*="tsqd"],
          #react-query-devtools,
          div[style*="z-index: 99999"],
          div[style*="z-index: 9999"],
          div[style*="z-index: 2147483647"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          aside, header, nav, .no-print {
            display: none !important;
          }
          div[style*="paddingLeft"] {
            padding-left: 0 !important;
          }
          #invoice-modal-overlay {
            position: static !important;
            inset: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            display: block !important;
          }
          #invoice-modal-dialog {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            max-height: none !important;
            background: #ffffff !important;
          }
          .invoice-header-row {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding-bottom: 1.5rem !important;
          }
          .invoice-billed-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
            width: 100% !important;
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          .invoice-billed-right {
            text-align: right !important;
          }
          .invoice-billed-right div {
            justify-content: flex-end !important;
          }
          .invoice-summary-box {
            width: 18rem !important;
            margin-left: auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .invoice-footer-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
            width: 100% !important;
            margin-top: 2rem !important;
            padding-top: 1.5rem !important;
            align-items: flex-start !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .invoice-footer-right {
            text-align: right !important;
            align-self: flex-end !important;
          }
          .invoice-footer-right p {
            margin-left: auto !important;
            text-align: right !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
      <div
        id="invoice-modal-dialog"
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 my-4 sm:my-8 overflow-hidden flex flex-col max-h-[92vh] print:static print:w-full print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none print:overflow-visible print:max-h-none print:bg-white dark:print:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Invoice #{formData.invoiceNumber}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeTab === "edit" ? "Edit invoice fields, payment method, and itemized billing" : "Standard invoice preview"}
              </p>
            </div>
          </div>

          {/* Top Right: ONLY the Switch Tab (Edit | Preview) & Close Button */}
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-200/80 dark:bg-gray-800 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("edit");
                  if (leads.length === 0) {
                    loadLeadsData(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "edit"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleCloseWithDraft}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable on screen, fully visible on print */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 print:overflow-visible print:p-0 print:m-0 print:w-full print:space-y-0">
          {activeTab === "edit" ? (
            /* ================= EDIT MODE ================= */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              {hasDraftRestored && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Restored draft in-progress from your previous session.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDiscardDraftAndReset}
                    className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline whitespace-nowrap shrink-0 ml-3"
                  >
                    Discard & Start Fresh
                  </button>
                </div>
              )}

              {/* Row 1: Invoice Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <span>Invoice #</span>
                      <span className="text-red-500 font-bold leading-none select-none">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => handleTextChange("invoiceNumber", e.target.value)}
                    placeholder="INV-2026-0001"
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleTextChange("currency", e.target.value)}
                    className="w-full text-xs font-medium px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="w-full text-xs font-medium px-2 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.value} value={pm.value}>
                        {pm.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full text-xs font-medium px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <DatePicker
                  label={
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 inline-flex items-center gap-1 whitespace-nowrap">
                      <span>Due Date</span>
                      <span className="text-red-500 font-bold leading-none select-none">*</span>
                    </span>
                  }
                  required={true}
                  value={formData.dueDate}
                  onChange={(dateStr) => handleTextChange("dueDate", dateStr || "")}
                  placeholder="Select Due Date"
                  compact
                />
              </div>

              {/* Payment Settlement & Status Bar */}
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap shrink-0">
                    Selected Settlement:
                  </span>
                  <span className="px-2.5 py-1 rounded-md font-bold text-[11px] uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 whitespace-nowrap shrink-0">
                    {activeMethodObj.label}
                  </span>
                  {formData.paymentMethod === "cash" && (
                    <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                      (Direct cash settlement upon delivery or receipt)
                    </span>
                  )}
                  {formData.paymentMethod === "due" && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                      (Outstanding receivable balance to be collected)
                    </span>
                  )}
                </div>

                {formData.status !== "paid" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap shrink-0">
                      Paid Amount ({currencyObj.symbol}):
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={grandTotal}
                      step="1"
                      value={formData.paidAmount}
                      onChange={(e) => handleTextChange("paidAmount", Number(e.target.value))}
                      className="w-24 text-right px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-medium text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStatusChange("paid")}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm whitespace-nowrap shrink-0 inline-flex items-center gap-1 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark as Paid
                    </button>
                  </div>
                )}
              </div>

              {/* Row 2: FROM and BILLED TO in 1 single row (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* FROM */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" /> FROM (Billed From)
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncFromCompanySettings}
                      title="Reload company details from /company-settings"
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 normal-case tracking-normal cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Sync Company Info
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Company Name <span className="text-[10px] text-gray-400 font-normal">(from Settings)</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.fromCompany}
                      placeholder="Company name"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Email <span className="text-[10px] text-gray-400 font-normal">(from Settings)</span>
                      </label>
                      <input
                        type="email"
                        readOnly
                        value={formData.fromEmail}
                        placeholder="Company email"
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Phone <span className="text-[10px] text-gray-400 font-normal">(from Settings)</span>
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.fromPhone}
                        placeholder="Company phone"
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Address <span className="text-[10px] text-gray-400 font-normal">(from Settings)</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.fromAddress}
                      placeholder="Company address"
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                    />
                  </div>
                </div>

                {/* BILLED TO */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" /> BILLED TO (Client Details)
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddLead(true)}
                      className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 normal-case tracking-normal cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add New Lead
                    </button>
                  </div>

                  {/* CRM Leads Selector */}
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1 whitespace-nowrap">
                        <span>Select Client from CRM Leads:</span>
                        <span className="text-red-500 font-bold leading-none select-none">*</span>
                      </label>
                      {isLoadingLeads && (
                        <span className="text-[10px] text-gray-400">Loading leads...</span>
                      )}
                    </div>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => handleSelectLead(e.target.value)}
                      className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">-- Choose an Active Lead (Auto-fill client details) --</option>
                      {leads.filter(isLeadActive).map((l) => {
                        const id = String(l.id || l._id || l.name);
                        const label = l.name
                          ? (l.contactName && l.contactName !== l.name ? `${l.name} (${l.contactName})` : l.name)
                          : (l.contactName || "Unnamed Lead");
                        return (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                    {leads.filter(isLeadActive).length === 0 && !isLoadingLeads && (
                      <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 pt-0.5">
                        <span>No active CRM leads found.</span>
                        <button
                          type="button"
                          onClick={() => setShowQuickAddLead(true)}
                          className="font-bold underline text-emerald-700 dark:text-emerald-300"
                        >
                          + Create Lead Now
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <span>Client Name</span>
                          <span className="text-red-500 font-bold leading-none select-none">*</span>
                        </span> <span className="text-[10px] text-gray-400 font-normal">(from Lead)</span>
                      </label>
                      <input
                        type="text"
                        readOnly
                        required
                        placeholder="Choose a lead above"
                        value={formData.clientName}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Company <span className="text-[10px] text-gray-400 font-normal">(from Lead)</span>
                      </label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Choose a lead above"
                        value={formData.clientCompany}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <span>Email</span>
                          <span className="text-red-500 font-bold leading-none select-none">*</span>
                        </span> <span className="text-[10px] text-gray-400 font-normal">(from Lead)</span>
                      </label>
                      <input
                        type="email"
                        readOnly
                        required
                        placeholder="Choose a lead above"
                        value={formData.clientEmail}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Phone <span className="text-[10px] text-gray-400 font-normal">(from Lead)</span>
                      </label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Choose a lead above"
                        value={formData.clientPhone}
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Address <span className="text-[10px] text-gray-400 font-normal">(from Lead)</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Choose a lead above"
                      value={formData.clientAddress}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Line Items ({formData.items.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center">#</th>
                          <th className="py-2.5 px-3 whitespace-nowrap min-w-[200px]">
                            <span className="inline-flex items-center gap-1 whitespace-nowrap">
                              <span>Item Name</span>
                              <span className="text-red-500 font-bold leading-none select-none">*</span>
                              <span>& Description</span>
                            </span>
                          </th>
                          <th className="py-2.5 px-3 w-28 min-w-[90px] text-right whitespace-nowrap">
                            <span className="inline-flex items-center justify-end gap-1 w-full whitespace-nowrap">
                              <span className="whitespace-nowrap">Qty</span>
                              <span className="text-red-500 font-bold leading-none select-none">*</span>
                            </span>
                          </th>
                          <th className="py-2.5 px-3 w-44 min-w-[170px] text-right whitespace-nowrap">
                            <span className="inline-flex items-center justify-end gap-1 w-full whitespace-nowrap">
                              <span className="whitespace-nowrap">Unit Price ({currencyObj.symbol})</span>
                              <span className="text-red-500 font-bold leading-none select-none">*</span>
                            </span>
                          </th>
                          <th className="py-2.5 px-3 w-32 text-right whitespace-nowrap">Total</th>
                          <th className="py-2.5 px-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {formData.items.map((item, idx) => {
                          const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                          return (
                            <tr key={item.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                              <td className="py-2 px-3 text-center text-gray-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 space-y-1">
                                <div>
                                  <input
                                    id={`item-title-${idx}`}
                                    type="text"
                                    required
                                    placeholder="Service or Product name *"
                                    value={item.title}
                                    onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                                    className={`w-full font-medium px-2.5 py-1 rounded-md border bg-transparent text-gray-900 dark:text-white transition-colors ${
                                      itemErrors[idx]
                                        ? "border-red-500 ring-1 ring-red-500 bg-red-50/20 dark:bg-red-950/20 placeholder-red-400"
                                        : "border-gray-300 dark:border-gray-700 focus:ring-1 focus:ring-blue-500"
                                    }`}
                                  />
                                  {itemErrors[idx] && (
                                    <p className="text-[10px] font-semibold text-red-500 mt-0.5 flex items-center gap-1">
                                      <span>*</span> {itemErrors[idx]}
                                    </p>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="Description (optional)"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                                  className="w-full text-[11px] text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, "quantity", Math.max(1, Number(e.target.value)))}
                                  className="w-full text-right font-medium px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                                  className="w-full text-right font-medium px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">
                                {formatPrice(itemTotal)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  disabled={formData.items.length <= 1}
                                  onClick={() => removeItem(idx)}
                                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Row 4: Notes & Calculation Totals */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Invoice Notes & Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => handleTextChange("notes", e.target.value)}
                      placeholder="Add notes shown to the client..."
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Payment Settlement Instructions / Bank Details
                    </label>
                    <textarea
                      rows={3}
                      value={formData.paymentTerms}
                      onChange={(e) => handleTextChange("paymentTerms", e.target.value)}
                      placeholder="Bank instructions, cash receipt, or terms..."
                      className="w-full font-mono text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-5">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 space-y-2.5">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        Tax (%):
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={formData.taxRate}
                          onChange={(e) => handleTextChange("taxRate", Number(e.target.value))}
                          className="w-14 text-center px-1 py-0.5 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium"
                        />
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">+{formatPrice(taxAmount)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <span>Discount:</span>
                        <div className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-xs focus-within:ring-1 focus-within:ring-blue-500">
                          <input
                            type="number"
                            min="0"
                            max={formData.discountType === "%" ? 100 : undefined}
                            step={formData.discountType === "%" ? "0.5" : "1"}
                            value={formData.discountValue === 0 ? "" : formData.discountValue}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                handleTextChange("discountValue", 0);
                              } else {
                                const num = Math.max(0, Number(raw));
                                handleTextChange(
                                  "discountValue",
                                  formData.discountType === "%" ? Math.min(100, num) : num
                                );
                              }
                            }}
                            placeholder="0"
                            className="w-16 text-right px-2 py-0.5 bg-transparent text-xs font-semibold text-gray-900 dark:text-white border-0 focus:outline-none"
                          />
                          <select
                            value={formData.discountType === "%" ? "%" : "amount"}
                            onChange={(e) => handleDiscountTypeChange(e.target.value)}
                            className="text-[11px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-l border-gray-300 dark:border-gray-700 focus:outline-none cursor-pointer"
                            title={formData.discountType === "%" ? "Percentage Discount (%)" : `Fixed Amount Discount (${currencyObj.symbol || "Amount"})`}
                          >
                            <option value="%">%</option>
                            <option value="amount">{currencyObj.symbol || "Amount"}</option>
                          </select>
                        </div>
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Total Amount</span>
                      <span className="text-base font-black text-gray-900 dark:text-white">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Amount Paid ({activeMethodObj.label.split(" ")[0]}):</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(effectivePaidAmount)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-dashed border-gray-300 dark:border-gray-700 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Balance Due:
                      </span>
                      <span
                        className={`text-lg font-black ${
                          dueAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatPrice(dueAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* ================= PREVIEW MODE: ELEGANT EDITORIAL INVOICE ================= */
            <div className="space-y-6 print:space-y-0 print:p-0 print:m-0">
              {/* Clean Printable Corporate Invoice Sheet */}
              <div
                id="printable-invoice-sheet"
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-10 md:p-14 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:bg-white print:text-black dark:print:bg-white dark:print:text-black relative font-sans"
              >
                {/* 1. TOP HEADER: Hexagon Logo Monogram on Left, Elegant Serif "Invoice" on Right */}
                <div className="invoice-header-row flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 print:flex-row print:justify-between print:items-center print:pb-6 print:gap-4">
                  {/* Left: Hexagon Brand Monogram or Company Logo */}
                  <div className="flex items-center gap-3">
                    {resolveImageUrl(companyInfo?.invoiceLogoMedia?.fileUrl || companyInfo?.logoMedia?.fileUrl) ? (
                      <img
                        src={resolveImageUrl(companyInfo?.invoiceLogoMedia?.fileUrl || companyInfo?.logoMedia?.fileUrl)}
                        alt={formData.fromCompany}
                        className="max-h-16 max-w-[200px] object-contain print:max-h-14"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 print:w-14 print:h-14 flex items-center justify-center text-white font-serif font-black shadow-sm"
                        style={{
                          backgroundColor: "oklch(0.6 0.118 184.704)",
                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        }}
                      >
                        <span className="text-base font-bold tracking-wider">
                          {getCompanyInitials(formData.fromCompany)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Elegant Serif "Invoice" Heading */}
                  <div>
                    <h1 className="font-serif text-5xl sm:text-6xl print:text-5xl text-gray-900 dark:text-white print:text-black font-normal tracking-tight">
                      Invoice
                    </h1>
                  </div>
                </div>

                {/* 2. BILLED TO & INVOICE DETAILS ROW */}
                <div className="invoice-billed-row grid grid-cols-1 sm:grid-cols-2 gap-8 py-4 items-start print:grid-cols-2 print:gap-8 print:py-4">
                  {/* Left: Billed to */}
                  <div className="space-y-1 text-xs print:text-xs">
                    <div className="font-bold text-gray-900 dark:text-white print:text-black text-sm mb-1.5">
                      Billed to:
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white print:text-black text-sm">
                      {formData.clientName || "Corporate Client"}
                    </p>
                    {formData.clientCompany && (
                      <p className="font-medium text-gray-800 dark:text-gray-200 print:text-black">
                        {formData.clientCompany}
                      </p>
                    )}
                    {formData.clientPhone && (
                      <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                        {formData.clientPhone}
                      </p>
                    )}
                    {formData.clientAddress && (
                      <p className="text-gray-600 dark:text-gray-400 print:text-gray-700 leading-relaxed max-w-xs">
                        {formData.clientAddress}
                      </p>
                    )}
                    {formData.clientEmail && (
                      <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                        {formData.clientEmail}
                      </p>
                    )}
                  </div>

                  {/* Right: Invoice No & Date */}
                  <div className="invoice-billed-right text-left sm:text-right print:text-right space-y-1 text-xs text-gray-700 dark:text-gray-300 print:text-black">
                    <p className="text-gray-900 dark:text-white print:text-black">
                      <span className="text-gray-500 dark:text-gray-400 print:text-gray-600">Invoice No. </span>
                      <span className="font-bold font-mono text-sm">{formData.invoiceNumber}</span>
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white print:text-black">
                      {formatDisplayDate(formData.issueDate) || formData.issueDate}
                    </p>
                    {formData.dueDate && (
                      <p className="text-gray-500 dark:text-gray-400 print:text-gray-600">
                        <span>Due Date: </span>
                        <span className="font-mono">{formatDisplayDate(formData.dueDate) || formData.dueDate}</span>
                      </p>
                    )}
                    <div className="pt-1.5 flex sm:justify-end print:justify-end">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          STATUS_OPTIONS.find((s) => s.value === formData.status)?.color || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formData.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. ITEM & DESCRIPTION TABLE (Clean horizontal lines with thick header borders) */}
                <div className="overflow-x-auto my-8 print:overflow-visible print:my-6 print:w-full">
                  <table className="w-full text-left min-w-[540px] print:min-w-full border-collapse border-b border-gray-200 dark:border-gray-800 print:border-gray-300">
                    <thead>
                      <tr className="border-y border-gray-200 dark:border-gray-800 print:border-gray-300 text-[11px] font-semibold text-gray-500 dark:text-gray-400 print:text-gray-600 uppercase tracking-wider">
                        <th className="py-3 px-3 print:py-2.5 print:px-2">Item</th>
                        <th className="py-3 px-3 print:py-2.5 print:px-2 text-center w-24">Quantity</th>
                        <th className="py-3 px-3 print:py-2.5 print:px-2 text-right w-32">Unit Price</th>
                        <th className="py-3 px-3 print:py-2.5 print:px-2 text-right w-32">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 print:divide-gray-200 text-xs border-b border-gray-200 dark:border-gray-800 print:border-gray-300">
                      {formData.items.map((it, idx) => {
                        const lineTot = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
                        return (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors print:break-inside-avoid">
                            <td className="py-3 px-3 print:py-2.5 print:px-2">
                              <p className="font-semibold text-gray-900 dark:text-white print:text-black">
                                {it.title || "Service Item"}
                              </p>
                              {it.description && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 print:text-gray-600 mt-0.5 leading-relaxed">
                                  {it.description}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3 print:py-2.5 print:px-2 text-center text-gray-600 dark:text-gray-300 print:text-black">
                              {it.quantity}
                            </td>
                            <td className="py-3 px-3 print:py-2.5 print:px-2 text-right text-gray-600 dark:text-gray-300 print:text-black font-mono">
                              {formatPrice(it.unitPrice)}
                            </td>
                            <td className="py-3 px-3 print:py-2.5 print:px-2 text-right font-semibold text-gray-900 dark:text-white print:text-black font-mono">
                              {formatPrice(lineTot)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 4. SUMMARY & TOTAL SECTION (Clean, Minimal & Professional - No Card Box) */}
                <div className="invoice-summary-box w-full sm:w-72 ml-auto space-y-2 text-xs mt-4 print:w-72 print:ml-auto print:mt-4 print:space-y-1.5 print:break-inside-avoid">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 print:text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-mono text-gray-900 dark:text-white print:text-black font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  {taxAmount > 0 && (
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 print:text-gray-700">
                      <span>Tax ({formData.taxRate}%)</span>
                      <span className="font-mono text-gray-900 dark:text-white print:text-black font-medium">+{formatPrice(taxAmount)}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
                      <span>Discount {formData.discountType === "%" && formData.discountValue ? `(${formData.discountValue}%)` : ""}</span>
                      <span className="font-mono font-medium">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  {/* Clean Total Row with only a subtle hairline above */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800 print:border-gray-300 flex justify-between items-baseline text-gray-900 dark:text-white print:text-black">
                    <span className="font-bold text-gray-900 dark:text-white print:text-black text-xs">Total</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-gray-950 dark:text-white print:text-black">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>

                  {effectivePaidAmount > 0 && (
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 print:text-gray-700 pt-0.5">
                      <span>Amount Paid</span>
                      <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
                        {formatPrice(effectivePaidAmount)}
                      </span>
                    </div>
                  )}

                  {dueAmount > 0 ? (
                    <div className="flex justify-between items-center pt-0.5 text-rose-600 dark:text-rose-400 print:text-rose-700 font-semibold">
                      <span>Balance Due</span>
                      <span className="font-mono font-bold">{formatPrice(dueAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-0.5 text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
                      <span>Status</span>
                      <span className="font-medium inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Paid in Full
                      </span>
                    </div>
                  )}
                </div>

                {/* 5. BOTTOM SECTION: Thank You! Script, Payment Info, Company Info & Signature */}
                <div className="invoice-footer-grid mt-12 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start print:grid-cols-2 print:gap-8 print:mt-8 print:pt-6 print:break-inside-avoid">
                  {/* Left Side */}
                  <div className="space-y-4 print:space-y-3">
                    {/* Cursive Thank You! Script */}
                    <div className="select-none">
                      <span
                        className="text-4xl sm:text-5xl font-serif italic text-gray-900 dark:text-white print:text-black print:text-4xl"
                        style={{
                          fontFamily: "'Caveat', 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, serif",
                        }}
                      >
                        Thank You!
                      </span>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300 print:text-black">
                      <h4 className="font-bold text-gray-900 dark:text-white print:text-black uppercase tracking-wider text-[11px] mb-1.5">
                        Payment Information
                      </h4>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400 print:text-gray-600">Method: </span>
                        <span className="font-medium text-gray-900 dark:text-white print:text-black">{activeMethodObj.label}</span>
                      </p>
                      <p>
                        <span className="text-gray-500 dark:text-gray-400 print:text-gray-600">Account Name: </span>
                        <span className="font-medium text-gray-900 dark:text-white print:text-black">{formData.fromCompany}</span>
                      </p>
                      {formData.paymentTerms && (
                        <p className="whitespace-pre-line text-gray-600 dark:text-gray-400 print:text-gray-700">
                          {formData.paymentTerms}
                        </p>
                      )}
                      <p>
                        <span className="text-gray-500 dark:text-gray-400 print:text-gray-600">Pay by: </span>
                        <span className="font-semibold text-gray-900 dark:text-white print:text-black font-mono">
                          {formatDisplayDate(formData.dueDate) || formData.dueDate}
                        </span>
                      </p>
                    </div>

                    {/* User Notes Requirement */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 print:text-gray-700 pt-3 border-t border-gray-100 dark:border-gray-800 print:border-gray-200">
                      <span className="font-bold text-gray-800 dark:text-gray-200 print:text-black">Notes: </span>
                      {formData.notes || "Thank you for choosing our services! Payments should be processed within 15 days of invoice date."}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="invoice-footer-right text-left md:text-right print:text-right space-y-4 self-end print:self-end print:items-end">
                    <div>
                      <h3 className="text-xl sm:text-2xl print:text-xl font-serif text-gray-900 dark:text-white print:text-black tracking-wide">
                        {formData.fromCompany || "Company Name"}
                      </h3>
                      {formData.fromAddress && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 mt-1 whitespace-pre-line leading-relaxed max-w-xs md:ml-auto print:ml-auto">
                          {formData.fromAddress}
                        </p>
                      )}
                      {formData.fromPhone && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 mt-0.5">
                          {formData.fromPhone}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 print:pt-6">
                      <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 font-mono">
                        Authorized Signature: _______________________
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. Centered Corporate Footer Note */}
                <div className="mt-12 pt-6 border-t border-gray-200/60 dark:border-gray-800 print:border-gray-200 text-center text-xs text-gray-500 dark:text-gray-400 print:text-gray-500 print:mt-8 print:pt-4 print:break-inside-avoid">
                  Thank you for your business! If you have any questions regarding this invoice, please contact us at{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200 print:text-black font-mono">
                    {formData.fromEmail || "demo@revinr.local"}
                  </span>.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (Clean: Cancel on left, Print & Confirm on right) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur print:hidden">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition whitespace-nowrap shrink-0"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm whitespace-nowrap shrink-0 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Check className="w-4 h-4" />
              {isSaving ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add CRM Lead Modal */}
      <QuickAddLeadModal
        isOpen={showQuickAddLead}
        onClose={() => setShowQuickAddLead(false)}
        onLeadCreated={handleLeadCreated}
      />
    </div>
  );
}

function QuickAddLeadModal({ isOpen, onClose, onLeadCreated }) {
  const [leadForm, setLeadForm] = useState({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    companyType: "small_business",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name && !leadForm.contactName) {
      toaster("Please provide at least a Company or Contact name", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: leadForm.name || leadForm.contactName,
        contactName: leadForm.contactName || leadForm.name,
        contactEmail: leadForm.contactEmail,
        contactPhone: leadForm.contactPhone,
        address: leadForm.address,
        city: leadForm.city,
        companyType: leadForm.companyType,
        leadStatus: "Active",
        isActive: true,
      };
      const res = await addOrUpdateLead(payload);
      const created = res?.data?.data || res?.data || payload;
      toaster("New CRM lead added successfully", "success");
      onLeadCreated(created);
      onClose();
    } catch (err) {
      console.error("Failed to add lead:", err);
      toaster(err?.response?.data?.message || "Failed to create lead", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            Quick Add CRM Lead
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>Company / Business Name</span>
                <span className="text-red-500 font-bold leading-none select-none">*</span>
              </span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Technologies Ltd."
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Contact Person Name
            </label>
            <input
              type="text"
              placeholder="e.g. Tanvir Hasan"
              value={leadForm.contactName}
              onChange={(e) => setLeadForm({ ...leadForm, contactName: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={leadForm.contactEmail}
                onChange={(e) => setLeadForm({ ...leadForm, contactEmail: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="text"
                placeholder="+880 1712 345678"
                value={leadForm.contactPhone}
                onChange={(e) => setLeadForm({ ...leadForm, contactPhone: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                placeholder="Road 11, Banani"
                value={leadForm.address}
                onChange={(e) => setLeadForm({ ...leadForm, address: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                placeholder="Dhaka"
                value={leadForm.city}
                onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save & Select Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
