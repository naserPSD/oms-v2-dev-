import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useOfficeHolidayFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: initialSearch,
    holidayTypeId: searchParams.get("holidayTypeId") || "",
    holidayDates: searchParams.get("holidayDates") || "",
    holidayYear: searchParams.get("holidayYear") || "",
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
      holidayTypeId: "",
      holidayDates: "",
      holidayYear: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // URL reset
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("holidayTypeId");
    params.delete("holidayDates");
    params.delete("holidayYear");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    if (filters.holidayTypeId) params.set("holidayTypeId", filters.holidayTypeId);
    else params.delete("holidayTypeId");

    if (filters.holidayDates) params.set("holidayDates", filters.holidayDates);
    else params.delete("holidayDates");

    if (filters.holidayYear) params.set("holidayYear", filters.holidayYear);
    else params.delete("holidayYear");

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
    if (filters.holidayTypeId) params.holidayTypeId = filters.holidayTypeId;
    if (filters.holidayDates) params.holidayDates = filters.holidayDates;
    if (filters.holidayYear) params.holidayYear = filters.holidayYear;

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
