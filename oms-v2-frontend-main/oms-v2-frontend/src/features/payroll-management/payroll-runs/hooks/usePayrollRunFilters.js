// src/features/payroll/salary-structures/hooks/usePayrollRunFilters.js
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const usePayrollRunFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  // const initialSearch = searchParams.get("search") || "";
  const initialSearch = searchParams.get("payPeriodYear") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    // search: initialSearch,
    payPeriodYear: searchParams.get("payPeriodYear") || "",
    payPeriodMonth: searchParams.get("payPeriodMonth") || "",
    paymentStatusId: searchParams.get("paymentStatusId") || "",
    paymentDate: searchParams.get("paymentDate") || "",
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  // 🔸 Check active filters
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null
    );
  }, [filters]);

  // 🔸 Debounced search updater
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    []
  );

  // 🔸 Filter change handler
  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        setGlobalFilter(value);
        debouncedUpdateSearch(value);
      } else {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
      }
    },
    [debouncedUpdateSearch]
  );

  // 🔸 Clear all filters
  const clearAllFilters = useCallback(() => {
    debouncedUpdateSearch.cancel();
    setFilters({
      search: "",
      payPeriodYear: "",
      payPeriodMonth: "",
      paymentStatusId: "",
      paymentDate: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // URL reset
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("payPeriodYear");
    params.delete("payPeriodMonth");
    params.delete("paymentStatusId");
    params.delete("paymentDate");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    if (filters.payPeriodYear) params.set("payPeriodYear", filters.payPeriodYear);
    else params.delete("payPeriodYear");

    if (filters.paymentStatusId) params.set("paymentStatusId", filters.paymentStatusId);
    else params.delete("paymentStatusId");

    if (filters.payPeriodMonth) params.set("payPeriodMonth", filters.payPeriodMonth);
    else params.delete("payPeriodMonth");

    if (filters.paymentDate)
      params.set("paymentDate", filters.paymentDate);
    else params.delete("paymentDate");

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup
  useEffect(() => {
    return () => debouncedUpdateSearch.cancel();
  }, [debouncedUpdateSearch]);

  // 🔸 Build query params for API
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.payPeriodYear) params.payPeriodYear = filters.payPeriodYear;
    if (filters.payPeriodMonth) params.payPeriodMonth = filters.payPeriodMonth;
    if (filters.paymentStatusId) params.paymentStatusId = filters.paymentStatusId;
    if (filters.paymentDate) params.paymentDate = filters.paymentDate;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  return {
    filters,
    globalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
    setGlobalFilter,
  };
};
