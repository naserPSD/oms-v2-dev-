import React from "react";
import { ModalTw } from "@/components/common/ModalTw";
import { Download, Filter, Search } from "lucide-react";
import SelectSearch from "@/components/ui/SelectSearch";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
const formatAmount = (amount, currencyCode = "BDT") => {
  const symbol = currencyCode === "USD" ? "$" : "Tk";
  const num = Number(amount || 0);
  return `${symbol} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ExportPreviewModal({
  isOpen,
  onClose,
  type = "income",
  
  // Summary Data
  totalCount = 0,
  filteredCount = 0,
  totalAmount = 0,
  metrics = {},
  activeCategories = [],
  
  // Filters (optional: if undefined, filter won't render)
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  searchTerm,
  setSearchTerm,
  
  // Export
  isExporting,
  onExport,
  
  // Table Preview
  columns = [],
  data = [],
  renderRow,
}) {
  const [exportFormat, setExportFormat] = React.useState("csv");

  const isIncome = type === "income";
  const isExpense = type === "expense";
  const isReport = type === "report";

  // Dynamic Styles
  const themeStyles = {
    income: {
      bgGradient: "from-blue-600/10 via-indigo-600/5 to-purple-600/10 dark:from-blue-950/70 dark:via-indigo-950/50 dark:to-purple-950/50",
      border: "border-blue-500/20 dark:border-blue-700/40",
      dot: "bg-blue-600",
      textPrimary: "text-blue-600 dark:text-blue-400",
      bgPrimary: "bg-blue-600",
      buttonGradient: "from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/25",
    },
    expense: {
      bgGradient: "from-amber-600/10 via-orange-600/5 to-red-600/10 dark:from-amber-950/70 dark:via-orange-950/50 dark:to-red-950/50",
      border: "border-amber-500/20 dark:border-amber-700/40",
      dot: "bg-amber-600",
      textPrimary: "text-amber-600 dark:text-amber-400",
      bgPrimary: "bg-amber-600",
      buttonGradient: "from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 shadow-amber-500/25",
    },
    report: {
      bgGradient: "from-purple-600/10 via-fuchsia-600/5 to-pink-600/10 dark:from-purple-950/70 dark:via-fuchsia-950/50 dark:to-pink-950/50",
      border: "border-purple-500/20 dark:border-purple-700/40",
      dot: "bg-purple-600",
      textPrimary: "text-purple-600 dark:text-purple-400",
      bgPrimary: "bg-purple-600",
      buttonGradient: "from-purple-600 via-fuchsia-600 to-purple-700 hover:from-purple-700 hover:to-fuchsia-800 shadow-purple-500/25",
    }
  };

  const theme = themeStyles[type] || themeStyles.income;

  const hasFilters = statusFilter !== undefined || categoryFilter !== undefined || fromDate !== undefined || toDate !== undefined || searchTerm !== undefined;

  const handleResetFilters = () => {
    if (setStatusFilter) setStatusFilter("all");
    if (setCategoryFilter) setCategoryFilter("all");
    if (setFromDate) setFromDate("");
    if (setToDate) setToDate("");
    if (setSearchTerm) setSearchTerm("");
  };

  const hasActiveFilters = 
    (statusFilter && statusFilter !== "all") || 
    (categoryFilter && categoryFilter !== "all") || 
    !!fromDate || 
    !!toDate || 
    !!searchTerm;

  return (
    <ModalTw
      show={isOpen}
      onClose={onClose}
      title="Export Preview"
      size="5xl"
      showFooter={false}
    >
      <div className="space-y-4 pt-1">
        {/* Header Summary Banner */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${theme.bgGradient} border ${theme.border} flex flex-wrap items-center justify-between gap-4 shadow-sm`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${theme.dot} animate-ping`} />
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                Report Export Summary
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Ready to export{" "}
              <strong className={theme.textPrimary}>
                {filteredCount}
              </strong>{" "}
              records matching your active filters.
            </p>
          </div>
          {totalAmount > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Export Total
                </span>
                <span className={`font-black ${theme.textPrimary} text-base`}>
                  {formatAmount(totalAmount)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Export Format Selector */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Download className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
              Select Export Format
            </span>
          </div>
          <div className="flex gap-4">
            {["csv", "excel", "pdf"].map((fmt) => (
              <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="exportFormat" 
                  value={fmt} 
                  checked={exportFormat === fmt} 
                  onChange={(e) => setExportFormat(e.target.value)} 
                  className={`w-4 h-4 ${theme.textPrimary} border-gray-300 focus:ring-blue-500`}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 uppercase font-semibold">{fmt}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Live Filter Controls inside Preview Modal */}
        {hasFilters && (
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Filter className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
                Customize Export Filters
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`text-[11px] font-semibold ${theme.textPrimary} hover:underline`}
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {/* Status Selector */}
              {statusFilter !== undefined && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Status
                  </label>
                  <SelectSearch
                    label={false}
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    inputClassName="h-[38px] rounded-xl flex items-center text-xs"
                    options={[
                      { label: `All Statuses (${totalCount})`, value: "all" },
                      ...(metrics.receivedCount !== undefined ? [{ label: `Received (${metrics.receivedCount})`, value: "received" }] : []),
                      ...(metrics.paidCount !== undefined ? [{ label: `Paid (${metrics.paidCount})`, value: "paid" }] : []),
                      ...(metrics.pendingCount !== undefined ? [{ label: `Pending (${metrics.pendingCount})`, value: "pending" }] : []),
                      ...(metrics.cancelledCount !== undefined ? [{ label: `Cancelled (${metrics.cancelledCount})`, value: "cancelled" }] : []),
                    ]}
                  />
                </div>
              )}

              {/* Category Selector */}
              {categoryFilter !== undefined && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Category
                  </label>
                  <SelectSearch
                    label={false}
                    value={categoryFilter}
                    onChange={(val) => setCategoryFilter(val)}
                    inputClassName="h-[38px] rounded-xl flex items-center text-xs"
                    options={[
                      { label: "All Categories", value: "all" },
                      ...activeCategories.map((cat) => {
                        const catName = typeof cat === "object" ? cat.name : cat;
                        const catSource = typeof cat === "object" ? cat.source : "";
                        return {
                          label: `${catName} ${catSource === "master" ? "(Default)" : ""}`.trim(),
                          value: catName,
                        };
                      }),
                    ]}
                  />
                </div>
              )}

              {/* Date Range Picker */}
              {fromDate !== undefined && toDate !== undefined && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Date Range
                  </label>
                  <DatePicker
                    mode="range"
                    placeholder="Select dates"
                    inputClassName="h-[38px] rounded-xl text-xs"
                    value={[fromDate, toDate].filter(Boolean)}
                    onChange={(range) => {
                      if (Array.isArray(range) && range.length === 2 && range[0] && range[1]) {
                        setFromDate(range[0]);
                        setToDate(range[1]);
                      } else if (Array.isArray(range) && range.length === 0) {
                        setFromDate("");
                        setToDate("");
                      }
                    }}
                    clearable
                    compact
                  />
                </div>
              )}

              {/* Search Query */}
              {searchTerm !== undefined && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Search Filter
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search query..."
                      className="w-full pl-8 pr-3 h-[38px] rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Preview */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm max-h-72 overflow-y-auto">
          <Table className="w-full text-left border-collapse text-xs">
            <TableHeader className="sticky top-0 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i} className={`px-4 py-3 ${col.align ? `text-${col.align}` : ''}`}>
                    {typeof col === 'string' ? col : col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {data.slice(0, 10).map((item, index) => renderRow(item, index))}
              
              {data.length > 10 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 bg-gray-50/60 dark:bg-gray-800/30 font-medium italic"
                  >
                    + {data.length - 10} additional matching rows
                    will be included in the export.
                  </TableCell>
                </TableRow>
              )}
              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 font-medium italic"
                  >
                    No records found matching these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
          <span className="text-[11px] text-gray-400 font-medium">
            Format:{" "}
            <strong className="text-gray-600 dark:text-gray-300 uppercase">
              {exportFormat} (UTF-8)
            </strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                onClose();
                if (onExport) await onExport(exportFormat);
              }}
              disabled={isExporting || data.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${theme.buttonGradient} text-white font-bold text-xs transition-all disabled:opacity-50 active:scale-95`}
            >
              <Download className="w-4 h-4" />
              Confirm & Download
            </button>
          </div>
        </div>
      </div>
    </ModalTw>
  );
}
