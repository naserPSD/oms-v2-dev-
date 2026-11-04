"use client";

import Pagination from "@/components/common/Pagination";

export default function PaymentHistoryPagination({
  page,
  limit,
  pagination,
  onPageChange,
  onLimitChange,
}) {
  return (
    <Pagination
      currentPage={page}
      totalItems={pagination?.total || 0}
      resultRows={pagination?.resultRows || 0}
      itemsPerPage={limit}
      onPageChange={onPageChange}
      onItemsPerPageChange={onLimitChange}
    />
  );
}