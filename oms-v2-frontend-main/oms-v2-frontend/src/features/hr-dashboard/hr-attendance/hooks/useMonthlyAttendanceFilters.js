// hooks/useMonthlyAttendanceFilters.js
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useMonthlyAttendanceFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rawMonthParam = searchParams.get("month");
  const initialMonth = rawMonthParam
    ? rawMonthParam.includes("-")
      ? rawMonthParam
      : `${now.getFullYear()}-${String(rawMonthParam).padStart(2, "0")}`
    : currentMonthValue;

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
    month: initialMonth,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  // 🔸 Check active filters (excluding default current month)
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "month") {
        return value && value !== currentMonthValue;
      }
      return value !== "" && value !== undefined && value !== null;
    });
  }, [filters, currentMonthValue]);

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
    params.month = filters.month || currentMonthValue;

    return params;
  }, [currentPage, itemsPerPage, filters, currentMonthValue]);

  // 🔸 Debounced search updater
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
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
    [debouncedUpdateSearch],
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
      month: currentMonthValue,
    });
    setCurrentPage(1);
    setGlobalFilter("");

    const params = new URLSearchParams(window.location.search);
    params.set("tab", "monthly-report");
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.set("month", currentMonthValue);
    params.delete("search");
    params.delete("officeId");
    params.delete("designationId");
    params.delete("departmentId");
    params.delete("attendanceDates");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage, currentMonthValue]);

  // 🔸 Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "monthly-report");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    if (filters.officeId) params.set("officeId", filters.officeId);
    else params.delete("officeId");

    if (filters.designationId) params.set("designationId", filters.designationId);
    else params.delete("designationId");

    if (filters.departmentId) params.set("departmentId", filters.departmentId);
    else params.delete("departmentId");

    if (filters.attendanceDates) params.set("attendanceDates", filters.attendanceDates);
    else params.delete("attendanceDates");

    if (filters.month) params.set("month", filters.month);
    else params.set("month", currentMonthValue);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters, currentMonthValue]);

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

export default useMonthlyAttendanceFilters;
