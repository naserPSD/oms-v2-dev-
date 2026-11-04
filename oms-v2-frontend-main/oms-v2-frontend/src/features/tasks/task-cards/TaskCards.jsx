"use client";
// 1️⃣ ======================= IMPORTS =======================
import CommonTable from "@/components/common/CommonTable";
import DataFilter from "@/components/common/DataFilter";
import Pagination from "@/components/common/Pagination";
import ButtonTw from "@/components/ui/ButtonTw";
import SimpleTooltip from "@/components/ui/SimpleTooltip";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
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
import { useTaskCardsFilters } from "./hooks/useTaskCardsFilters";
import { useTaskCardsTableColumn } from "./hooks/useTaskCardsTableColumn";
import AddOrUpdateTaskCardModal from "./modals/AddOrUpdateTaskCardModal";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

// 2️⃣ ======================= CONSTANTS / SCHEMA =======================

const taskCardSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Task card name is required"),
  color: z.string().min(1, "Color is required"),
  serial: z.coerce.number().min(1, "Serial must be at least 1"),
  workspaceId: z.coerce.number().min(1, "Workspace is required"),
  boardId: z.coerce.number().min(1, "Board is required"),
  isActive: z.boolean().default(true),
});

const initialValues = {
  id: 0,
  name: "",
  color: "#ffffff",
  serial: 1,
  workspaceId: null,
  boardId: null,
  isActive: true,
};
// 3️⃣ ======================= COMPONENT =======================

const TaskCards = () => {
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
  } = useTaskCardsFilters(itemsPerPage);

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    // formState: { errors },
  } = useForm({
    resolver: zodResolver(taskCardSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  // 🧠 ---------- API HOOKS ----------
  const {
    useTasksCardsQuery,
    addOrUpdateTaskCardMutation,
    deleteTaskCardMutation,
    toggleTaskCardStatusMutation,
  } = useTasksQueryApi({ reset, setError, handleClose, setShowModal });

  // 🧠 ---------- API HOOKS ----------
  const { useTaskWorkspacesQuery, useTaskBoardsQuery } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // Fetch workspaces for dropdown
  const { data: workspacesData } = useTaskWorkspacesQuery({});

  // Prepare dropdown options
  const workspaceOptions = useMemo(
    () =>
      workspacesData?.data?.map((ws) => ({
        value: ws.id,
        label: ws.name,
      })) || [],
    [workspacesData],
  );
  // Fetch Card Data for dropdown
  const { data: taskBoardData } = useTaskBoardsQuery({});

  // Card Data Prepare dropdown options
  const taskBoardOptions = useMemo(
    () =>
      taskBoardData?.data?.map((ts) => ({
        value: ts.id,
        label: ts.name,
      })) || [],
    [taskBoardData],
  );

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
  } = useTasksCardsQuery(queryParams);

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
      name: "status",
      label: "Select Status",
      options: dropdowns.activeInactiveList || [],
      placeholder: "Filter by Status",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "workspaceId",
      label: "Select Workspace",
      options: workspaceOptions || [],
      placeholder: "Filter by Workspace",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "select",
      name: "boardId",
      label: "Select Board",
      options: taskBoardOptions || [],
      placeholder: "Filter by Board",
      className: "col-span-12 lg:col-span-3 sm:col-span-12",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Create/Update handler
  const submitForm = async (values) => {
    try {
      await addOrUpdateTaskCardMutation.mutateAsync(values);
      refetch();
    } catch (error) {
      console.error("Error submitting workspace:", error);
    }
  };

  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      reset({
        id: item.id,
        name: item.name,
        color: item.color || "#ffffff",
        serial: item.serial || 1,
        isActive: item.isActive,
        workspaceId: item.workspaceId || null,
        boardId: item.boardId || null,
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
            await deleteTaskCardMutation.mutateAsync(id);
          } catch (error) {
            console.error("Error deleting workspace:", error);
          }
        }
      });
    },
    [deleteTaskCardMutation],
  );

  // 🔄 Toggle Status handler
  const handleToggleStatus = useCallback(
    async (id) => {
      try {
        await toggleTaskCardStatusMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error toggling task card status:", error);
      }
    },
    [toggleTaskCardStatusMutation],
  );

  // ➕ Add new workspace handler
  const handleAddWorkspace = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // 🧠 ---------- TABLE ----------
  const columns = useTaskCardsTableColumn({
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
    addOrUpdateTaskCardMutation?.isLoading ||
    deleteTaskCardMutation?.isLoading ||
    toggleTaskCardStatusMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Task Cards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your task cards
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
            <BiPlus /> Add Cards
          </ButtonTw>
        </div>
      </div>

      {/* add or update modal */}
      <AddOrUpdateTaskCardModal
        showModal={showModal}
        handleClose={handleClose}
        isEditing={isEditing}
        control={control}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isLoading={isLoading}
        workspaceOptions={workspaceOptions}
        taskBoardOptions={taskBoardOptions}
      />

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

export default TaskCards;
