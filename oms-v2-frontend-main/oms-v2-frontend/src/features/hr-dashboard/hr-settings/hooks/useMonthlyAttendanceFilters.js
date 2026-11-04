// hooks/useMonthlyAttendanceFilters.js
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useMonthlyAttendanceFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: initialSearch,
    officeId: searchParams.get("officeId") || "",
    designationId: searchParams.get("designationId") || "",
    departmentId: searchParams.get("departmentId") || "",
    attendanceDates: searchParams.get("attendanceDates") || "",
    // month: searchParams.get("month") || new Date().toISOString().slice(0, 7),
    month: searchParams.get("month") || new Date().getMonth() + 1
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);


  // 🔸 Check active filters
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null
    );
  }, [filters]);


  // 🔸 Build query params for API
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;

    if (filters.officeId) params.officeId = filters.officeId;
    if (filters.designationId) params.designationId = filters.designationId;
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.attendanceDates) params.attendanceDates = filters.attendanceDates;
    if (filters.month) params.month = filters.month;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // 🔸 Debounced search updater
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        // This runs AFTER the user stops typing (e.g., 500ms)
        // This is what updates the API query params.
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    []
  );

  // 🔸 Filter change handler
  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        // 1. IMMEDIATE: Update globalFilter for client-side table filtering
        setGlobalFilter(value);

        // 2. DEBOUNCED: Trigger the API search update
        debouncedUpdateSearch(value);
      } else {
        // For other API filters, update immediately
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
      officeId: "",
      designationId: "",
      departmentId: "",
      attendanceDates: "",
      month: new Date().getMonth() + 1
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // URL reset
    // Clear URL params as well
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);

  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change
  useEffect(() => {
    // const params = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    params.set("tab", "monthly-report");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    if (filters.officeId) params.set("officeId", filters.officeId);
    if (filters.designationId) params.set("designationId", filters.designationId);
    if (filters.departmentId) params.set("departmentId", filters.departmentId);
    if (filters.attendanceDates) params.set("attendanceDates", filters.attendanceDates);
    if (filters.month) params.set("month", filters.month);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  // useEffect(() => {
  //   return () => debouncedUpdateSearch.cancel();
  // }, [debouncedUpdateSearch]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  return {
    queryParams,
    filters,
    globalFilter,
    setGlobalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
  };
};
