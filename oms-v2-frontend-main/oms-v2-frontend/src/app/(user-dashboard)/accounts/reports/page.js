"use client";

import { useState, useRef } from "react";
import CommonTable from "@/components/common/CommonTable";
import { getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import AccountsPageShell from "@/features/Accounts/AccountsPageShell";
import DatePicker from "@/components/ui/DatePicker";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  FileText,
  PieChart,
  Download,
  Filter,
  
  
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

import { fetchAccountsDashboard } from "@/services/accountsApi";
import RestApi, { offlineHandler } from "@/utils/RestApi";
import { toaster } from "@/utils/helpers";
import ExportPreviewModal from "@/features/Accounts/components/ExportPreviewModal";
import { TableRow, TableCell } from "@/components/ui/table";

// --- Colors ---
const EXPENSE_COLORS = [
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#84cc16", // Lime
  "#6366f1", // Indigo
  "#f97316", // Orange
  "#d946ef", // Fuchsia
  "#0ea5e9", // Sky
  "#eab308", // Yellow
  "#ef4444", // Red
];
const STATUS_COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Emerald, Amber, Rose

const formatTakaAmount = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "-";

  const value = String(amount);
  if (value.includes("$")) return value.replaceAll("$", "৳");
  if (value.includes("৳") || value.includes("BDT")) return value;
  if (value.startsWith("+") || value.startsWith("-")) {
    return `${value[0]}৳${value.slice(1)}`;
  }
  return `৳${value}`;
};

