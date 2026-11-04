"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  CheckCircle2,
  Clock,
  
  
  RefreshCw,
  TrendingUp,
  Banknote,
  
  
  
  
  Tag,
  RotateCcw,
  Filter,
  Download,
} from "lucide-react";
import { ModalTw } from "@/components/common/ModalTw";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useIncomeTableColumns } from "./hooks/useIncomeTableColumns";
import Pagination from "@/components/common/Pagination";
import DatePicker from "@/components/ui/DatePicker";
import SelectSearch from "@/components/ui/SelectSearch";
import ExportPreviewModal from "./components/ExportPreviewModal";
import { fetchUsers } from "@/services/companySettingsApi";
import {
  fetchIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  exportIncomesFormat,
} from "@/services/accountsApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toaster } from "@/utils/helpers";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useAuthStore } from "@/store/useAuthStore";
import Swal from "sweetalert2";
import { useAccountsQueryApi } from "@/hooks/queryApi/useAccountsQueryApi";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
// Module-level cache for CRM leads to avoid repeated queries
let cachedLeads = null;

const INITIAL_FORM_VALUES = {
  source: "",
  category: "",
  customerId: "",
  description: "",
  amount: "",
  currency: "BDT",
  incomeDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "bank_transfer",
  reference: "",
  status: "received",
  notes: "",
  attachment: null,
};

const downloadBlob = (data, fileName, type = "application/octet-stream") => {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};


