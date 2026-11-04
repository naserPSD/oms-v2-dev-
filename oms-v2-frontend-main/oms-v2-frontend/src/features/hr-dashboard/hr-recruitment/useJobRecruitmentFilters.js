import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useJobRecruitmentFilters = (itemsPerPage) => {
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
    isAbsent: searchParams.get("isAbsent") || "",
    isActive: searchParams.get("isActive") || "",
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  // 🔸 Check active filters
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
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
      statusId: "",
      officeId: "",
      isAbsent: "",
      isActive: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // Clear URL params but preserve tab param
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab"); // Preserve tab param

    params.clear();
    if (tab) {
      params.set("tab", tab);
    }
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Only update filter-related params, preserve other params like 'tab'
    params.set("tab", "attendance-rules");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) {
      params.set("search", filters.search);
    } else {
      params.delete("search");
    }
    if (filters.statusId) {
      params.set("statusId", filters.statusId);
    } else {
      params.delete("statusId");
    }
    if (filters.officeId) {
      params.set("officeId", filters.officeId);
    } else {
      params.delete("officeId");
    }
    if (filters.isAbsent) {
      params.set("isAbsent", filters.isAbsent);
    } else {
      params.delete("isAbsent");
    }
    if (filters.isActive) {
      params.set("isActive", filters.isActive);
    } else {
      params.delete("isActive");
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
    if (filters.isAbsent) params.isAbsent = filters.isAbsent;
    if (filters.isActive) params.isActive = filters.isActive;

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
