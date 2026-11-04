"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import { z } from "zod";
import { debounce } from "lodash";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import "suneditor/dist/css/suneditor.min.css";

// Components
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import PersonalNotesAddOrUpdateModal from "./PersonalNotesAddOrUpdateModal";
import PersonalNotesTable from "./PersonalNotesTable";

// Hooks & Utilities
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";
const initialValues = {
  id: 0,
  title: "",
  content: "",
  tags: "",
  isPinned: false,
  isArchived: false,
  reminderAt: "",
};

const schema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  reminderAt: z.string().nullable().optional(),
});

const ArchivePersonalNotesTab = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const searchParams = useSearchParams();
  // const dropdowns = useCommonStore((state) => state.dropdowns);

  // Initialize state from URL params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialIsPinned = searchParams.get("isPinned") || "";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    isPinned: initialIsPinned,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const {
    // register,
    // formState: { errors },
    // setValue,
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

  // API hooks
  const {
    usePersonalArchiveNotesQuery,
    updateArchivePersonalNoteMutation,
    deletePersonalArchiveNoteMutation,
    toggleBackArchivePersonalNoteMutation,
    togglePinArchivePersonalNoteMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

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

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (filters.search) params.search = filters.search;
    if (filters.isPinned) params.isPinned = filters.isPinned;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    usePersonalArchiveNotesQuery(queryParams);

  // Move dataArray inside useMemo to avoid dependency issues
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
    return dataArray.map((item, index) => ({
      ...item,
      sl: (currentPage - 1) * itemsPerPage + index + 1,
    }));
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    const payload = {
      ...values,
      reminderAt: values.reminderAt ? values.reminderAt : null,
    };
    await updateArchivePersonalNoteMutation.mutateAsync(payload);
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
          await deletePersonalArchiveNoteMutation.mutateAsync(id);
        }
      });
    },
    [deletePersonalArchiveNoteMutation],
  );

  const handlePin = useCallback(
    async (id) => {
      await togglePinArchivePersonalNoteMutation.mutateAsync(id);
    },
    [togglePinArchivePersonalNoteMutation],
  );

  const handleArchive = useCallback(
    async (id) => {
      await toggleBackArchivePersonalNoteMutation.mutateAsync(id);
    },
    [toggleBackArchivePersonalNoteMutation],
  );
  const handleEdit = useCallback(
    (item) => {
      reset(item);
      setShowModal(true);
    },
    [reset],
  );

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );
  // Handle filter changes
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

  const clearAllFilters = useCallback(() => {
    debouncedUpdateSearch.cancel();
    setFilters({
      search: "",
      isPinned: "",
    });
    setCurrentPage(1);
    setGlobalFilter("");

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "archive-notes");
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("isPinned");
    // Preserve tab param for this tab
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [debouncedUpdateSearch, itemsPerPage]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "archive-notes");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) {
      params.set("search", filters.search);
    } else {
      params.delete("search");
    }
    if (filters.isPinned) {
      params.set("isPinned", filters.isPinned);
    } else {
      params.delete("isPinned");
    }

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
      {
        accessorKey: "sl",
        header: "SL.",
        size: 50,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "content",
        header: "Content",
        cell: ({ getValue }) => (
          <span
            className="max-w-xs truncate block"
            dangerouslySetInnerHTML={{ __html: getValue() || "-" }}
          ></span>
        ),
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "isPinned",
        header: "Pinned",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isPinned}
            onClick={() => handlePin(row.original.id)}
            enabledText="Yes"
            disabledText="No"
            disabled={!hasPermission("hr.archive_notes_edit")}
          />
        ),
      },
      {
        accessorKey: "isArchived",
        header: "Archived",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isArchived}
            onClick={() => handleArchive(row.original.id)}
            enabledText="Yes"
            disabledText="No"
            disabled={!hasPermission("hr.archive_notes_edit")}
          />
        ),
      },
      {
        accessorKey: "reminderAt",
        header: "Reminder",
        cell: ({ row }) => (
          <>
            <span>
              {row.original.reminderAt
                ? helpers.dDateTime(row.original.reminderAt)
                : "-"}
            </span>
            {/* <span>{row.original.reminderAt ? helpers.dDate(row.original.reminderAt, 'DD-MM-YYYY HH:mm A') : "-"}</span> */}
          </>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowData = row.original;
          return (
            <div className="action">
              {hasPermission("hr.archive_notes_edit") && (
                <button
                  onClick={() => handleEdit(rowData)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.archive_notes_delete") && (
                <button
                  onClick={() => handleDelete(rowData.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 50,
      },
    ],
    [handleDelete, handleEdit, handleArchive, handlePin],
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
    updateArchivePersonalNoteMutation.isLoading ||
    deletePersonalArchiveNoteMutation.isLoading ||
    toggleBackArchivePersonalNoteMutation.isLoading ||
    togglePinArchivePersonalNoteMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search notes...",
    },
    {
      component: "select",
      name: "isPinned",
      label: "Pinned Status",
      options: [
        { value: "true", label: "Pinned" },
        { value: "false", label: "Unpinned" },
      ],
      placeholder: "Filter by Status",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Archive Notes</h1>
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
          {/* <ButtonTw
            onClick={() => setShowModal(true)}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Add New
          </ButtonTw> */}
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

      <PersonalNotesTable
        table={table}
        isFetching={isFetching}
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

      <PersonalNotesAddOrUpdateModal
        showModal={showModal}
        isLoading={isLoading}
        watch={watch}
        control={control}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        handleClose={handleClose}
        reset={reset}
      />
    </div>
  );
};

export default ArchivePersonalNotesTab;
