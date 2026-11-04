import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useMyLeaveRequestFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: initialSearch,
    approvalStatusId: searchParams.get("approvalStatusId") || "",
    officeId: searchParams.get("officeId") || "",
    leaveTypeId: searchParams.get("leaveTypeId") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
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
      approvalStatusId: "",
      officeId: "",
      leaveTypeId: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // URL reset
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("officeId");
    params.delete("approvalStatusId");
    params.delete("leaveTypeId");
    params.delete("startDate");
    params.delete("endDate");

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

    if (filters.approvalStatusId)
      params.set("approvalStatusId", filters.approvalStatusId);
    else params.delete("approvalStatusId");

    if (filters.leaveTypeId) params.set("leaveTypeId", filters.leaveTypeId);
    else params.delete("leaveTypeId");

    if (filters.startDate) params.set("startDate", filters.startDate);
    else params.delete("startDate");

    if (filters.endDate) params.set("endDate", filters.endDate);
    else params.delete("endDate");
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
    if (filters.approvalStatusId)
      params.approvalStatusId = filters.approvalStatusId;
    if (filters.officeId) params.officeId = filters.officeId;

    if (filters.leaveTypeId) params.leaveTypeId = filters.leaveTypeId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
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
