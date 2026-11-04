import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useRequisitionsListFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    statusId: searchParams.get("statusId") || "",
    officeId: searchParams.get("officeId") || "",

    departmentId: searchParams.get("departmentId") || "",
    requisitionDate: searchParams.get("requisitionDate") || "",
    approvedDate: searchParams.get("approvedDate") || "",
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
      statusId: "",
      officeId: "",
      departmentId: "",
      requisitionDate: "",
      approvedDate: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("officeId");
    params.delete("departmentId");
    params.delete("requisitionDate");
    params.delete("approvedDate");
    params.delete("statusId");

    // Preserve tab param for this tab
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.statusId) {
      params.set("statusId", filters.statusId);
    }
    if (filters.officeId) {
      params.set("officeId", filters.officeId);
    }
    if (filters.departmentId) {
      params.set("departmentId", filters.departmentId);
    }
    if (filters.requisitionDate) {
      params.set("requisitionDate", filters.requisitionDate);
    }
    if (filters.approvedDate) {
      params.set("approvedDate", filters.approvedDate);
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
    if (filters.statusId) params.statusId = filters.statusId;
    if (filters.officeId) params.officeId = filters.officeId;
    if (filters.departmentId) params.departmentId = filters.departmentId;
    if (filters.requisitionDate)
      params.requisitionDate = filters.requisitionDate;
    if (filters.approvedDate) params.approvedDate = filters.approvedDate;

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