export default function AccountsReportsPage() {
  const [dateRange, setDateRange] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isExportPreviewModalOpen, setIsExportPreviewModalOpen] = useState(false);
  
  const reportRef = useRef(null);

  // API expects startDate and endDate strings (e.g. "YYYY-MM-DD")
  // Our DatePicker in range mode sets dateRange as an array [startDate, endDate]
  const startDate = dateRange && dateRange.length > 0 ? dateRange[0] : null;
  const endDate = dateRange && dateRange.length > 1 ? dateRange[1] : null;

  // --- React Query for Dynamic Fetching ---
  const { data: apiResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ['accountsReport', startDate, endDate, categoryFilter],
    queryFn: () => fetchAccountsDashboard({ startDate, endDate, category: categoryFilter }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // --- Fetch Dynamic Categories ---
  const { data: categoriesData } = useQuery({
    queryKey: ['combinedExpenseCategories'],
    queryFn: () => offlineHandler.get(() => RestApi.get('/api/v1/accounts/categories/combined/expense?status=active&limit=1000')),
    staleTime: 5 * 60 * 1000,
  });

  const fetchedCategories = (() => {
    let data = categoriesData?.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.list)) return data.list;
    if (Array.isArray(data)) return data;
    return [];
  })();

  // Extract variables for cleaner JSX (assuming the backend wraps data in a 'data' field)
  const dashboardData = apiResponse?.data || apiResponse || {};
  const summary = dashboardData.summary || {};
  const trendData = dashboardData.trendData || [];
  const categoryData = dashboardData.categoryData || [];
  const invoiceStatusData = dashboardData.invoiceStatusData || [];
  const topExpenses = dashboardData.topExpenses || [];
  const recentTransactions = dashboardData.recentTransactions || [];

  // --- Export Functions ---
  const handleExportPDF = () => {
    
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.width;
      
      // 1. Add Logo
      // Since it's a client-side path, we can load it into an image or we can just fetch the image data.
      // For simplicity in jsPDF without async loading, if it's in public, we can create an Image element.
      const img = new Image();
      img.src = '/images/sanzio-logo.png';
      img.onload = () => {
        // Draw Logo
        doc.addImage(img, 'PNG', 14, 15, 40, 15);
        
        // 2. Report Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("Financial Report", pageWidth - 14, 22, { align: "right" });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const reportDate = new Date().toLocaleDateString();
        doc.text(`Date Generated: ${reportDate}`, pageWidth - 14, 28, { align: "right" });
        
        let startY = 40;
        
        // 3. Summary Section
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Financial Summary", 14, startY);
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        const income = formatTakaAmount(summary.totalIncome?.toLocaleString() || 0);
        const expense = formatTakaAmount(summary.totalExpense?.toLocaleString() || 0);
        const profit = formatTakaAmount(summary.netProfit?.toLocaleString() || 0);
        
        startY += 8;
        doc.text(`Total Income: ${income}`, 14, startY);
        doc.text(`Total Expense: ${expense}`, 80, startY);
        doc.text(`Net Profit: ${profit}`, 150, startY);
        
        startY += 15;
        
        // 4. Transactions Table
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Recent Transactions", 14, startY);
        
        import("jspdf-autotable").then((module) => {
          const autoTable = module.default;
          const tableData = recentTransactions.map(t => [
            t.date || "-", 
            t.type || "-", 
            t.category || "-", 
            formatTakaAmount(t.amount),
            t.status || "-"
          ]);
          
          autoTable(doc, {
            startY: startY + 5,
            head: [['Date', 'Type', 'Category', 'Amount', 'Status']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }, // Tailwind blue-600
            styles: { fontSize: 10, cellPadding: 4 },
          });
          
          doc.save("Financial_Report.pdf");
          toaster("PDF Report Generated successfully!", "success");
        });
      };
      
      img.onerror = () => {
        toaster("Failed to load logo for PDF.", "error");
      };
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toaster("Failed to generate PDF.", "error");
    }
  };

  const handleExportExcel = () => {
    if (!recentTransactions || recentTransactions.length === 0) {
      toaster("No recent transactions available to export.", "error");
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(recentTransactions);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, "Transactions_Report.xlsx");
      toaster("Excel Exported successfully!", "success");
    } catch (error) {
      console.error("Failed to export Excel:", error);
      toaster("Failed to generate Excel file.", "error");
    }
  };



  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
        cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-white">{row.original.id}</span>
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              type === 'Income' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
              type === 'Expense' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = String(row.original.amount ?? "");
          return (
            <span className={`font-semibold whitespace-nowrap ${
              amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' :
              amount.startsWith('-') ? 'text-rose-600 dark:text-rose-400' :
              'text-gray-900 dark:text-white'
            }`}>
              {formatTakaAmount(amount)}
            </span>
          );
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {status}
            </span>
          );
        }
      }
    ],
    []
  );

  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data: recentTransactions || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <AccountsPageShell title="Financial Reports" permission="accounts.report.view">
      
      {/* Header & Controls */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your incomes, expenses, and invoices.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            >
              <option>All Categories</option>
              {fetchedCategories.map((cat, index) => (
                <option key={`${cat._id || cat.id || cat.name}-${index}`} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="w-56">
            <DatePicker
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              mode="range"
              placeholder="Select Date Range"
              compact={true}
              clearable={true}
            />
          </div>

          {/* Export Button */}
          <div className="relative">
            <button 
              onClick={() => setIsExportPreviewModalOpen(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-3 text-lg font-medium text-gray-600 dark:text-gray-300">Loading Reports...</span>
        </div>
      ) : isError ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
          <p className="text-lg font-medium">Failed to load reports data.</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Try Again</button>
        </div>
      ) : (
        <div ref={reportRef} id="pdf-report-content" className="bg-transparent pb-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatTakaAmount(summary.totalIncome?.toLocaleString())}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="font-medium text-emerald-600 dark:text-emerald-500">+{summary.incomeGrowth}%</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expense</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatTakaAmount(summary.totalExpense?.toLocaleString())}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-500">
                  <ArrowDownRight className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="font-medium text-rose-600 dark:text-rose-500">+{summary.expenseGrowth}%</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatTakaAmount(summary.netProfit?.toLocaleString())}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="font-medium text-emerald-600 dark:text-emerald-500">+{summary.profitGrowth}%</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invoices</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{summary.pendingInvoicesCount}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{formatTakaAmount(summary.pendingInvoicesAmount?.toLocaleString())}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">awaiting payment</span>
              </div>
            </div>
          </div>

          {/* Charts & Top Expenses Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Income vs Expense Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Income vs Expense Trend</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatTakaAmount(value)} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} 
                      itemStyle={{ color: "#fff" }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Expense by Category */}
              <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Expense Distribution</h3>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} 
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={20} 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '12px' }}
                        formatter={(value) => <span className="text-gray-700 dark:text-gray-300 font-medium">{value}</span>}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Invoice Status */}
              <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Invoice Status</h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={invoiceStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                        {invoiceStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} 
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={20} 
                        iconType="circle" 
                        wrapperStyle={{ fontSize: '12px' }}
                        formatter={(value) => <span className="text-gray-700 dark:text-gray-300 font-medium">{value}</span>}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section Grid: Top Expenses & Recent Transactions */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Top Expenses List */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Top 5 Expenses</h3>
              <div className="space-y-4">
                {topExpenses.map((expense, index) => (
                  <div key={expense.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-500">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTakaAmount(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">View all</a>
              </div>
              
                            <div className="overflow-x-auto">
                <CommonTable
                  table={table}
                  isFetching={false}
                  itemsPerPage={recentTransactions.length || 5}
                  columns={columns}
                  hasActiveFilters={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Preview Modal */}
      <ExportPreviewModal
        isOpen={isExportPreviewModalOpen}
        onClose={() => setIsExportPreviewModalOpen(false)}
        type="report"
        totalCount={recentTransactions?.length || 0}
        filteredCount={recentTransactions?.length || 0}
        totalAmount={summary.totalIncome || 0}
        metrics={{}}
        activeCategories={[]}
        onExport={async (format) => {
          if (format === "pdf") {
            await handleExportPDF();
          } else if (format === "excel" || format === "csv") {
            await handleExportExcel();
          }
        }}
        columns={[
          { label: "Date", align: "left" },
          { label: "Type", align: "left" },
          { label: "Category", align: "left" },
          { label: "Amount", align: "left" },
          { label: "Status", align: "left" }
        ]}
        data={recentTransactions || []}
        renderRow={(item, index) => (
          <TableRow key={index} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
            <TableCell className="px-4 py-2.5 font-semibold text-gray-800 dark:text-gray-200">{item.date || "-"}</TableCell>
            <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.type || "-"}</TableCell>
            <TableCell className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.category || "-"}</TableCell>
            <TableCell className="px-4 py-2.5 font-bold text-gray-900 dark:text-white font-mono">{formatTakaAmount(item.amount)}</TableCell>
            <TableCell className="px-4 py-2.5 font-medium">{item.status || "-"}</TableCell>
          </TableRow>
        )}
      />
    </AccountsPageShell>
  );
}
