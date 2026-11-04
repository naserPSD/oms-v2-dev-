// src/features/hr-dashboard/hr-notice/JobPostingList.jsx
"use client";
import { z } from "zod";
import { zodResolver } from "@/utils/zodResolver";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import "suneditor/dist/css/suneditor.min.css";
import Swal from "sweetalert2";

// Components
import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { Pencil, Trash2 } from "lucide-react";

// Hooks & Utilities
import helpers from "@/utils/helpers";
import { useCommonStore } from "@/store/useCommonStore";
import { useRecruitmentQueryApi } from "@/hooks/queryApi/useRecruitmentQueryApi";
import JobPostingTable from "./components/JobPostingTable";

// initial form values
const initialValues = {};

const JobPostingList = () => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    status: initialStatusFilter,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const schema = z.object({});

  const {
    // register,
    // formState: { errors },
    setValue,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Edit handler for modal
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  const { useJobPostingQuery } = useRecruitmentQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // if (filters.search) params.search = filters.search;
    // if (filters.status) params.isActive = filters.status;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useJobPostingQuery(queryParams);

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data],
  );

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    // console.log('dataArray',dataArray)
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    console.log("values", values);
    // await addOrUpdateSubscriptionMutation.mutateAsync(values);
  };

  const handleDelete = useCallback(async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "swal-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // await deleteSubscriptionMutation.mutateAsync(id);
      }
    });
  }, []);

  const handleToggleStatus = useCallback(async (id) => {
    // await toggleSubscriptionMutation.mutateAsync(id);
  }, []);

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "search") {
        setGlobalFilter(value);
        debouncedUpdateSearch(value);
      } else {
        // For other filters, update immediately
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
      }
    },
    [debouncedUpdateSearch],
  );

  const clearAllFilters = () => {
    debouncedUpdateSearch.cancel();
    setFilters({
      search: "",
      status: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());

    // if (filters.search) params.set("search", filters.search);
    // if (filters.status) params.set('status', filters.status);

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "sl", header: "SL.", size: 50 },
      {
        accessorKey: "jobPosition",
        header: "Title",
        cell: ({ row }) => row.original.jobPosition?.name || "-",
        size: 220,
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ getValue }) => getValue() || "-",
        size: 120,
      },
      {
        accessorKey: "jobVacancy",
        header: "Vacancies",
        cell: ({ getValue }) => getValue() ?? "-",
      },
      {
        accessorKey: "postingStatus",
        header: "Status",
        cell: ({ row }) => row.original.postingStatus?.name || "-",
        size: 120,
      },
      {
        accessorKey: "publishDate",
        header: "Publish Date",
        cell: ({ row }) =>
          row.original.publishDate
            ? new Date(row.original.publishDate).toLocaleString()
            : "-",
        size: 160,
      },
      {
        accessorKey: "closeDate",
        header: "Close Date",
        cell: ({ row }) =>
          row.original.closeDate
            ? new Date(row.original.closeDate).toLocaleString()
            : "-",
        size: 160,
      },
      {
        accessorKey: "applicantsCount",
        header: "Applicants",
        cell: ({ getValue }) => getValue() ?? 0,
        size: 100,
      },
      {
        accessorKey: "viewsCount",
        header: "Views",
        cell: ({ getValue }) => getValue() ?? 0,
        size: 80,
      },
      {
        accessorKey: "publishedBy",
        header: "Published By",
        cell: ({ getValue }) => (getValue() ? String(getValue()) : "-"),
        size: 140,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleString()
            : "-",
        size: 160,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="action">
              <button
                onClick={() => handleEdit(rowData)}
                className="btn-action text-blue-500 hover:text-blue-700"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(rowData.id)}
                className="btn-action text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [handleEdit, handleDelete],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data: listData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeDirection: "rtl",
  });

  const isLoading = isFetching;
  // ||
  // addOrUpdateSubscriptionMutation.isLoading ||
  // deleteSubscriptionMutation.isLoading ||
  // toggleSubscriptionMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search subscriptions...",
    },
    {
      component: "select",
      name: "status",
      label: "Select Status",
      options: dropdowns.activeInactiveList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Job Posting</h1>
        <div className="flex gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={() => toggleFilter()}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>
          <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Add New
          </ButtonTw>
        </div>
      </div>

      {/* Filter Bar */}
      {/* <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      /> */}
      <JobPostingTable
        table={table}
        isLoading={isLoading}
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
};

export default JobPostingList;
