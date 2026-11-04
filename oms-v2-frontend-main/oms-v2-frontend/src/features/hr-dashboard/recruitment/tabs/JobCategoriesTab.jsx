import DataFilter from "@/components/common/DataFilter";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { useRecruitmentQueryApi } from "@/hooks/queryApi/useRecruitmentQueryApi";
import Pagination from "@/components/common/Pagination";
import AddOrUpdateJobCategoryModal from "./modals/AddOrUpdateJobCategoryModal";
import JobCategoriesListTable from "./components/JobCategoriesListTable";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const initialValues = {
  id: 0,
  name: "",
  isActive: true,
};

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Job name is required"),
  isActive: z.boolean().optional(),
});

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const JobCategoriesTab = () => {
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // Define search filter state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const {
    // register,
    // formState: { errors },
    reset,
    handleSubmit,
    control,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Modal handlers
  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const {
    useJobCategoryQuery,
    addOrUpdateJobCategoryMutation,
    deleteJobCategoryMutation,
  } = useRecruitmentQueryApi({ reset, setError, handleClose, setShowModal });

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.status !== "") params.isActive = filters.status === "true";

    return params;
  }, [currentPage, itemsPerPage, filters]);

  const { data: responseData, isLoading: isFetching } =
    useJobCategoryQuery(queryParams);

  const dataArray = useMemo(() => {
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

  const pagination = (responseData && responseData.pagination) || {
    page: 1,
    total: 0,
    limit: itemsPerPage,
    lastPage: 1,
    resultRows: 0,
  };
  const total = pagination.total || 0;

  const listData = useMemo(() => {
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    await addOrUpdateJobCategoryMutation.mutateAsync(values);
  };

  const handleDelete = useCallback(
    async (id) => {
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
          await deleteJobCategoryMutation.mutateAsync(id);
        }
      });
    },
    [deleteJobCategoryMutation],
  );

  // const handleArchive = useCallback(
  //   async (id) => {
  //     await toggleArchivePersonalNoteMutation.mutateAsync(id);
  //   },
  //   [toggleArchivePersonalNoteMutation]
  // );

  const handleEdit = useCallback(
    (item) => {
      reset({
        id: item.id,
        name: item.name,
        isActive: item.isActive,
      });
      setShowModal(true);
    },
    [reset],
  );

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    if (filterName === "search") {
      setGlobalFilter(value);
    }

    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "job-categories");
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("status");
    // Preserve tab param for this tab
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [itemsPerPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "job-categories");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) {
      params.set("search", filters.search);
    } else {
      params.delete("search");
    }

    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // TanStack Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL",
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Job Category Name",
        accessorFn: (row) => row?.name,
        enableGlobalFilter: true,
        filterFn: "includesString",
        cell: ({ row }) => row.original?.name || "-",
        size: 220,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          return (
            <span
              className={`badge badge-pill ${
                row.original?.isActive
                  ? "badge-outline-success"
                  : "badge-outline-secondary"
              }`}
            >
              {row.original?.isActive ? "Active" : "Inactive"}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: "actions",
        header: "Action",
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const jobCategory = row.original;
          return (
            <div className="action flex gap-2">
              {hasPermission("hr.job_categories_edit") && (
                <button
                  onClick={() => handleEdit(jobCategory)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.job_categories_delete") && (
                <button
                  onClick={() => handleDelete(jobCategory.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
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
  const isLoading =
    isFetching ||
    addOrUpdateJobCategoryMutation.isLoading ||
    deleteJobCategoryMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search job category name...",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "status",
      label: "Select Status",
      options: STATUS_OPTIONS,
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
        <h1 className="title-color font-bold text-lg">Job Categories</h1>
        <div className="flex flex-wrap gap-2">
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

          {hasPermission("hr.job_categories_add") && (
            <ButtonTw
              onClick={() => setShowModal(true)}
              variant="blue"
              className="gap-2"
            >
              <BiPlus /> Add New
            </ButtonTw>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <JobCategoriesListTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <AddOrUpdateJobCategoryModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
      />
    </div>
  );
};

export default JobCategoriesTab;
