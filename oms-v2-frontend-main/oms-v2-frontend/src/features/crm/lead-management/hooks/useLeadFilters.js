import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

export const useLeadFilters = (itemsPerPage) => {
  const searchParams = useSearchParams();

  // 🔸 initial values from URL
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  // 🔸 states
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    name: searchParams.get("name") || "",
    company: searchParams.get("company") || "",
    leadSource: searchParams.get("leadSource") || "",
    dealValue: searchParams.get("dealValue") || "",
    contact: searchParams.get("contact") || "",
    accountManager: searchParams.get("accountManager") || "",
    leadStatus: searchParams.get("leadStatus") || "",
    assignedTo: searchParams.get("assignedTo") || "",
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  // 🔸 Sync filters when URL searchParams change
  useEffect(() => {
    const urlLeadStatus = searchParams.get("leadStatus") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlName = searchParams.get("name") || "";
    const urlCompany = searchParams.get("company") || "";
    const urlContact = searchParams.get("contact") || "";
    const urlLeadSource = searchParams.get("leadSource") || "";
    const urlAssignedTo = searchParams.get("assignedTo") || "";
    const urlAccountManager = searchParams.get("accountManager") || "";
    const urlDealValue = searchParams.get("dealValue") || "";
    const urlPage = parseInt(searchParams.get("page")) || 1;

    setFilters((prev) => {
      if (
        prev.leadStatus === urlLeadStatus &&
        prev.search === urlSearch &&
        prev.name === urlName &&
        prev.company === urlCompany &&
        prev.contact === urlContact &&
        prev.leadSource === urlLeadSource &&
        prev.assignedTo === urlAssignedTo &&
        prev.accountManager === urlAccountManager &&
        prev.dealValue === urlDealValue
      ) {
        return prev;
      }
      return {
        ...prev,
        leadStatus: urlLeadStatus,
        search: urlSearch,
        name: urlName,
        company: urlCompany,
        contact: urlContact,
        leadSource: urlLeadSource,
        assignedTo: urlAssignedTo,
        accountManager: urlAccountManager,
        dealValue: urlDealValue,
      };
    });

    if (urlSearch) {
      setGlobalFilter(urlSearch);
    }
    setCurrentPage((prev) => (prev !== urlPage ? urlPage : prev));
  }, [searchParams]);

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
      name: "",
      company: "",
      leadSource: "",
      dealValue: "",
      contact: "",
      accountManager: "",
      leadStatus: "",
      assignedTo: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // Clear URL params as well (only on client)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set("page", "1");
      params.set("limit", itemsPerPage.toString());
      params.delete("search");
      params.delete("name");
      params.delete("company");
      params.delete("leadSource");
      params.delete("dealValue");
      params.delete("contact");
      params.delete("accountManager");
      params.delete("leadStatus");
      params.delete("assignedTo");

      // Preserve tab param for this tab
      window.history.replaceState(null, "", `?${params.toString()}`);
    }
  }, [debouncedUpdateSearch, itemsPerPage]);

  // 🔸 Update URL when filters change (only on client)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    // Update all filter params
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.set(key, filters[key]);
      } else {
        params.delete(key);
      }
    });

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

    // Combine search terms - backend searches name, contactName, contactEmail, contactPhone
    const searchTerms = [];
    if (filters.search) searchTerms.push(filters.search);
    if (filters.name) searchTerms.push(filters.name);
    if (filters.company) searchTerms.push(filters.company);
    if (filters.contact) searchTerms.push(filters.contact);

    // Combine all search terms
    if (searchTerms.length > 0) {
      params.search = searchTerms.join(" ");
    }

    // Apply other filters
    if (filters.leadSource) params.leadSource = filters.leadSource;
    if (filters.leadStatus) params.leadStatus = filters.leadStatus;
    if (filters.assignedTo) params.assignedTo = filters.assignedTo;
    // accountManager maps to assignedTo
    if (filters.accountManager) params.assignedTo = filters.accountManager;

    // Note: dealValue filtering would need backend support
    // For now, we'll skip it or add it as a separate filter if backend supports it

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
