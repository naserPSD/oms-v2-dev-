import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useHrPendingAttendanceFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";
  const initialDate =
    searchParams.get("attendanceDate") ||
    new Date().toISOString().split("T")[0];

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: initialSearch,
    officeId: searchParams.get("officeId") || "",
    designationId: searchParams.get("designationId") || "",
    departmentId: searchParams.get("departmentId") || "",
    attendanceDate: initialDate,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  // 🔸 Check active filters (excluding default attendanceDate)
  const hasActiveFilters = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return Object.entries(filters).some(([key, value]) => {
      if (key === "attendanceDate") {
        return value && value !== today;
      }
      return value !== "" && value !== undefined && value !== null;
    });
  }, [filters]);

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
    const today = new Date().toISOString().split("T")[0];
    setFilters({
      search: "",
      officeId: "",
      designationId: "",
      departmentId: "",
      attendanceDate: today,
    });
    setCurrentPage(1);
    setGlobalFilter("");

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") || "pending-attendance";
    params.clear();
    params.set("tab", tab);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.set("attendanceDate", today);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when anything changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "pending-attendance");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) {
      params.set("search", filters.search);
    } else {
      params.delete("search");
    }
    if (filters.officeId) {
      params.set("officeId", filters.officeId);
    } else {
      params.delete("officeId");
    }
    if (filters.designationId) {
      params.set("designationId", filters.designationId);
    } else {
      params.delete("designationId");
    }
    if (filters.departmentId) {
      params.set("departmentId", filters.departmentId);
    } else {
      params.delete("departmentId");
    }
    if (filters.attendanceDate) {
      params.set("attendanceDate", filters.attendanceDate);
    } else {
      params.delete("attendanceDate");
    }

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [filters, currentPage, itemsPerPage]);

  // 🔸 Query params for API
  const queryParams = useMemo(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== "" && v !== undefined && v !== null,
      ),
    );

    return {
      page: currentPage,
      limit: itemsPerPage,
      ...cleanFilters,
    };
  }, [filters, currentPage, itemsPerPage]);

  return {
    filters,
    setFilters,
    globalFilter,
    setGlobalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
  };
};
export default useHrPendingAttendanceFilters;
