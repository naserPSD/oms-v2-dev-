"use client";

import PaymentHistoryFilters from "./components/PaymentHistoryFilters";
import PaymentHistoryPagination from "./components/PaymentHistoryPagination";
import PaymentHistoryTable from "./components/PaymentHistoryTable";
import usePaymentHistory from "./hooks/usePaymentHistory";

export default function PaymentHistoryPage() {
  const paymentHistory = usePaymentHistory();

  return (
    <section className="py-5">
      <div className="mb-5">
        <h1 className="title-color text-xl font-bold">Payment History</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review subscription invoices and payment activity.</p>
      </div>
      <PaymentHistoryFilters
        search={paymentHistory.search}
        sort={paymentHistory.sort}
        invoiceNo={paymentHistory.invoiceNo}
        transactionId={paymentHistory.transactionId}
        paymentStatus={paymentHistory.paymentStatus}
        paymentDate={paymentHistory.paymentDate}
        onSearch={paymentHistory.setSearch}
        onSort={paymentHistory.setSort}
        onInvoiceNo={paymentHistory.setInvoiceNo}
        onTransactionId={paymentHistory.setTransactionId}
        onPaymentStatus={paymentHistory.setPaymentStatus}
        onPaymentDate={paymentHistory.setPaymentDate}
        onClearAll={paymentHistory.clearAllFilters}
        hasActiveFilters={paymentHistory.hasActiveFilters}
      />
      <div className="mt-4 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <PaymentHistoryTable
          data={paymentHistory.data}
          isLoading={paymentHistory.isLoading}
          error={paymentHistory.error}
          hasSearch={paymentHistory.hasActiveFilters}
        />
      </div>
      <PaymentHistoryPagination page={paymentHistory.page} limit={paymentHistory.limit} pagination={paymentHistory.pagination} onPageChange={paymentHistory.setPage} onLimitChange={paymentHistory.setLimit} />
    </section>
  );
}