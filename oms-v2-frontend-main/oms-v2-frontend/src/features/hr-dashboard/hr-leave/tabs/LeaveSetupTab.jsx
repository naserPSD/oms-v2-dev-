"use client";

import { FormController as Controller } from "@/components/common/FormController";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { zodResolver } from "@/utils/zodResolver";
import helpers from "@/utils/helpers";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import SwitchButton from "@/components/ui/SwitchButton";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import { Pencil, Trash2 } from "lucide-react";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";

import useCommonFunctions from "@/hooks/common/useCommonFunctions";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 8 }, (_, index) => {
  const year = currentYear - 1 + index;
  return { label: String(year), value: year };
});

const initialValues = {
  id: undefined,
  name: "",
  isPaid: true,
  maxDaysPerYear: "",
  year: currentYear,
  requiresApproval: false,
};

const schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Leave type name is required"),
  isPaid: z.boolean().default(true),
  maxDaysPerYear: z.coerce.number().min(1, "Max days per year is required"),
  year: z.coerce.number().min(2000, "Year is required"),
  requiresApproval: z.boolean().default(false),
});

const LeaveSetupTab = ({ hasPermission: hasPermissionProp }) => {
  const { hasPermission: hasPermissionHook } = useCommonFunctions();
  const hasPermission = hasPermissionProp || hasPermissionHook;

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit =
    parseInt(searchParams.get("limit")) ||
    (typeof helpers.perPageListItems === "function"
      ? helpers.perPageListItems()
      : 10);
  const initialYear = searchParams.get("year")
    ? Number(searchParams.get("year")) || ""
    : "";

  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("showFilter") || "show";
    }
    return "show";
  });
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState({
    search: initialSearch,
    year: initialYear,
  });

  const { handleSubmit, reset, control, watch, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const {
    useLeaveTypeQuery,
    getLeaveTypeById,
    addOrUpdateLeaveTypeMutation,
    deleteLeaveTypeMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // Debounced updater for search filter
  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1);
      }, 500),
    [],
  );

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filters.search) params.search = filters.search;
    if (filters.year) params.year = filters.year;
    return params;
  }, [currentPage, itemsPerPage, filters]);

  const { data: responseData, isLoading: isFetching } =
    useLeaveTypeQuery(queryParams);

  const data = useMemo(() => {
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

  const pagination = responseData?.pagination || {
    page: 1,
    total: 0,
    limit: itemsPerPage,
    lastPage: 1,
    resultRows: 0,
  };

  const total = Number(pagination?.total) || data.length || 0;

  // Toggle filter bar visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      if (typeof window !== "undefined") {
        localStorage.setItem("showFilter", newValue);
      }
      return newValue;
    });
  }, []);

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

  const clearAllFilters = () => {
    debouncedUpdateSearch.cancel();
    setFilters({ search: "", year: "" });
    setCurrentPage(1);
    setGlobalFilter("");
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "leaveSetup");
    params.set("page", "1");
    params.set("limit", itemsPerPage.toString());
    params.delete("search");
    params.delete("year");
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "leaveSetup");
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    if (filters.search) {
      params.set("search", filters.search);
    } else {
      params.delete("search");
    }
    if (filters.year) {
      params.set("year", filters.year.toString());
    } else {
      params.delete("year");
    }
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [currentPage, itemsPerPage, filters]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateSearch.cancel();
    };
  }, [debouncedUpdateSearch]);

  // Modal handlers
  const handleEdit = useCallback(
    async (item) => {
      const response = await getLeaveTypeById(item.id);
      const leaveType = response?.data || response || item;
      reset({
        id: leaveType?.id,
        name: leaveType?.name || "",
        isPaid: Boolean(leaveType?.isPaid),
        maxDaysPerYear: leaveType?.maxDaysPerYear || "",
        year: leaveType?.year || currentYear,
        requiresApproval: Boolean(leaveType?.requiresApproval),
      });
      setShowModal(true);
    },
    [getLeaveTypeById, reset],
  );

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
          await deleteLeaveTypeMutation.mutateAsync(id);
        }
      });
    },
    [deleteLeaveTypeMutation],
  );

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "sl",
        header: "SL.",
        size: 60,
        cell: ({ row }) => (currentPage - 1) * itemsPerPage + row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Leave Type",
        size: 200,
        cell: ({ row }) => (
          <span className="font-medium">{row.original?.name}</span>
        ),
      },
      {
        accessorKey: "isPaid",
        header: "Is Paid",
        size: 120,
        cell: ({ row }) => (row.original?.isPaid ? "Yes" : "No"),
      },
      {
        accessorKey: "maxDaysPerYear",
        header: "Max Days/Year",
        size: 120,
        cell: ({ row }) => row.original?.maxDaysPerYear,
      },
      {
        accessorKey: "year",
        header: "Year",
        size: 90,
        cell: ({ row }) => row.original?.year || "—",
      },
      {
        accessorKey: "requiresApproval",
        header: "Requires Approval",
        size: 120,
        cell: ({ row }) => (row.original?.requiresApproval ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: "Actions",
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="flex justify-center gap-2">
              {hasPermission?.("hr.leave_setup_edit") && (
                <button
                  onClick={() => handleEdit(data)}
                  className="btn-action text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
              )}
              {hasPermission?.("hr.leave_setup_delete") && (
                <button
                  onClick={() => handleDelete(data.id)}
                  className="btn-action text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [currentPage, handleDelete, handleEdit, hasPermission, itemsPerPage],
  );

  // Create TanStack Table instance
  const table = useReactTable({
    data,
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

  const submitForm = async (values) => {
    await addOrUpdateLeaveTypeMutation.mutateAsync(values);
    handleClose();
  };

  // Filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search By Leave Type",
    },
    {
      component: "select",
      name: "year",
      label: "Year",
      placeholder: "All years",
      options: yearOptions,
    },
    {
      component: "clear",
    },
  ];

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined && value !== null,
    );
  }, [filters]);

  const isLoading =
    Boolean(isFetching) ||
    Boolean(addOrUpdateLeaveTypeMutation?.isPending) ||
    Boolean(deleteLeaveTypeMutation?.isPending) ||
    Boolean(addOrUpdateLeaveTypeMutation?.isLoading) ||
    Boolean(deleteLeaveTypeMutation?.isLoading);

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <h1 className="title-color font-bold text-lg">Leave Setup</h1>
        <div className="flex gap-2">
          <SimpleTooltip
            title={showFilter === "show" ? "Hide" : "Show"}
            text={`${showFilter === "show" ? "Hide" : "Show"} Filters`}
          >
            <ButtonTw
              onClick={toggleFilter}
              variant="alternative"
              className="gap-2"
            >
              <FaFilter />
            </ButtonTw>
          </SimpleTooltip>

          {hasPermission?.("hr.leave_setup_add") && (
            <ButtonTw
              onClick={() => {
                reset(initialValues);
                setShowModal(true);
              }}
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

      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
        currentPage={currentPage}
        total={total}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={watch("id") ? "Edit Leave Type" : "Add Leave Type"}
        size="lg"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-x-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Leave Type Name"
                  placeholder="Enter Leave Type Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-2"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="year"
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Year"
                  placeholder="Select year"
                  options={yearOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  className="col-span-2 md:col-span-1"
                />
              )}
            />

            <Controller
              control={control}
              name="maxDaysPerYear"
              render={({ field, fieldState }) => (
                <Input
                  label="Max Days Per Year"
                  placeholder="e.g. 12 "
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  type="number"
                  className="col-span-2 md:col-span-1 md:max-w-[220px]"
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="isPaid"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Is Paid"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            <Controller
              control={control}
              name="requiresApproval"
              render={({ field, fieldState }) => (
                <SwitchButton
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Requires Approval"
                  error={fieldState.error?.message}
                  enabledText="Yes"
                  disabledText="No"
                />
              )}
            />

            <div className="w-full flex justify-center items-center gap-4 col-span-2">
              <ButtonTw
                type="submit"
                size="sm"
                variant="default"
                className="w-full font-bold mt-4"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </ButtonTw>

              <ButtonTw
                size="sm"
                variant="outline.gray"
                className="w-full font-bold mt-4"
                onClick={() => reset(initialValues)}
              >
                Reset
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>
    </div>
  );
};

export default LeaveSetupTab;
