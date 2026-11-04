"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  Plus,
  CheckCircle2,
  Clock,
  
  ChevronRight,
  RefreshCw,
  
  Receipt,
  
  
  
  
  Filter,
  
  Tag,
  
  Download,
  
  Layers,
} from "lucide-react";
import { ModalTw } from "@/components/common/ModalTw";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useExpenseTableColumn } from "./hooks/useExpenseTableColumn";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import SelectSearch from "@/components/ui/SelectSearch";
import ExportPreviewModal from "./components/ExportPreviewModal";
import Pagination from "@/components/common/Pagination";
import DatePicker from "@/components/ui/DatePicker";
import { toaster } from "@/utils/helpers";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccountsQueryApi } from "@/hooks/queryApi/useAccountsQueryApi";
import { useExpenseFilters } from "./hooks/useExpenseFilters";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { generateVoucherPdf } from "@/utils/generateVoucherPdf";
import {
  exportExpensesFormat,
  
} from "@/services/accountsApi";
import Swal from "sweetalert2";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
const INITIAL_FORM_VALUES = {
  category: "Operating",
  amount: "",
  currency: "BDT",
  expenseDate: new Date().toISOString().slice(0, 10),
  vendor: "",
  paymentMethod: "bank_transfer",
  reference: "",
  status: "paid",
  description: "",
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

export default function Expense() {
  const { hasPermission } = useCommonFunctions();
  const canView = hasPermission("accounts.expense.view");
  const canCreate = hasPermission("accounts.expense.create");
  const canUpdate = hasPermission("accounts.expense.update");
  const canDelete = hasPermission("accounts.expense.delete");
  const canManageCategories = hasPermission("accounts.category.view");
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions) || [];
  const isSuperAdmin = permissions.includes("*") || permissions.includes("super_admin") || permissions.includes("all") || user?.role?.code === "super_admin";

  const {
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    globalFilter,
    filters,
    setFilters,
    handleFilterChange,
    clearAllFilters,
    hasActiveFilters,
    queryParams,
  } = useExpenseFilters(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportPreviewModalOpen, setIsExportPreviewModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");

  const handleClose = () => {
    setIsFormModalOpen(false);
    setEditingId(null);
    setFormValues(INITIAL_FORM_VALUES);
  };

  const accountsQuery = useAccountsQueryApi({ handleClose });

  // 1. Core List Query
  const {
    data: expensesData,
    isLoading,
    isFetching,
    refetch,
  } = accountsQuery.useExpensesQuery(queryParams);

  // 2. Active Categories Query
  const { data: categoriesData, refetch: refetchCategories } = accountsQuery.useExpenseCategoriesQuery({ status: "all", limit: 1000 });

  // Refetch categories when the Add/Edit form opens so new master categories appear
  useEffect(() => {
    if (isFormModalOpen) {
      refetchCategories();
    }
  }, [isFormModalOpen, refetchCategories]);

  // 3. Analytics Summary Query
  const { data: summaryData } = accountsQuery.useExpenseSummaryQuery({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    category: filters.category,
  });


  // Mutations
  const createMutation = accountsQuery.createExpenseMutation;
  const updateMutation = accountsQuery.updateExpenseMutation;
  const deleteMutation = accountsQuery.deleteExpenseMutation;
  const bulkDeleteMutation = accountsQuery.bulkDeleteExpensesMutation;
  const bulkStatusUpdateMutation = accountsQuery.bulkUpdateExpenseStatusMutation;

  // Process list data & pagination
  const rawExpenses = useMemo(() => {
    if (Array.isArray(expensesData?.data?.data?.data)) return expensesData.data.data.data;
    if (Array.isArray(expensesData?.data?.data)) return expensesData.data.data;
    if (Array.isArray(expensesData?.data)) return expensesData.data;
    if (Array.isArray(expensesData)) return expensesData;
    if (Array.isArray(expensesData?.items)) return expensesData.items;
    return [];
  }, [expensesData]);

  const paginationData =
    expensesData?.data?.data?.pagination ||
    expensesData?.data?.pagination ||
    expensesData?.pagination || {
      total: rawExpenses.length,
      page: currentPage,
      limit,
    };

  const expenses = useMemo(() => {
    return rawExpenses.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * limit + index + 1,
    }));
  }, [rawExpenses, currentPage, limit]);

  // Extract unique vendors for autocomplete
  const uniqueVendors = useMemo(() => {
    const vendors = rawExpenses.map(e => e.vendor).filter(Boolean);
    return Array.from(new Set(vendors)).sort();
  }, [rawExpenses]);

  // Categories dropdown list
  const activeCategories = useMemo(() => {
    let fetched = [];
    if (Array.isArray(categoriesData?.data?.data?.data)) fetched = categoriesData.data.data.data;
    else if (Array.isArray(categoriesData?.data?.data)) fetched = categoriesData.data.data;
    else if (Array.isArray(categoriesData?.data?.list)) fetched = categoriesData.data.list;
    else if (Array.isArray(categoriesData?.data)) fetched = categoriesData.data;
    else if (Array.isArray(categoriesData)) fetched = categoriesData;
    
    if (fetched.length > 0) return fetched.filter(cat => cat.source !== "master");
    return [
      { name: "Office Rent" },
      { name: "Utilities" },
      { name: "Software & IT" },
      { name: "Marketing" },
      { name: "Supplies" },
      { name: "Salaries & Wages" },
      { name: "Travel & Meals" },
      { name: "Operating" },
    ];
  }, [categoriesData]);

  const [showFilter, setShowFilter] = useState(true);

  const filterValues = useMemo(
    () => ({
      search: globalFilter,
      category: filters.category,
      dateRange: [filters.fromDate, filters.toDate].filter(Boolean),
    }),
    [globalFilter, filters.category, filters.fromDate, filters.toDate]
  );

  const onFilterChange = (filterName, value) => {
    if (filterName === "dateRange") {
      if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
        setFilters((prev) => ({
          ...prev,
          fromDate: value[0],
          toDate: value[1],
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          fromDate: "",
          toDate: "",
        }));
      }
      setCurrentPage(1);
    } else {
      handleFilterChange(filterName, value);
    }
  };

  const filterConfig = useMemo(
    () => [
      {
        component: "input",
        name: "search",
        label: "Search",
        placeholder: "Search vendor, ref, notes...",
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

  // Summary Metrics
  const summary = useMemo(() => {
    const summaryDataObj = summaryData?.data?.data || summaryData?.data || summaryData;
    const hasSummaryApiData =
      summaryDataObj &&
      (Number(summaryDataObj.totalExpenses) > 0 ||
        Number(summaryDataObj.totalCount) > 0 ||
        Number(summaryDataObj.paidAmount) > 0 ||
        Number(summaryDataObj.pendingAmount) > 0);

    if (hasSummaryApiData) {
      return {
        totalExpenses: Number(summaryDataObj.totalExpenses || 0),
        paidAmount: Number(summaryDataObj.paidAmount || 0),
        pendingAmount: Number(summaryDataObj.pendingAmount || 0),
        totalCount: Number(summaryDataObj.totalCount || 0),
        categoryBreakdown: summaryDataObj.categoryBreakdown || [],
      };
    }

    // Dynamic fallback computed metrics from current active expenses list
    const totalCount = expenses.length;
    const paidList = expenses.filter(
      (i) => String(i.status || "").toLowerCase() === "paid"
    );
    const pendingList = expenses.filter(
      (i) => String(i.status || "").toLowerCase() === "pending"
    );

    const totalSum = expenses.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0
    );
    const paidSum = paidList.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0
    );
    const pendingSum = pendingList.reduce(
      (acc, i) => acc + (Number(i.amount) || 0),
      0
    );

    return {
      totalExpenses: totalSum,
      paidAmount: paidSum,
      pendingAmount: pendingSum,
      totalCount,
      categoryBreakdown: [],
    };
  }, [summaryData, expenses]);

  const statusCounts = useMemo(() => {
    const list = rawExpenses || expenses || [];
    return {
      all: list.length,
      paid: list.filter((i) => String(i.status || "").toLowerCase() === "paid").length,
      pending: list.filter((i) => String(i.status || "").toLowerCase() === "pending").length,
      cancelled: list.filter((i) => String(i.status || "").toLowerCase() === "cancelled").length,
    };
  }, [rawExpenses, expenses]);

  // Currency & Amount Formatter
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

  const getBadgeClasses = (status) => {
    switch (String(status).toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80";
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80";
      case "cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };


  // Row Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(expenses.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormValues(INITIAL_FORM_VALUES);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingId(expense.id || expense._id);

    let parsedDate = new Date().toISOString().slice(0, 10);
    const dateStr = expense.expenseDate || expense.expense_date || expense.createdAt;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        parsedDate = d.toISOString().slice(0, 10);
      }
    }

    setFormValues({
      category: expense.category || "Operating",
      amount: expense.amount || "",
      currency: expense.currency || "BDT",
      expenseDate: parsedDate,
      vendor: expense.vendor || "",
      paymentMethod: expense.paymentMethod || "bank_transfer",
      reference: expense.reference || "",
      status: expense.status || "paid",
      description: expense.description || "",
      notes: expense.notes || "",
    });
    setIsFormModalOpen(true);
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

    const handleFormSubmit = (e) => {
    e.preventDefault();
    let isoDate;
    try {
      isoDate = formValues.expenseDate
        ? new Date(formValues.expenseDate).toISOString()
        : new Date().toISOString();
    } catch (err) {
      isoDate = new Date().toISOString();
    }

    let payload;
    
    if (formValues.attachment) {
      const formData = new FormData();
      Object.keys(formValues).forEach((key) => {
        if (key === "attachment" && formValues[key]) {
          formData.append("file", formValues[key]);
        } else if (key === "amount") {
          formData.append("amount", Number(formValues.amount));
        } else if (key === "expenseDate") {
          formData.append("expenseDate", isoDate);
        } else if (key !== "attachment" && formValues[key] !== undefined && formValues[key] !== null) {
          formData.append(key, formValues[key]);
        }
      });
      payload = formData;
    } else {
      payload = {
        ...formValues,
        amount: Number(formValues.amount),
        expenseDate: isoDate
      };
      delete payload.attachment;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteExpense = (expenseOrId) => {
    const targetId =
      typeof expenseOrId === "object" && expenseOrId !== null
        ? expenseOrId.id ?? expenseOrId._id
        : expenseOrId;

    if (!targetId && targetId !== 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this expense record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup rounded-2xl",
        confirmButton:
          "px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition",
        cancelButton:
          "px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(targetId);
      }
    });
  };

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);

  const formatPaymentMethod = (method) => {
    switch (method) {
      case "bank_transfer": return "Bank Transfer";
      case "mobile_payment": return "Mobile Payment";
      case "cash": return "Cash";
      case "card": return "Card Payment";
      case "cheque": return "Cheque";
      default: return method || "Other";
    }
  };

  const handleViewExpense = (expense) => {
    setViewingExpense(expense);
    setIsViewModalOpen(true);
  };

  // Export CSV Action
  const getExportData = (data) => {
    const headers = [
      "Ref / #",
      "Category",
      "Vendor / Payee",
      "Expense Date",
      "Amount",
      "Currency",
      "Payment Method",
      "Status",
      "Description",
      "Notes",
    ];
    const rows = data.map((item) => [
      item.reference || `EXP-${item.id}`,
      item.category || "-",
      item.vendor || "-",
      item.expenseDate ? new Date(item.expenseDate).toLocaleDateString() : "-",
      item.amount || 0,
      item.currency || "USD",
      formatPaymentMethod(item.paymentMethod),
      item.status || "Paid",
      item.description || "-",
      item.notes || "-",
    ]);
    return { headers, rows };
  };

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      let fileData;

      try {
        fileData = await exportExpensesFormat({
          search: globalFilter,
          status: filters.status,
          category: filters.category,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        }, format);
        
        let mimeType = "text/csv;charset=utf-8;";
        if (format === "excel") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        else if (format === "pdf") mimeType = "application/pdf";

        downloadBlob(
          fileData,
          `expense-report-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`,
          mimeType,
        );
      } catch (err) {
        // Fallback to client-side generation
        const { headers, rows } = getExportData(expenses);
        
        if (format === "csv") {
          const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
          downloadBlob(csvContent, `expense-report-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
        } else if (format === "excel") {
          const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
          XLSX.writeFile(workbook, `expense-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
        } else if (format === "pdf") {
          const doc = new jsPDF("landscape");
          autoTable(doc, { head: [headers], body: rows });
          doc.save(`expense-report-${new Date().toISOString().slice(0, 10)}.pdf`);
        }
      }
    } catch (err) {
      toaster("Failed to export report", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Voucher PDF Action
  const handleDownloadVoucher = async (row) => {
    try {
      const pdf = await generateVoucherPdf(row);
      pdf.save(`payment-voucher-${row.id || "receipt"}.pdf`);
    } catch (err) {
      console.error(err);
      toaster("Failed to generate payment voucher PDF", "error");
    }
  };

  // File Upload Action

  // Attachment Download Action

  // Attachment Delete Action

  // Bulk Operations
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Swal.fire({
      title: "Delete Selected Expenses?",
      text: `Are you sure you want to delete ${selectedIds.length} selected expense records?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete all",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-popup rounded-2xl",
        confirmButton:
          "px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition",
        cancelButton:
          "px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        bulkDeleteMutation.mutate(selectedIds, {
          onSuccess: () => setSelectedIds([]),
        });
      }
    });
  };

  const handleBulkStatusUpdate = (status) => {
    if (selectedIds.length === 0) return;
    bulkStatusUpdateMutation.mutate(
      { ids: selectedIds, status },
      { onSuccess: () => setSelectedIds([]) }
    );
  };

  const [sorting, setSorting] = useState([]);

  const columns = useExpenseTableColumn({
    handleEdit: handleOpenEditModal,
    handleDelete: handleDeleteExpense,
    handleView: handleViewExpense,
    handleDownloadVoucher,
    canUpdate,
    canDelete,
    canView,
    selectedIds,
    handleSelectRow,
    handleSelectAll,
    expenses,
  });

  const table = useReactTable({
    data: expenses || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!canView) {
    return <div className="my-6 text-center text-gray-500">You do not have permission to view expenses.</div>;
  }

  return (
    <div className="space-y-6 pb-12 pt-6 px-4 sm:px-6">
      {/* Header & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            Expenses & Outgoing Payments
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
            title="Toggle Filter"
            className={`p-2.5 rounded-xl border text-xs font-semibold transition shadow-xs active:scale-95 ${
              showFilter || hasActiveFilters
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs active:scale-95"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isLoading || isFetching ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsExportPreviewModalOpen(true)}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            {isExporting ? "Exporting..." : "Export"}
          </button>

          {canManageCategories && (
            <Link
              href={isSuperAdmin ? "/accounts/master-categories?type=expense" : "/accounts/categories?type=expense"}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
            >
              <Tag className="w-4 h-4" />
              Manage Categories
            </Link>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Analytics & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Volume */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-800/40">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatAmount(summary.totalExpenses)}
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Count</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {summary.totalCount} Records
            </span>
          </div>
        </div>

        {/* Card 2: Paid Expenses */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Paid Amount
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatAmount(summary.paidAmount)}
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Cleared Payments</span>
            <span className="text-xs font-bold text-emerald-600">Settled</span>
          </div>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending Amount
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatAmount(summary.pendingAmount)}
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Awaiting Settlement</span>
            <span className="text-xs font-bold text-amber-600">Pending</span>
          </div>
        </div>

        {/* Card 4: Categories Breakdown */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-800/40">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {activeCategories.length} <span className="text-xs font-normal text-gray-400">types</span>
            </h3>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
            <Link
              href={isSuperAdmin ? "/accounts/master-categories?type=expense" : "/accounts/categories?type=expense"}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              Manage Categories <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* DataFilter Component */}
      <DataFilter
        showFilter={showFilter}
        filters={filterValues}
        onFilterChange={onFilterChange}
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
            <span className="text-[11px] text-slate-400 dark:text-gray-400">Bulk Status:</span>
            <button
              type="button"
              onClick={() => handleBulkStatusUpdate("paid")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition active:scale-95 cursor-pointer"
            >
              Mark Paid
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusUpdate("pending")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-sm transition active:scale-95 cursor-pointer"
            >
              Mark Pending
            </button>
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
          { key: "all", label: "All Expenses", count: statusCounts.all },
          { key: "paid", label: "Paid", count: statusCounts.paid },
          { key: "pending", label: "Pending", count: statusCounts.pending },
          { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleFilterChange("status", tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filters.status === tab.key
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

      {/* Main Expense Table */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading expense records from server...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40 shadow-xs">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {hasActiveFilters ? "No Matching Expenses Found" : "No Expense Records"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {hasActiveFilters
                  ? "Try adjusting your search terms, date range, or status filters."
                  : "Start tracking business operating costs by adding your first expense."}
              </p>
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Reset Filters
              </button>
            ) : (
              canCreate && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add First Expense
                </button>
              )
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <CommonTable
              table={table}
              isFetching={isLoading}
              itemsPerPage={limit}
              columns={columns}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Pagination */}
        {paginationData.total > 0 && (
          <div className="p-4 border-t border-gray-200/80 dark:border-gray-800 flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalItems={paginationData.total}
              itemsPerPage={limit}
              onPageChange={(page) => setCurrentPage(page)}
              onItemsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Expense */}
      <ModalTw
        show={isFormModalOpen}
        showFooter={false}
        onClose={handleClose}
        title={editingId ? "Edit Expense" : "Add Expense"}
        size="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <SelectSearch
                label={
                  <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </span>
                }
                value={formValues.category}
                onChange={(val) => handleInputChange({ target: { name: 'category', value: val } })}
                options={activeCategories.map((cat) => ({
                  label: `${cat.name} ${cat.source === "master" ? "(Default)" : ""}`.trim(),
                  value: cat.name,
                }))}
              />
            </div>

            <Input
              label={
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Amount <span className="text-rose-500">*</span>
                </span>
              }
              type="number"
              step="0.01"
              name="amount"
              required
              value={formValues.amount}
              onChange={(val) => handleInputChange({ target: { name: 'amount', value: val } })}
              placeholder="25000.00"
              className="w-full text-xs"
            />

            <div>
              <SelectSearch
                label={
                  <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </span>
                }
                value={formValues.currency}
                onChange={(val) => handleInputChange({ target: { name: 'currency', value: val } })}
                options={[
                  { label: "BDT (Tk)", value: "BDT" },
                  { label: "USD ($)", value: "USD" },
                ]}
              />
            </div>

            <div>
              <DatePicker
                label={
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Expense Date <span className="text-rose-500">*</span>
                  </span>
                }
                name="expenseDate"
                value={formValues.expenseDate}
                onChange={(dateStr) =>
                  setFormValues((prev) => ({ ...prev, expenseDate: dateStr || "" }))
                }
                placeholder="Select Expense Date"
                compact
              />
            </div>

            <div>
              <Input
                label={
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Vendor / Payee
                  </span>
                }
                type="text"
                name="vendor"
                list="vendor-suggestions"
                value={formValues.vendor}
                onChange={(val) => handleInputChange({ target: { name: 'vendor', value: val } })}
                placeholder="Building Owner / Supplier"
                className="w-full text-xs"
                autoComplete="off"
              />
              <datalist id="vendor-suggestions">
                {uniqueVendors.map((vendorName, idx) => (
                  <option key={idx} value={vendorName} />
                ))}
              </datalist>
            </div>

            <div>
              <SelectSearch
                label={
                  <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </span>
                }
                value={formValues.paymentMethod}
                onChange={(val) => handleInputChange({ target: { name: 'paymentMethod', value: val } })}
                options={[
                  { label: "Bank Transfer", value: "bank_transfer" },
                  { label: "Mobile Payment (bKash/Nagad)", value: "mobile_payment" },
                  { label: "Cash", value: "cash" },
                  { label: "Card Payment", value: "card" },
                  { label: "Cheque", value: "cheque" },
                ]}
              />
            </div>

            <Input
              label={
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Reference / Voucher #
                </span>
              }
              type="text"
              name="reference"
              value={formValues.reference}
              onChange={(val) => handleInputChange({ target: { name: 'reference', value: val } })}
              placeholder="e.g. RENT-SEP-2026"
              className="w-full text-xs"
            />

            <div>
              <SelectSearch
                label={
                  <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </span>
                }
                value={formValues.status}
                onChange={(val) => handleInputChange({ target: { name: 'status', value: val } })}
                options={[
                  { label: "Paid", value: "paid" },
                  { label: "Pending", value: "pending" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            </div>
          </div>

          <Input
            label={
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Description
              </span>
            }
            type="text"
            name="description"
            value={formValues.description}
            onChange={(val) => handleInputChange({ target: { name: 'description', value: val } })}
            placeholder="e.g. Monthly office rent payment"
            className="w-full text-xs"
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Notes / Additional Info
            </label>
            <textarea
              rows={2}
              name="notes"
              value={formValues.notes}
              onChange={handleInputChange}
              placeholder="e.g. Paid via City Bank transfer"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>


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

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingId
                ? "Update Expense"
                : "Create Expense"}
            </button>
          </div>
        </form>
      </ModalTw>

      {/* Modal: View Expense Modal */}
      <ModalTw
        show={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Expense Details"
        showFooter={false}
      >
        {viewingExpense && (
          <div className="p-1 space-y-4 text-sm text-gray-800 dark:text-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Expense #</span>
                <span className="font-medium">{viewingExpense.expenseNumber || `EXP-${viewingExpense.id || viewingExpense._id}`}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Vendor / Payee</span>
                <span className="font-medium">{viewingExpense.vendor || "-"}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Category</span>
                <span className="font-medium">{viewingExpense.category}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Date</span>
                <span className="font-medium">
                  {viewingExpense.expenseDate || viewingExpense.expense_date || viewingExpense.createdAt ? formatDateWithDay(viewingExpense.expenseDate || viewingExpense.expense_date || viewingExpense.createdAt) : "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Amount</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatAmount(viewingExpense.amount, viewingExpense.currency)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Payment Method</span>
                <span className="font-medium">{formatPaymentMethod(viewingExpense.paymentMethod)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block text-xs">Status</span>
                <Badge
                  className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeClasses(viewingExpense.status)}`}
                >
                  {viewingExpense.status}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-500 block text-xs">Reference</span>
                <span className="font-medium">{viewingExpense.reference || "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-500 block text-xs">Description</span>
                <span className="font-medium">{viewingExpense.description || "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-500 block text-xs">Notes</span>
                <span className="font-medium">{viewingExpense.notes || "-"}</span>
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

      {/* Modal: Export Expenses CSV Preview Modal */}
      <ExportPreviewModal
        isOpen={isExportPreviewModalOpen}
        onClose={() => setIsExportPreviewModalOpen(false)}
        type="expense"
        totalCount={rawExpenses?.length || expenses.length}
        filteredCount={expenses.length}
        totalAmount={expenses.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)}
        metrics={{
          paidCount: rawExpenses?.filter(i => String(i.status || "").toLowerCase() === "paid").length || 0,
          pendingCount: rawExpenses?.filter(i => String(i.status || "").toLowerCase() === "pending").length || 0,
          cancelledCount: rawExpenses?.filter(i => String(i.status || "").toLowerCase() === "cancelled").length || 0,
        }}
        activeCategories={activeCategories}
        
        statusFilter={filters.status}
        setStatusFilter={(val) => handleFilterChange("status", val)}
        categoryFilter={filters.category}
        setCategoryFilter={(val) => handleFilterChange("category", val)}
        fromDate={filters.fromDate}
        setFromDate={(val) => handleFilterChange("fromDate", val)}
        toDate={filters.toDate}
        setToDate={(val) => handleFilterChange("toDate", val)}
        searchTerm={globalFilter}
        setSearchTerm={(val) => handleFilterChange("search", val)}
        
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        isExporting={isExporting}
        onExport={handleExport}
        
        columns={[
          "Ref / #",
          "Category",
          "Vendor / Payee",
          "Expense Date",
          "Payment Method",
          "Description",
          "Notes",
          { label: "Amount", align: "right" },
          { label: "Status", align: "center" }
        ]}
        data={expenses}
        renderRow={(item) => (
          <TableRow key={item.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors">
            <TableCell className="px-4 py-2.5 font-bold text-gray-900 dark:text-white font-mono">{item.reference || `EXP-${item.id}`}</TableCell>
            <TableCell className="px-4 py-2.5 font-semibold text-gray-800 dark:text-gray-200">{item.category}</TableCell>
            <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.vendor || "N/A"}</TableCell>
            <TableCell className="px-4 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-400">{(item.expenseDate || item.expense_date || item.createdAt) ? formatDateWithDay(item.expenseDate || item.expense_date || item.createdAt) : "-"}</TableCell>
            <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{formatPaymentMethod(item.paymentMethod)}</TableCell>
            <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{item.description || "-"}</TableCell>
            <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{item.notes || "-"}</TableCell>
            <TableCell className="px-4 py-2.5 text-right font-black text-rose-600 dark:text-rose-400">{formatAmount(item.amount, item.currency)}</TableCell>
            <TableCell className="px-4 py-2.5 text-center">
              <Badge className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeClasses(item.status)}`}>
                {item.status}
              </Badge>
            </TableCell>
          </TableRow>
        )}
      />


    </div>
  );
}