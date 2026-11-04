// src/features/hr-dashboard/hr-notice/HrNotice.jsx
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
import { isBefore } from "date-fns/isBefore";
import { parseISO } from "date-fns/parseISO";
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
import HrNoticeTable from "./components/HrNoticeTable";

// Hooks & Utilities
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import NoticeAddOrUpdateModal from "./components/NoticeAddOrUpdateModal";
import { useCommonStore } from "@/store/useCommonStore";
import useCommonFunctions from "@/hooks/common/useCommonFunctions";

// initial form values
const initialValues = {
  id: 0,
  title: "",
  priority: "",
  pageRoute: "",
  attachment: "",
  content: "",
  startDate: "",
  endDate: "",
  isActive: true,
};
const HrNotice = () => {
  // const { t } = useTranslation();
  const { hasPermission } = useCommonFunctions();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialStatusFilter = searchParams.get("status") || "";
  const initialPriority = searchParams.get("priority") || "";
  const initialStartDate = searchParams.get("startDate") || "";
  const initialCreatedAt = searchParams.get("createdAt") || "";
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
    priority: initialPriority,
    startDate: initialStartDate,
    createdAt: initialCreatedAt,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const schema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, "Title is required"),
    pageRoute: z.string().optional(),
    isActive: z.boolean().optional(),
    attachment: z.string().optional(),
    content: z.string().min(1, "Content is required"),
    priority: z.enum(["Low", "Normal", "High"]).optional(),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => {
        const today = getTodayDate();
        const selectedDate = parseISO(val);
        return !isBefore(selectedDate, today);
      }, "Start date cannot be in the past"),
    endDate: z.string().min(1, "End date is required"),
  });

  const {
    // register,
    // formState: { errors },
    // setValue,
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

  // Fetch notes with pagination and filters
  const {
    useNoticeQuery,
    addOrUpdateNoticeMutation,
    deleteNoticeMutation,
    toggleNoticeStatusMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

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

    if (filters.search) params.search = filters.search;
    if (filters.priority) params.priority = filters.priority;
    if (filters.status) params.isActive = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.createdAt) params.createdAt = filters.createdAt;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useNoticeQuery(queryParams);

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
    // console.log("values", values);
    await addOrUpdateNoticeMutation.mutateAsync(values);
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
          await deleteNoticeMutation.mutateAsync(id);
        }
      });
    },
    [deleteNoticeMutation],
  );

  const handleToggleStatus = useCallback(
    async (id) => {
      await toggleNoticeStatusMutation.mutateAsync(id);
    },
    [toggleNoticeStatusMutation],
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
      priority: "",
      startDate: "",
      createdAt: "",
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

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.createdAt) params.set("createdAt", filters.createdAt);

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
        accessorKey: "attachment",
        header: "Attachment",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "pageRoute",
        header: "Page Route",
        cell: ({ getValue }) => getValue() || "-",
      },
      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) => (
          <SwitchButton
            enabled={row.original.isActive}
            onClick={() => handleToggleStatus(row.original.id)}
            enabledText="Yes"
            disabledText="No"
          />
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => (
          <>
            <span>
              {row.original.startDate
                ? helpers.dDateTime(row.original.startDate)
                : "-"}
            </span>
            {/* <span>{row.original.startDate ? helpers.dDate(row.original.startDate, 'DD-MM-YYYY HH:mm A') : "-"}</span> */}
          </>
        ),
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => (
          <>
            <span>
              {row.original.endDate
                ? helpers.dDateTime(row.original.endDate)
                : "-"}
            </span>
            {/* <span>{row.original.endDate ? helpers.dDate(row.original.endDate, 'DD-MM-YYYY HH:mm A') : "-"}</span> */}
          </>
        ),
      },

      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <>
            <span>
              {row.original.createdAt
                ? helpers.dDateTime(row.original.createdAt)
                : "-"}
            </span>
            {/* <span>{row.original.createdAt ? helpers.dDate(row.original.createdAt, 'DD-MM-YYYY HH:mm A') : "-"}</span> */}
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
              {hasPermission("hr.notices_edit") && (
                <button
                  onClick={() => handleEdit(rowData)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission("hr.notices_delete") && (
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
    [handleToggleStatus, handleEdit, handleDelete],
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
    addOrUpdateNoticeMutation.isLoading ||
    deleteNoticeMutation.isLoading ||
    // toggleArchivePersonalNoteMutation.isLoading ||
    toggleNoticeStatusMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search Notes...",
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
      component: "select",
      name: "priority",
      label: "Priority",
      options: [
        { value: "Low", label: "Low" },
        { value: "Normal", label: "Medium" },
        { value: "High", label: "High" },
      ],
      placeholder: "Filter by Priority",
    },
    {
      component: "datePicker",
      name: "startDate",
      label: "Start Date",
      placeholder: "Filter by Start Date",
    },
    {
      component: "datePicker",
      name: "createdAt",
      label: "Created At",
      placeholder: "Filter by Created Date",
    },
    {
      component: "clear",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg"> Notices</h1>
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
          {hasPermission("hr.notices_add") && (
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

      <HrNoticeTable
        table={table}
        isFetching={isFetching}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
      <NoticeAddOrUpdateModal
        showModal={showModal}
        handleClose={handleClose}
        isLoading={isLoading}
        reset={reset}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        control={control}
        watch={watch}
        getTodayDate={getTodayDate}
      />
    </div>
  );
};

export default HrNotice;
