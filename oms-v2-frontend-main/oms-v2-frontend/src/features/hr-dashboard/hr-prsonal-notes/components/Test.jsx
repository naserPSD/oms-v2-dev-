"use client";

import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
// import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
// import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import "suneditor/dist/css/suneditor.min.css";
import Swal from "sweetalert2";
import { z } from "zod";
import PersonalNotesAddOrUpdateModal from "./PersonalNotesAddOrUpdateModal";

const ArchivePersonalNotesTab = () => {
  // const { t } = useTranslation();
  const searchParams = useSearchParams();
  // const dropdowns = useCommonStore((state) => state.dropdowns);

  // Get initial values from URL search params
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

  const toggleFilter = () => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  };

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    isPinned: initialIsPinned,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

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
    reminderAt: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Edit handler for modal
  const handleClose = () => {
    reset(initialValues);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    reset(item);
    setShowModal(true);
  };

  // Fetch notes with pagination and filters
  const {
    usePersonalArchiveNotesQuery,
    addOrUpdatePersonalNoteMutation,
    deletePersonalArchiveNoteMutation,
    toggleBackArchivePersonalNoteMutation,
    togglePinPersonalNoteMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

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

  const dataArray = responseData?.data || [];
  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: 10,
    lastPage: 1,
    resultRows: 0,
  };
  const { total } = pagination;

  const listData = useMemo(() => {
    return dataArray.map((item) => {
      return {
        ...item,
        sl: (currentPage - 1) * itemsPerPage + dataArray.indexOf(item) + 1,
      };
    });
  }, [dataArray, currentPage, itemsPerPage]);

  const submitForm = async (values) => {
    await addOrUpdatePersonalNoteMutation.mutateAsync(values);
  };

  const handleDelete = async (id) => {
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
  };

  const handlePin = async (id) => {
    await togglePinPersonalNoteMutation.mutateAsync(id);
  };

  const handleArchive = async (id) => {
    await toggleBackArchivePersonalNoteMutation.mutateAsync(id);
  };

  const isLoading =
    isFetching ||
    usePersonalArchiveNotesQuery.isLoading ||
    addOrUpdatePersonalNoteMutation.isLoading ||
    deletePersonalArchiveNoteMutation.isLoading ||
    toggleBackArchivePersonalNoteMutation.isLoading ||
    togglePinPersonalNoteMutation.isLoading;

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== undefined && value !== null,
  );

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

  // Debounced updater for search filter only
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

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
      isPinned: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "archive-notes");
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("isPinned");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

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
        <h1 className="title-color font-bold text-lg">Personal Notes</h1>
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
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="table-container">
        <table className="table">
          <thead className="text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ChevronUp size={14} />,
                          desc: <ChevronDown size={14} />,
                        }[header.column.getIsSorted()] ??
                          (header.column.getCanSort() ? (
                            <ArrowUpDown size={14} />
                          ) : null)}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isFetching ? (
              [...Array(itemsPerPage)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Skeleton className="h-6 w-12 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  {hasActiveFilters
                    ? "No results match your search criteria"
                    : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
