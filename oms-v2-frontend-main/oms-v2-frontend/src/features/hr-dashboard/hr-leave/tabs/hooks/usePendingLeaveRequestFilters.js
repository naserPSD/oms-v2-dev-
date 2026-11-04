import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

const currentYear = String(new Date().getFullYear());

export const usePendingLeaveRequestFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    year: searchParams.get("year") || currentYear,
    // statusId: searchParams.get("statusId") || "",
    designationId: searchParams.get("designationId") || "",
    // approvalDate: searchParams.get("approvalDate") || "",
    createdAt: searchParams.get("createdAt") || "",
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  // 🔸 Check active filters
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === "year" && String(value) === currentYear) return false;
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
    setFilters({
      search: "",
      year: currentYear,
      // statusId: "",
      designationId: "",
      // approvalDate: "",
      createdAt: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "leaveApplications");
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.set("year", currentYear);
    params.delete("designationId");
    // params.delete("approvalDate");
    params.delete("createdAt");
    // params.delete("statusId");

    // Preserve tab param for this tab
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "leaveApplications");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.year) {
      params.set("year", filters.year);
    } else {
      params.delete("year");
    }
    // if (filters.statusId) {
    //   params.set("statusId", filters.statusId);
    // }
    if (filters.designationId) {
      params.set("designationId", filters.designationId);
    }
    // if (filters.approvalDate) {
    //   params.set("approvalDate", filters.approvalDate);
    // }
    if (filters.createdAt) {
      params.set("createdAt", filters.createdAt);
    } else {
      params.delete("search");
    }

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup
  useEffect(() => {
    return () => debouncedUpdateSearch.cancel();
  }, [debouncedUpdateSearch]);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filters.search) params.search = filters.search;
    if (filters.year) params.year = filters.year;
    // if (filters.statusId) params.statusId = filters.statusId;
    if (filters.designationId) params.designationId = filters.designationId;
    // if (filters.approvalDate) params.approvalDate = filters.approvalDate;
    if (filters.createdAt) params.createdAt = filters.createdAt;

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