export default function Income() {
  const { hasPermission } = useCommonFunctions();
  const canCreate = hasPermission("accounts.income.create");
  const canUpdate = hasPermission("accounts.income.update");
  const canDelete = hasPermission("accounts.income.delete");
  const canManageCategories = hasPermission("accounts.category.view");
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const isSuperAdmin = permissions.includes("*") || permissions.includes("super_admin") || permissions.includes("all") || user?.role?.code === "super_admin";

  // State Management
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExportPreviewModalOpen, setIsExportPreviewModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilter, setShowFilter] = useState(true);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    fromDate ||
    toDate
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e) => {

    if (e.target.checked) {

      setSelectedIds(filteredIncomes.map((i) => i.id));

    } else {

      setSelectedIds([]);

    }

  };



  const handleSelectRow = (id) => {

    setSelectedIds((prev) =>

      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]

    );

  };


  const [leadsOptions, setLeadsOptions] = useState([]);
  const [isFetchingLeads, setIsFetchingLeads] = useState(false);

  useEffect(() => {
    if (!cachedLeads) {
      const loadLeads = async () => {
        setIsFetchingLeads(true);
        try {
          const res = await fetchUsers({ limit: 1000 });
          let list = [];
          if (Array.isArray(res?.data?.data?.data)) list = res.data.data.data;
          else if (Array.isArray(res?.data?.data)) list = res.data.data;
          else if (Array.isArray(res?.data)) list = res.data;
          else if (Array.isArray(res?.data?.list)) list = res.data.list;
          else if (Array.isArray(res)) list = res;

          // Instead of enforcing leadStatus, we just filter valid user items if needed
          const activeList = list.filter((user) => user && user.isActive !== false);

          const options = activeList.map((user) => ({
            value: user.id?.toString() || user._id?.toString(),
            label: user.name || user.firstName || user.username || user.email || `Customer #${user.id || user._id}`,
          }));
          cachedLeads = options;
          setLeadsOptions(options);
        } catch (error) {
          console.error("Failed to load leads:", error);
        } finally {
          setIsFetchingLeads(false);
        }
      };
      loadLeads();
    } else {
      setLeadsOptions(cachedLeads);
    }
  }, []);

  // Load Incomes from Real Backend API
  const loadIncomes = async () => {
    setIsLoading(true);
    try {
      const res = await fetchIncomes({ limit: 100 });
      let loadedData = [];

      if (Array.isArray(res?.data?.data?.data)) {
        loadedData = res.data.data.data;
      } else if (Array.isArray(res?.data?.data)) {
        loadedData = res.data.data;
      } else if (Array.isArray(res?.data)) {
        loadedData = res.data;
      } else if (Array.isArray(res?.data?.incomes)) {
        loadedData = res.data.incomes;
      } else if (Array.isArray(res?.data?.list)) {
        loadedData = res.data.list;
      } else if (Array.isArray(res)) {
        loadedData = res;
      }
      setIncomes(loadedData);
    } catch (err) {
      console.warn("Failed fetching incomes from API:", err);
      setIncomes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, fromDate, toDate]);

  // Currency & Amount Formatting Helper
  const formatAmount = (amount, currencyCode = "BDT") => {
    const symbol = currencyCode === "USD" ? "$" : "Tk";
    const num = Number(amount || 0);
    return `${symbol} ${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDateWithDay = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Metrics Summary Calculation
  const metrics = useMemo(() => {
    const totalCount = incomes.length;
    const receivedList = incomes.filter(
      (i) => String(i.status).toLowerCase() === "received",
    );
    const pendingList = incomes.filter(
      (i) => String(i.status).toLowerCase() === "pending",
    );
    const cancelledList = incomes.filter(
      (i) => String(i.status).toLowerCase() === "cancelled",
    );

    const totalSum = incomes.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0,
    );
    const receivedSum = receivedList.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0,
    );
    const pendingSum = pendingList.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0,
    );
    const avgIncome = totalCount > 0 ? totalSum / totalCount : 0;

    return {
      totalCount,
      totalSum,
      receivedCount: receivedList.length,
      receivedSum,
      pendingCount: pendingList.length,
      pendingSum,
      cancelledCount: cancelledList.length,
      avgIncome,
    };
  }, [incomes]);

  const accountsQuery = useAccountsQueryApi();
  const { data: categoriesData, refetch: refetchCategories } = accountsQuery.useIncomeCategoriesQuery({ status: "all", limit: 1000 });

  // Refetch categories when the Add/Edit form opens so new master categories appear
  useEffect(() => {
    if (isFormModalOpen) {
      refetchCategories();
    }
  }, [isFormModalOpen, refetchCategories]);

  const activeCategories = useMemo(() => {
    let fetched = [];
    if (Array.isArray(categoriesData?.data?.data?.data)) fetched = categoriesData.data.data.data;
    else if (Array.isArray(categoriesData?.data?.data)) fetched = categoriesData.data.data;
    else if (Array.isArray(categoriesData?.data?.list)) fetched = categoriesData.data.list;
    else if (Array.isArray(categoriesData?.data)) fetched = categoriesData.data;
    else if (Array.isArray(categoriesData)) fetched = categoriesData;
    return fetched.filter(cat => cat.source !== "master");
  }, [categoriesData]);

  const filterValues = useMemo(
    () => ({
      search: searchTerm,
      category: categoryFilter,
      dateRange: [fromDate, toDate].filter(Boolean),
    }),
    [searchTerm, categoryFilter, fromDate, toDate]
  );

  const handleFilterChange = (filterName, value) => {
    if (filterName === "search") {
      setSearchTerm(value || "");
    } else if (filterName === "category") {
      setCategoryFilter(value || "all");
    } else if (filterName === "dateRange") {
      if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
        setFromDate(value[0]);
        setToDate(value[1]);
      } else {
        setFromDate("");
        setToDate("");
      }
    }
  };

  const filterConfig = useMemo(
    () => [
      {
        component: "input",
        name: "search",
        label: "Search",
        placeholder: "Search source, category, ref...",
        className: "col-span-12 sm:col-span-6 lg:col-span-4",
      },
      {
        component: "select",
        name: "category",
        label: "Category",
        placeholder: "All Categories",
        options: [
          { label: "All Categories", value: "all" },
          ...activeCategories.map((cat) => ({
            label: `${cat.name} ${cat.source === "master" ? "(Default)" : ""}`.trim(),
            value: cat.name,
          })),
        ],
        className: "col-span-12 sm:col-span-6 lg:col-span-4",
      },
      {
        component: "datePicker",
        name: "dateRange",
        label: "Date Range",
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
    [activeCategories]
  );

  // Filtered Income Records
  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const statusStr = String(item.status || "").toLowerCase();

      if (statusFilter !== "all" && statusStr !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      if (fromDate || toDate) {
        const itemDateStr = item.incomeDate || item.createdAt;
        if (!itemDateStr) return false;
        const itemDate = new Date(itemDateStr);
        itemDate.setHours(0, 0, 0, 0);

        if (fromDate) {
          const fDate = new Date(fromDate);
          fDate.setHours(0, 0, 0, 0);
          if (itemDate < fDate) return false;
        }
        if (toDate) {
          const tDate = new Date(toDate);
          tDate.setHours(0, 0, 0, 0);
          if (itemDate > tDate) return false;
        }
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const numMatch = item.incomeNumber?.toLowerCase().includes(query);
        const sourceMatch = item.source?.toLowerCase().includes(query);
        const categoryMatch = item.category?.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        const refMatch = item.reference?.toLowerCase().includes(query);
        const custMatch = String(item.customerId || "").includes(query);

        if (
          !numMatch &&
          !sourceMatch &&
          !categoryMatch &&
          !descMatch &&
          !refMatch &&
          !custMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [incomes, statusFilter, categoryFilter, searchTerm, fromDate, toDate]);

  // Export Action
  const getExportData = (incomesList) => {
    const headers = [
      "ID",
      "Source",
      "Category",
      "Customer / Lead",
      "Amount",
      "Currency",
      "Date",
      "Payment Method",
      "Status",
      "Reference",
      "Description",
      "Notes",
    ];
    const rows = incomesList.map((item) => {
      let customerStr = item.customerName;
      if (!customerStr && typeof item.customer === "string")
        customerStr = item.customer;
      if (!customerStr && typeof item.customer === "object")
        customerStr = item.customer?.name || item.customer?.contactName;
      if (!customerStr && item.customerId) customerStr = `ID: ${item.customerId}`;

      return [
        item.incomeNumber || item.id || "-",
        item.source || "-",
        item.category || "-",
        customerStr || "-",
        item.amount || 0,
        item.currency || "BDT",
        item.incomeDate || item.createdAt || "-",
        item.paymentMethod || "-",
        item.status || "-",
        item.reference || "-",
        item.description || "-",
        item.notes || "-",
      ];
    });
    return { headers, rows };
  };

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      let fileData;

      try {
        fileData = await exportIncomesFormat({
          search: searchTerm,
          status: statusFilter,
          category: categoryFilter,
          fromDate,
          toDate,
        }, format);
        
        let mimeType = "text/csv;charset=utf-8;";
        if (format === "excel") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        else if (format === "pdf") mimeType = "application/pdf";

        downloadBlob(
          fileData,
          `income-report-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`,
          mimeType,
        );
      } catch {
        // Fallback to client-side generation from filteredIncomes
        const { headers, rows } = getExportData(filteredIncomes);
        
        if (format === "csv") {
          const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");

          downloadBlob(csvContent, `income-report-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
        } else if (format === "excel") {
          const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Incomes");
          XLSX.writeFile(workbook, `income-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
        } else if (format === "pdf") {
          const doc = new jsPDF("landscape");
          autoTable(doc, { head: [headers], body: rows });
          doc.save(`income-report-${new Date().toISOString().slice(0, 10)}.pdf`);
        }
      }

    } catch (err) {
      console.error(`Export ${format} error:`, err);
      toaster(`Failed to export ${format.toUpperCase()} report`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Paginated Records
  const paginatedIncomes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIncomes.slice(start, start + itemsPerPage);
  }, [filteredIncomes, currentPage, itemsPerPage]);

  // Form Input Change Handler
  const handleInputChange = (eOrValue, event) => {
    if (eOrValue && eOrValue.target) {
      // Standard native event
      const { name, value } = eOrValue.target;
      setFormValues((prev) => ({ ...prev, [name]: value }));
    } else if (event && event.target) {
      // Custom Input component where first arg is value, second is event
      const { name } = event.target;
      setFormValues((prev) => ({ ...prev, [name]: eOrValue }));
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormValues(INITIAL_FORM_VALUES);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (income) => {
    setEditingId(income.id || income._id);
    
    let parsedDate = new Date().toISOString().slice(0, 10);
    const dateStr = income.incomeDate || income.income_date || income.createdAt;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        parsedDate = d.toISOString().slice(0, 10);
      }
    }

    setFormValues({
      source: income.source || "",
      category: income.category || "",
      customerId: income.customerId || "",
      description: income.description || "",
      amount: income.amount || "",
      currency: income.currency || "BDT",
      incomeDate: parsedDate,
      paymentMethod: income.paymentMethod || "bank_transfer",
      reference: income.reference || "",
      status: income.status || "received",
      notes: income.notes || "",
    });
    setIsFormModalOpen(true);
  };

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingIncome, setViewingIncome] = useState(null);

  const handleViewIncome = (income) => {
    setViewingIncome(income);
    setIsViewModalOpen(true);
  };



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith(".zip")) {
        toaster("ZIP files are not allowed", "error");
        e.target.value = null;
        return;
      }
      
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        toaster("Attachment size cannot exceed 2 MB", "error");
        e.target.value = null;
        return;
      }

      setFormValues((prev) => ({ ...prev, attachment: file }));
    } else {
      setFormValues((prev) => ({ ...prev, attachment: null }));
    }
  };

  // Submit Handler for Add / Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let payload;
    
    if (formValues.attachment) {
      const formData = new FormData();
      Object.keys(formValues).forEach((key) => {
        if (key === "attachment" && formValues[key]) {
          formData.append("file", formValues[key]);
        } else if (key === "amount") {
          formData.append("amount", Number(formValues.amount));
        } else if (key === "incomeDate") {
          formData.append("incomeDate", formValues.incomeDate ? new Date(formValues.incomeDate).toISOString() : new Date().toISOString());
        } else if (key === "customerId") {
          if (formValues.customerId) formData.append("customerId", Number(formValues.customerId));
        } else if (key === "reference") {
          if (formValues.reference?.trim()) formData.append("reference", formValues.reference.trim());
        } else if (key !== "attachment" && formValues[key] !== undefined && formValues[key] !== null) {
          formData.append(key, formValues[key]);
        }
      });
      payload = formData;
    } else {
      payload = { ...formValues };
      payload.amount = Number(formValues.amount);
      payload.incomeDate = formValues.incomeDate ? new Date(formValues.incomeDate).toISOString() : new Date().toISOString();
      
      if (payload.customerId) {
        payload.customerId = Number(payload.customerId);
      } else {
        payload.customerId = null; // Send null instead of empty string
      }
      
      if (payload.reference && payload.reference.trim()) {
        payload.reference = payload.reference.trim();
      } else {
        payload.reference = null;
      }
      
      delete payload.attachment;
    }

    try {
      if (editingId) {
        await updateIncome(editingId, payload);
        toaster("Income record updated successfully!", "success");
      } else {
        await createIncome(payload);
        toaster("New income record added successfully!", "success");
      }

      await loadIncomes();
      setIsFormModalOpen(false);
      setFormValues(INITIAL_FORM_VALUES);
    } catch (err) {
      console.error("Failed to save income:", err);
      const errMsg =
        typeof err?.response?.data === "string"
          ? err.response.data
          : JSON.stringify(err?.response?.data || "") + (err?.message || "");

      let msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? "Permission denied (403). Your account role lacks accounts.income.create permission on the backend server."
          : "Failed to save income record");

      if (
        errMsg.includes("uq_account_income_app_reference") ||
        errMsg.includes("Duplicate entry")
      ) {
        Swal.fire({
          title: "Duplicate Reference",
          text: "Duplicate transaction reference. Please use a unique reference.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-2xl",
            confirmButton:
              "px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm",
          },
          buttonsStyling: false,
        });
        return;
      }

      toaster(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Income Handler
  const handleDeleteIncome = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this income record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup rounded-2xl",
        confirmButton:
          "px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm",
        cancelButton:
          "px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteIncome(id);
          toaster("Income record deleted", "success");
          await loadIncomes();
        } catch (err) {
          console.error("Failed to delete income:", err);
          toaster(
            err?.response?.data?.message || "Failed to delete income record",
            "error",
          );
        }
      }
    });
  };


  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${selectedIds.length} income record(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup rounded-2xl",
        confirmButton:
          "px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm",
        cancelButton:
          "px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          for (const id of selectedIds) {
            await deleteIncome(id);
          }
          toaster(`${selectedIds.length} income record(s) deleted`, "success");
          setSelectedIds([]);
          await loadIncomes();
        } catch (err) {
          console.error("Failed to delete incomes:", err);
          toaster(
            err?.response?.data?.message || "Failed to delete some records",
            "error",
          );
        }
      }
    });
  };

  // Status Badge Helper
  const getBadgeClasses = (status) => {
    switch (String(status).toLowerCase()) {
      case "received":
        return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "pending":
        return "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "cancelled":
        return "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  // Payment Method Label Helper
  const formatPaymentMethod = (method) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer";
      case "mobile_payment":
        return "Mobile Payment";
      case "cash":
        return "Cash";
      case "card":
        return "Card Payment";
      case "cheque":
        return "Cheque";
      default:
        return method || "Other";
    }
  };

  const [sorting, setSorting] = useState([]);

  const columns = useIncomeTableColumns({
    canUpdate,
    selectedIds,

    handleSelectRow,

    handleSelectAll,

    incomes: filteredIncomes,
    canDelete,
    handleOpenEditModal,
    handleDeleteIncome,
    handleViewIncome,
    formatPaymentMethod,
    formatDateWithDay,
    formatAmount,
    getBadgeClasses,
    leadsOptions,
  });

  const table = useReactTable({
    data: paginatedIncomes || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6 pb-12 pt-6 px-4 sm:px-6">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-600" />
            Income & Revenue Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
            title="Toggle Filter"
            className={`p-2.5 rounded-xl border text-xs font-semibold transition shadow-sm active:scale-95 ${
              showFilter || hasActiveFilters
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={loadIncomes}
            title="Refresh Incomes"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isLoading ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsExportPreviewModalOpen(true)}
            disabled={isExporting}
            title="Download CSV Report"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <Download
              className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`}
            />
            Export
          </button>

          {canManageCategories && (
            <Link
              href={isSuperAdmin ? "/accounts/master-categories?type=income" : "/accounts/categories?type=income"}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
            >
              <Tag className="w-4 h-4" />
              Manage Categories
            </Link>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Income
            </button>
          )}
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Received */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Received Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.receivedCount}
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Total: {formatAmount(metrics.receivedSum)}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Income */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending Collections
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {metrics.pendingCount}
            </h3>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Pending: {formatAmount(metrics.pendingSum)}
            </span>
          </div>
        </div>

        {/* Card 3: Average Entry Amount */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg. Transaction
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {metrics.totalCount}
            </h3>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Avg: {formatAmount(metrics.avgIncome)}
            </span>
          </div>
        </div>

        {/* Card 4: Total Revenue Sum */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {formatAmount(metrics.totalSum)}
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              {metrics.totalCount} Entries
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

      
        {/* Bulk Action Bar (When rows are selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white dark:bg-gray-800 dark:text-gray-100 border border-slate-800 dark:border-gray-700 shadow-md mb-4">
            <span className="text-xs font-semibold px-2 text-slate-200 dark:text-gray-200">
              {selectedIds.length} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              {canDelete && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-500 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Bulk Delete
                </button>
              )}
            </div>
          </div>
        )}

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 w-full mb-4">
        {[
          { key: "all", label: "All Incomes", count: incomes.length },
          {
            key: "received",
            label: "Received",
            count: metrics.receivedCount,
          },
          { key: "pending", label: "Pending", count: metrics.pendingCount },
          {
            key: "cancelled",
            label: "Cancelled",
            count: metrics.cancelledCount,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === tab.key
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm"
            }`}
          >
            {tab.label}{" "}
            <span className="opacity-75 text-[10px] font-mono">
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Income Records Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading income records...</p>
          </div>
        ) : filteredIncomes.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No Income Records Found
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No income records matching your active filters."
                  : "No income records registered yet. Click 'Add Income' to add one."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <CommonTable
              table={table}
              isFetching={isLoading}
              itemsPerPage={itemsPerPage}
              columns={columns}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Pagination Controls */}
        {filteredIncomes.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredIncomes.length / itemsPerPage)}
              onPageChange={(page) => setCurrentPage(page)}
              onItemsPerPageChange={(newLimit) => {
                setItemsPerPage(newLimit);
                setCurrentPage(1);
              }}
              totalItems={filteredIncomes.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Modal 1: Add / Edit Income Modal */}
      <ModalTw
        show={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingId ? "Edit Income Record" : "Record New Income"}
        size="2xl"
        showFooter={false}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Source */}
            <Input
              label={
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Source <span className="text-rose-500">*</span>
                </span>
              }
              type="text"
              name="source"
              required
              value={formValues.source}
              onChange={handleInputChange}
              placeholder="e.g. Product Sales, Consulting"
              className="!mb-0"
            />

            {/* Category */}
            <SelectSearch
              label={
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Category <span className="text-rose-500">*</span>
                </span>
              }
              value={formValues.category}
              onChange={(val) =>
                setFormValues((prev) => ({ ...prev, category: val }))
              }
              options={activeCategories.map((cat) => ({
                label: typeof cat === "object" ? cat.name : cat,
                value: typeof cat === "object" ? cat.name : cat,
              }))}
              placeholder="Select category..."
              className="!mb-0"
            />

            {/* Amount */}
            <Input
              label={
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Amount <span className="text-rose-500">*</span>
                </span>
              }
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              value={formValues.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              className="!mb-0 font-mono font-bold"
            />

            {/* Currency */}
            <SelectSearch
              label={<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Currency</span>}
              value={formValues.currency}
              onChange={(val) =>
                setFormValues((prev) => ({ ...prev, currency: val }))
              }
              options={[
                { label: "BDT (Tk)", value: "BDT" },
                { label: "USD ($)", value: "USD" },
                { label: "EUR (€)", value: "EUR" },
              ]}
              className="!mb-0"
            />

            {/* Income Date */}
            <DatePicker
              label={
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Income Date <span className="text-rose-500">*</span>
                </span>
              }
              name="incomeDate"
              value={formValues.incomeDate}
              onChange={(dateStr) =>
                setFormValues((prev) => ({
                  ...prev,
                  incomeDate: dateStr || "",
                }))
              }
              placeholder="Select Income Date"
              compact
            />

            {/* Payment Method */}
            <SelectSearch
              label={<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Payment Method</span>}
              value={formValues.paymentMethod}
              onChange={(val) =>
                setFormValues((prev) => ({ ...prev, paymentMethod: val }))
              }
              options={[
                { label: "Bank Transfer", value: "bank_transfer" },
                { label: "Cash", value: "cash" },
                { label: "Card Payment", value: "card" },
                {
                  label: "Mobile Payment (bKash/Nagad)",
                  value: "mobile_payment",
                },
                { label: "Cheque", value: "cheque" },
                { label: "Other", value: "other" },
              ]}
              className="!mb-0"
            />

            {/* Reference */}
            <Input
              label={
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Transaction / Ref #
                </span>
              }
              type="text"
              name="reference"
              value={formValues.reference}
              onChange={handleInputChange}
              placeholder="e.g. TRX-BNK-98421"
              className="!mb-0"
            />

            {/* Customer ID / Lead */}
            <div className="block">
              <SelectSearch
                label={<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Customer / Lead (Optional)</span>}
                options={leadsOptions}
                value={formValues.customerId?.toString() || ""}
                onChange={(val) =>
                  setFormValues((prev) => ({ ...prev, customerId: val }))
                }
                placeholder={
                  isFetchingLeads
                    ? "Loading clients..."
                    : "Search and select a client"
                }
                searchable={true}
                className="!mb-0"
              />
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <SelectSearch
                label={<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Status</span>}
                value={formValues.status}
                onChange={(val) =>
                  setFormValues((prev) => ({ ...prev, status: val }))
                }
                options={[
                  { label: "Received (Paid)", value: "received" },
                  { label: "Pending (Awaiting Clearance)", value: "pending" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
                className="!mb-0"
              />
            </div>
          </div>

          {/* Description */}
          <Input
            label={
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Description
              </span>
            }
            type="text"
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            placeholder="Brief description of the received payment..."
            className="!mb-0"
          />

          {/* Notes */}
          <label className="space-y-1.5 block">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Notes / Internal Remarks
            </span>
            <textarea
              name="notes"
              rows={2}
              value={formValues.notes}
              onChange={handleInputChange}
              placeholder="Additional internal notes..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* Attachment */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Attachment <span className="text-[10px] text-gray-500 font-normal">(No ZIP files)</span>
            </span>
            <input
              type="file"
              name="attachment"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              className="block w-full text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950/50 dark:file:text-blue-400"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : editingId ? (
                "Update Record"
              ) : (
                "Save Income Record"
              )}
            </button>
          </div>
        </form>
      </ModalTw>


      {/* Modal 4: View Income Modal */}
      <ModalTw
        show={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Income Details"
        showFooter={false}
      >
        {viewingIncome && (
          <div className="p-1 space-y-4 text-sm text-gray-800 dark:text-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Income #</span>
                <span className="font-medium">{viewingIncome.incomeNumber || `INC-${viewingIncome.id || viewingIncome._id}`}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Source</span>
                <span className="font-medium">{viewingIncome.source}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Category</span>
                <span className="font-medium">{viewingIncome.category}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Lead</span>
                <span className="font-medium">
                  {viewingIncome.customerId
                    ? leadsOptions?.find((l) => String(l.value) === String(viewingIncome.customerId))?.label || `#${viewingIncome.customerId}`
                    : "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Date</span>
                <span className="font-medium">
                  {viewingIncome.incomeDate || viewingIncome.income_date || viewingIncome.createdAt ? formatDateWithDay(viewingIncome.incomeDate || viewingIncome.income_date || viewingIncome.createdAt) : "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Amount</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatAmount(viewingIncome.amount, viewingIncome.currency)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Payment Method</span>
                <span className="font-medium">{formatPaymentMethod(viewingIncome.paymentMethod)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Status</span>
                <Badge
                  className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeClasses(viewingIncome.status)}`}
                >
                  {viewingIncome.status}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-500 block text-xs">Reference</span>
                <span className="font-medium">{viewingIncome.reference || "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-500 block text-xs">Description</span>
                <span className="font-medium">{viewingIncome.description || "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-500 block text-xs">Notes</span>
                <span className="font-medium">{viewingIncome.notes || "-"}</span>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ModalTw>

      {/* Modal 3: Export Preview Modal */}
      <ExportPreviewModal
        isOpen={isExportPreviewModalOpen}
        onClose={() => setIsExportPreviewModalOpen(false)}
        type="income"
        totalCount={incomes.length}
        filteredCount={filteredIncomes.length}
        totalAmount={filteredIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)}
        metrics={metrics}
        activeCategories={activeCategories}
        
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        isExporting={isExporting}
        onExport={handleExport}
        
        columns={[
          "Income #",
          "Source",
          "Category",
          "Lead",
          "Date",
          "Payment Method",
          "Reference",
          "Description",
          "Notes",
          { label: "Amount", align: "right" },
          { label: "Status", align: "center" }
        ]}
        data={filteredIncomes}
        renderRow={(item) => {
          const leadLabel = item.customerId
            ? leadsOptions?.find((l) => String(l.value) === String(item.customerId))?.label || `#${item.customerId}`
            : "-";
          
          return (
            <TableRow
              key={item.id}
              className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <TableCell className="px-4 py-2.5 font-bold text-gray-900 dark:text-white font-mono">
                {item.incomeNumber || `INC-${item.id}`}
              </TableCell>
              <TableCell className="px-4 py-2.5 font-semibold text-gray-800 dark:text-gray-200">
                {item.source}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                {item.category}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                {leadLabel}
              </TableCell>
              <TableCell className="px-4 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-400">
                {(item.incomeDate || item.income_date || item.createdAt) ? formatDateWithDay(item.incomeDate || item.income_date || item.createdAt) : "-"}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                {formatPaymentMethod(item.paymentMethod)}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400">
                {item.reference || "-"}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                {item.description || "-"}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                {item.notes || "-"}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                {formatAmount(item.amount, item.currency)}
              </TableCell>
              <TableCell className="px-4 py-2.5 text-center">
                <Badge
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeClasses(item.status)}`}
                >
                  {item.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        }}
      />
    </div>
  );
}
