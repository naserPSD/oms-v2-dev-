"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useJobApplicantFilters = (itemsPerPage, jobId) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  /* ── initial values from URL ── */
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  /* ── states ── */
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: initialSearch,
    officeId: searchParams.get("officeId") || "",
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  /* ── active filters check ── */
  const hasActiveFilters = useMemo(
    () =>
      Object.values(filters).some(
        (v) => v !== "" && v !== undefined && v !== null,
      ),
    [filters],
  );

  /* ── debounced search ── */
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  /* ── filter change handler ── */
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

  /* ── clear all filters ── */
  const clearAllFilters = useCallback(() => {
    debouncedUpdateSearch.cancel();

    setFilters({ search: "", officeId: "" });
    setGlobalFilter("");
    setCurrentPage(1);

    const currentTab = searchParams.get("tab");

    // ❗ only all-applicants এ কাজ করবে
    if (currentTab !== "all-applicants") return;

    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("officeId");

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedUpdateSearch, itemsPerPage, searchParams, router]);
  /* ── URL sync ── */
  useEffect(() => {
    const currentTab = searchParams.get("tab");

    // ❗ IMPORTANT: only run for all-applicants tab
    if (currentTab !== "all-applicants") return;

    const params = new URLSearchParams(searchParams.toString());

    // pagination
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    // filters
    if (filters.search) params.set("search", filters.search);
    else params.delete("search");

    if (filters.officeId) params.set("officeId", filters.officeId);
    else params.delete("officeId");

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPage, itemsPerPage, filters]);

  /* ── cleanup debounce ── */
  useEffect(() => {
    return () => debouncedUpdateSearch.cancel();
  }, [debouncedUpdateSearch]);

  /* ── build query params for API ── */
  const queryParams = useMemo(() => {
    const p = {
      page: currentPage,
      limit: itemsPerPage,
      jobVacancyId: Number(jobId),
    };

    if (filters.search) p.search = filters.search;
    if (filters.officeId) p.officeId = filters.officeId;

    return p;
  }, [currentPage, itemsPerPage, filters, jobId]);

  return {
    filters,
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
