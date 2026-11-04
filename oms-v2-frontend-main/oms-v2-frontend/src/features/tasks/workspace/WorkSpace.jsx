"use client";
// 1️⃣ ======================= IMPORTS =======================
import { FormController as Controller } from "@/components/common/FormController";
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import { ModalTw } from "@/components/common/ModalTw";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import Input from "@/components/ui/Input";
import SelectSearch from "@/components/ui/SelectSearch";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useCommonQueryApi } from "@/hooks/queryApi/useCommonQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import { useCommonStore } from "@/store/useCommonStore";
import helpers from "@/utils/helpers";
import { zodResolver } from "@/utils/zodResolver";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import { FaFilter } from "react-icons/fa";
import Swal from "sweetalert2";
import { z } from "zod";
import { useWorkSpaceFilters } from "./hooks/useWorkSpaceFilters";
import { useWorkSpaceTableColumn } from "./hooks/useWorkSpaceTableColumn";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const workspaceSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Workspace name is required"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

const initialValues = {
  id: 0,
  name: "",
  description: "",
  active: true,
};

// 3️⃣ ======================= COMPONENT =======================

const TaskWorkspace = () => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // 🧠 ---------- FILTERS ----------
  const {
    filters,
    globalFilter,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearAllFilters,
    queryParams,
    setGlobalFilter,
  } = useWorkSpaceFilters(itemsPerPage);

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workspaceSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    useTaskWorkspacesQuery,
    addOrUpdateTaskWorkspaceMutation,
    deleteTaskWorkspaceMutation,
    toggleTaskWorkspaceStatusMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching with pagination and search
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useTaskWorkspacesQuery(queryParams);

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

  // 🧠 Build filter config
  const filterConfig = [
    {
      component: "input",
      name: "search",
      label: "Search",
      placeholder: "Search workspace name, description...",
    },
    {
      component: "select",
      name: "active",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Create/Update handler
  const submitForm = async (values) => {
    await addOrUpdateTaskWorkspaceMutation.mutateAsync(values);
    // try {
    //   await addOrUpdateTaskWorkspaceMutation.mutateAsync(values);
    //   refetch();
    // } catch (error) {
    //   console.error("Error submitting workspace:", error);
    // }
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      reset({
        id: item.id,
        name: item.name,
        description: item.description || "",
        active: item.active,
      });
      setShowModal(true);
    },
    [reset],
  );

  // 🧹 Delete handler
  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        customClass: {
          popup: "swal-popup",
          confirmButton: "swal-confirm-btn",
          cancelButton: "swal-cancel-btn",
        },
        buttonsStyling: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteTaskWorkspaceMutation.mutateAsync(id);
            refetch();
          } catch (error) {
            console.error("Error deleting workspace:", error);
          }
        }
      });
    },
    [deleteTaskWorkspaceMutation, refetch],
  );

  // 🔄 Toggle Status handler
  const handleToggleStatus = useCallback(
    async (id, currentStatus) => {
      try {
        await toggleTaskWorkspaceStatusMutation.mutateAsync({
          id,
          active: !currentStatus,
        });
        refetch();
      } catch (error) {
        console.error("Error toggling workspace status:", error);
      }
    },
    [toggleTaskWorkspaceStatusMutation, refetch],
  );

  // ➕ Add new workspace handler
  const handleAddWorkspace = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // 🧠 ---------- TABLE ----------
  const columns = useWorkSpaceTableColumn({
    handleEdit,
    handleDelete,
    handleToggleStatus,
  });

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
    addOrUpdateTaskWorkspaceMutation?.isLoading ||
    deleteTaskWorkspaceMutation?.isLoading ||
    toggleTaskWorkspaceStatusMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Task Workspaces</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your task workspaces and collaboration spaces
          </p>
        </div>
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
          <ButtonTw
            onClick={handleAddWorkspace}
            variant="blue"
            className="gap-2"
          >
            <BiPlus /> Add Workspace
          </ButtonTw>
        </div>
      </div>

      {/* Add/Edit Workspace Modal */}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={isEditing ? "Edit Workspace" : "Create New Workspace"}
        size="md"
        dismissible={true}
        showHeader={true}
        showFooter={false}
        type="default"
        position="center"
      >
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="space-y-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label="Workspace Name"
                  placeholder="Enter workspace name..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  {...field}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                    <span className="text-gray-400 text-xs ml-1">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Enter workspace description..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                  {fieldState.error?.message && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {isEditing && (
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="active"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Active Workspace
                    </label>
                  </div>
                )}
              />
            )}

            <div className="flex gap-3 pt-2">
              <ButtonTw
                type="submit"
                variant="blue"
                className="flex-1"
                disabled={isLoading}
                loading={isLoading}
              >
                {isEditing ? "Update Workspace" : "Create Workspace"}
              </ButtonTw>

              <ButtonTw
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </ButtonTw>
            </div>
          </div>
        </form>
      </ModalTw>

      {/* Filter Bar */}
      <DataFilter
        showFilter={showFilter === "show"}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearAllFilters}
        filterConfig={filterConfig}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Workspace Table */}
      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={total}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default TaskWorkspace;
