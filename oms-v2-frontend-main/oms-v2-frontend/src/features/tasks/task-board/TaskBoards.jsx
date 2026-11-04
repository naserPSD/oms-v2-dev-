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
import { useTaskBoardFilters } from "./hooks/useTaskBoardFilters";
import { useTaskBoardTableColumn } from "./hooks/useTaskBoardTableColumn";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const taskBoardsSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Board name is required"),
  workspaceId: z.coerce.number().min(1, "Workspace is required"),
  viewTypeId: z.coerce.number().min(1, "View type is required"),
});

const initialValues = {
  id: 0,
  name: "",
  workspaceId: null,
  viewTypeId: null,
};

// 3️⃣ ======================= COMPONENT =======================

const TaskBoards = () => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show"
  );
  const [sorting, setSorting] = useState([]);

  const taskBoardViewType =
    dropdowns.statusGroupList?.find((s) => s.code === "task_board_view_types")
      ?.statuses ?? [];
  dropdowns.taskBoardViewType = taskBoardViewType;

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
  } = useTaskBoardFilters(itemsPerPage);

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    //formState: { errors },
  } = useForm({
    resolver: zodResolver(taskBoardsSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    useTaskBoardsQuery,
    useTaskWorkspacesQuery,
    addOrUpdateTaskBoardMutation,
    deleteTaskBoardMutation,
    toggleTaskBoardStatusMutation,
  } = useHrQueryApi({ reset, setError, handleClose, setShowModal });

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // React Query for data fetching
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useTaskBoardsQuery(queryParams);

  // Fetch workspaces for dropdown
  const { data: workspacesData } = useTaskWorkspacesQuery({});

  const dataArray = useMemo(
    () => responseData?.data || [],
    [responseData?.data]
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
      placeholder: "Search board name...",
    },
    {
      component: "select",
      name: "workspaceId",
      label: "Workspace",
      options:
        workspacesData?.data?.map((ws) => ({
          value: ws.id,
          label: ws.name,
        })) || [],
      placeholder: "Filter by Workspace",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "viewTypeId",
      label: "View Type",
      options: dropdowns.taskBoardViewType,
      placeholder: "Filter by View Type",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // Prepare dropdown options
  const workspaceOptions = useMemo(
    () =>
      workspacesData?.data?.map((ws) => ({
        value: ws.id,
        label: ws.name,
      })) || [],
    [workspacesData]
  );

  // const viewTypeOptions = useMemo(
  //   () =>
  //     dropdowns.statusGroupList
  //       ?.find((s) => s.code === "task_view_types")
  //       ?.statuses?.map((type) => ({
  //         value: type.id,
  //         label: type.name,
  //       })) || [],
  //   [dropdowns]
  // );

  // 📝 Create/Update handler
  const submitForm = async (values) => {
    try {
      await addOrUpdateTaskBoardMutation.mutateAsync(values);
      refetch();
    } catch (error) {
      console.error("Error submitting task board:", error);
    }
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      reset({
        id: item.id,
        name: item.name,
        workspaceId: item.workspaceId,
        viewTypeId: item.viewTypeId,
      });
      setShowModal(true);
    },
    [reset]
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
            await deleteTaskBoardMutation.mutateAsync(id);
            refetch();
          } catch (error) {
            console.error("Error deleting task board:", error);
          }
        }
      });
    },
    [deleteTaskBoardMutation, refetch]
  );

  // 🔄 Toggle Status handler (if needed)
  const handleToggleStatus = useCallback(
    async (id, currentStatus) => {
      try {
        await toggleTaskBoardStatusMutation.mutateAsync({
          id,
          active: !currentStatus,
        });
        refetch();
      } catch (error) {
        console.error("Error toggling task board status:", error);
      }
    },
    [toggleTaskBoardStatusMutation, refetch]
  );

  // ➕ Add new board handler
  const handleAddBoard = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // 🧠 ---------- TABLE ----------
  const columns = useTaskBoardTableColumn({
    handleEdit,
    handleDelete,
    handleToggleStatus,
    workspaces: workspacesData?.data || [],
    viewTypes: taskBoardViewType,
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
    addOrUpdateTaskBoardMutation?.isLoading ||
    deleteTaskBoardMutation?.isLoading ||
    toggleTaskBoardStatusMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Task Boards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your task boards and organize your workflow
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
          <ButtonTw onClick={handleAddBoard} variant="blue" className="gap-2">
            <BiPlus /> Add Board
          </ButtonTw>
        </div>
      </div>

      {/* Add/Edit Board Modal */}
      <ModalTw
        show={showModal}
        onClose={handleClose}
        title={isEditing ? "Edit Task Board" : "Create New Task Board"}
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
                  label="Board Name"
                  placeholder="Enter Board Name..."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                  {...field}
                />
              )}
            />

            <Controller
              name="workspaceId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Workspace"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={workspaceOptions}
                  placeholder="Select Workspace..."
                  required
                />
              )}
            />

            <Controller
              name="viewTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="View Type"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  options={dropdowns.taskBoardViewType}
                  placeholder="Select View Type..."
                  required
                />
              )}
            />

            <div className="flex gap-3 pt-2">
              <ButtonTw
                type="submit"
                variant="blue"
                className="flex-1"
                disabled={isLoading}
                loading={isLoading}
              >
                {isEditing ? "Update Board" : "Create Board"}
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

      {/* Task Boards Table */}
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

export default TaskBoards;
