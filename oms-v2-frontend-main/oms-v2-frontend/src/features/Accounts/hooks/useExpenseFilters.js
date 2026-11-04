"use client";

import { useState, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";

export const useExpenseFilters = (itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(itemsPerPage);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    fromDate: "",
    toDate: "",
  });

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    []
  );

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

  const clearAllFilters = useCallback(() => {
    setGlobalFilter("");
    setFilters({
      search: "",
      status: "all",
      category: "all",
      fromDate: "",
      toDate: "",
    });
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.search ||
      (filters.status && filters.status !== "all") ||
      (filters.category && filters.category !== "all") ||
      !!filters.fromDate ||
      !!filters.toDate
    );
  }, [filters]);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && filters.status !== "all" && { status: filters.status }),
      ...(filters.category && filters.category !== "all" && { category: filters.category }),
      ...(filters.fromDate && { fromDate: filters.fromDate }),
      ...(filters.toDate && { toDate: filters.toDate }),
    }),
    [currentPage, limit, filters]
  );

  return {
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    globalFilter,
    setGlobalFilter,
    filters,
    setFilters,
    handleFilterChange,
    clearAllFilters,
    hasActiveFilters,
    queryParams,
  };
};
