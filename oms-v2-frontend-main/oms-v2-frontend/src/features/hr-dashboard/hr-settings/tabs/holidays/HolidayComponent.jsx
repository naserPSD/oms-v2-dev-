// src/features/hr-dashboard/hr-notice/Holiday.jsx
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
import HolidayTable from "./components/HolidayTable";

// Hooks & Utilities
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import helpers from "@/utils/helpers";
import HolidayAddOrUpdateModal from "./components/HolidayAddOrUpdateModal";
import { useCommonStore } from "@/store/useCommonStore";

// initial form values
const initialValues = {
  id: 0,
  holidayTypeId: "",
  holidayName: "",
  totalHolidays: 0,
  isActive: true,
};
const HolidayComponent = () => {
  // const { t } = useTranslation();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();

  const holidayTypes =
    dropdowns.statusGroupList
      ?.find((s) => s.code === "holiday_types")
      ?.statuses?.map((c) => ({
        value: c.id,
        label: c.name,
        code: c.code,
      })) ?? [];

  // Get initial values from URL search params
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  const initialSearch = searchParams.get("search") || "";
  const initialIsActiveStatus = searchParams.get("isActive") || "";
  const initialHolidayTypeId = searchParams.get("holidayTypeId") || "";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );

  // Define search filter state
  const [filters, setFilters] = useState({
    search: initialSearch,
    isActive: initialIsActiveStatus,
    holidayTypeId: initialHolidayTypeId,
  });
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);

  const schema = z.object({
    id: z.coerce.number().optional(),
    holidayTypeId: z.coerce.number().min(1, "Holiday type is required"),
    holidayName: z.string().min(1, "Holiday name is required"),
    totalHolidays: z.coerce.number().min(1, "Total holidays is required"),
    isActive: z.boolean().optional(),
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
    useHolidayQuery,
    addOrUpdateHolidayMutation,
    deleteHolidayMutation,
    toggleHolidayStatusMutation,
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
    if (filters.holidayTypeId) params.holidayTypeId = filters.holidayTypeId;
    if (filters.isActive) params.isActive = filters.isActive;

    return params;
  }, [currentPage, itemsPerPage, filters]);

  // React Query for data fetching with pagination and search
  const { data: responseData, isLoading: isFetching } =
    useHolidayQuery(queryParams);

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
    await addOrUpdateHolidayMutation.mutateAsync(values);
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
          await deleteHolidayMutation.mutateAsync(id);
        }
      });
    },
    [deleteHolidayMutation],
  );

  const handleToggleStatus = useCallback(
    async (id) => {
      await toggleHolidayStatusMutation.mutateAsync(id);
    },
    [toggleHolidayStatusMutation],
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
      isActive: "",
      holidayTypeId: "",
    });
    setCurrentPage(1);
    setGlobalFilter();

    // Clear URL params as well
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("isActive");
    params.delete("holidayTypeId");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) params.set("search", filters.search);
    else params.delete("search");
    if (filters.isActive) params.set("isActive", filters.isActive);
    else params.delete("isActive");
    if (filters.holidayTypeId) {
      params.set("holidayTypeId", filters.holidayTypeId);
    } else params.delete("holidayTypeId");

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
        accessorKey: "holidayTypeId",
        header: "Holiday Type",
        cell: ({ row }) => {
          const holidayType = row.original.holidayType;

          return <span>{holidayType?.name}</span>;
        },
      },
      {
        accessorKey: "holidayName",
        header: "Holiday Name",
        cell: ({ getValue }) => (
          <span
            className="max-w-xs truncate block"
            dangerouslySetInnerHTML={{ __html: getValue() || "-" }}
          ></span>
        ),
      },
      {
        accessorKey: "totalHolidays",
        header: "totalHolidays",
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
    [handleDelete, handleEdit, handleToggleStatus],
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
    addOrUpdateHolidayMutation.isLoading ||
    deleteHolidayMutation.isLoading ||
    // toggleArchivePersonalNoteMutation.isLoading ||
    toggleHolidayStatusMutation.isLoading;

  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search holiday name...",
    },
    {
      component: "select",
      name: "holidayTypeId",
      label: "Holiday Type",
      options: holidayTypes,
      placeholder: "Filter by Holiday Type",
    },
    {
      component: "select",
      name: "isActive",
      label: "Active Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "InActive" },
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
        <h1 className="title-color font-bold text-lg">Holidays</h1>
        <div className="flex gap-2">
          <SimpleTooltip
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

      <HolidayTable
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

      <HolidayAddOrUpdateModal
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

export default HolidayComponent;
