import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useWeekendsFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: initialSearch,
    status: searchParams.get("status") || "",
    officeId: searchParams.get("officeId") || "",
    departmentId: searchParams.get("departmentId") || "",
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
      status: "",
      officeId: "",

      departmentId: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // URL reset
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("officeId");
    params.delete("departmentId");

    params.delete("status");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    if (filters.officeId) params.set("officeId", filters.officeId);
    else params.delete("officeId");

    if (filters.departmentId) params.set("departmentId", filters.departmentId);
    else params.delete("departmentId");

    if (filters.status) params.set("status", filters.status);
    else params.delete("status");

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
    if (filters.status) params.status = filters.status;
    if (filters.officeId) params.officeId = filters.officeId;

    if (filters.departmentId) params.departmentId = filters.departmentId;

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
