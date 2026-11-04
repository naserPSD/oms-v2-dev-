"use client";
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
import { useTaskListFilters } from "./hooks/useTaskListFilters";
import { useTaskListTableColumn } from "./hooks/useTaskListTableColumn";
import AddOrUpdateTaskListModal from "./modals/AddOrUpdateTaskListModal";
import TaskAssigneeModal from "./modals/TaskAssigneeModal";
import TaskCommentModal from "./modals/TaskCommentModal";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
//import TaskBoardView from "./TaskBoardView";

// Updated schema based on API request body
const taskSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  boardId: z.coerce.number().optional(),
  workspaceId: z.coerce.number().optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
  serial: z.coerce.number().min(1, "Serial number must be at least 1"),
  cardId: z.number().min(1, "Task card is required"),
  parentTaskId: z.number().optional().nullable(),
  priorityId: z.number().min(1, "Priority is required"),
  taskAssignees: z
    .array(
      z.object({
        taskRoleId: z.number().min(1, "Task role is required"),
        assignedOnId: z.number().min(1, "Assignee is required"),
      }),
    )
    .optional()
    .default([]),
  taskTags: z.array(z.string()).optional().default([]),
});

const initialValues = {
  id: 0,
  name: "",
  description: "",
  boardId: 0,
  workspaceId: 0,
  dueDate: "",
  completedAt: "",
  serial: 1,
  cardId: 0,
  parentTaskId: 0,
  priorityId: 0,
  taskAssignees: [],
  taskTags: [],
};
const TaskList = () => {
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const searchParams = useSearchParams();
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;
  //const [viewMode, setViewMode] = useState("table");
  // 📌 Local UI states
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showTaskAssigneeModal, setShowTaskAssigneeModal] = useState(false);
  const [showTaskComments, setShowTaskComments] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  const taskAssigneeRole =
    dropdowns.statusGroupList?.find((s) => s.code === "task_assignee_roles")
      ?.statuses ?? [];
  const assignedOnId =
    dropdowns.statusGroupList?.find((s) => s.code === "assignedOnId")
      ?.statuses ?? [];
  const taskPriorities =
    dropdowns.statusGroupList?.find((s) => s.code === "task_priorities")
      ?.statuses ?? [];

  dropdowns.taskAssigneeRole = taskAssigneeRole;
  dropdowns.taskPriorities = taskPriorities;
  dropdowns.assignedOnId = assignedOnId;

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
  } = useTaskListFilters(itemsPerPage);

  // ⚡ Form
  const {
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    // formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const handleVewTaskAssigneeModal = useCallback((item) => {
    setSelectedTaskDetails(item);
    setShowTaskAssigneeModal(true);
  }, []);

  const handleViewTaskCommentsModal = useCallback((item) => {
    setSelectedTaskDetails(item);
    setShowTaskComments(true);
  }, []);

  // Close modal handler
  const handleCloseTaskAssigneeModal = () => {
    setShowTaskAssigneeModal(false);
    setSelectedTaskDetails(null);
  };

  const handleCloseTaskCommentsModal = () => {
    setShowTaskComments(false);
    setSelectedTaskDetails(null);
  };

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);

  const {
    useTasksListQuery,
    addOrUpdateTaskMutation,
    deleteTaskMutation,
    toggleTaskStatusMutation,
    useParentTaskListQuery,
    useAllCardTaskListQuery,
  } = useTasksQueryApi({ reset, setError, handleClose, setShowModal });
  const {
    useAppEmployeeUsersQuery,
    useTaskWorkspacesQuery,
    useTaskBoardsQuery,
  } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  const { data: parentTaskListData } = useParentTaskListQuery();

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

  const parentTaskList = useMemo(
    () => parentTaskListData || [],
    [parentTaskListData],
  );
  dropdowns.parentTaskList = parentTaskList;

  const { data: allCardTaskListData } = useAllCardTaskListQuery();
  const { data: appEmployeeUsers } = useAppEmployeeUsersQuery();
  dropdowns.employees = appEmployeeUsers || [];

  const allCardTaskList = useMemo(
    () => allCardTaskListData || [],
    [allCardTaskListData],
  );
  dropdowns.taskCards = allCardTaskList;

  // React Query for data fetching with pagination and search
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useTasksListQuery(queryParams);

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
      placeholder: "Search Task Name, Description...",
    },
    {
      component: "select",
      name: "priorityId",
      label: "Priority",
      options:
        dropdowns?.priorities?.map((p) => ({ value: p.id, label: p.name })) ||
        [],
      placeholder: "Filter by Priority",
    },
    {
      component: "select",
      name: "cardId",
      label: "Task Card",
      options:
        dropdowns?.taskCards?.map((c) => ({ value: c.id, label: c.name })) ||
        [],
      placeholder: "Filter by Task Card",
    },
    {
      component: "date",
      name: "dueDate",
      label: "Due Date",
      placeholder: "Filter by Due Date",
    },
    {
      component: "clear",
    },
  ];

  // 📝 Create/Update handler
  // const submitForm = async (values) => {
  //   try {
  //     // Format dates for API
  //     const formattedValues = {
  //       ...values,
  //       dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
  //       completedAt: values.completedAt
  //         ? new Date(values.completedAt).toISOString()
  //         : null,
  //     };

  //     await addOrUpdateTaskMutation.mutateAsync(formattedValues);
  //     refetch();
  //   } catch (error) {
  //     console.error("Error submitting task:", error);
  //   }
  // };

  const submitForm = async (values) => {
    console.log("Submitting form Task values:", values);

    try {
      // Simple date formatting
      const requestData = {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        completedAt: values.completedAt
          ? new Date(values.completedAt).toISOString()
          : null,
      };

      await addOrUpdateTaskMutation.mutateAsync(requestData);
      refetch();
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  // 🔄 Toggle Status handler
  const handleToggleStatus = useCallback(
    async (id) => {
      try {
        await toggleTaskStatusMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error toggling task card status:", error);
      }
    },
    [toggleTaskStatusMutation],
  );
  // 📝 Edit handler
  const handleEdit = useCallback(
    (item) => {
      // Format dates for form input
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      // Extract task assignees from assignees array
      const taskAssignees = item.assignees?.map((assignee) => ({
        taskRoleId: assignee.taskRoleId || 0,
        assignedOnId: assignee.assignedOnId || 0,
      })) || [
        {
          taskRoleId: 0,
          assignedOnId: 0,
        },
      ];

      // Extract tags names from tags array
      const taskTags = item.tags?.map((tag) => tag.name) || [];

      reset({
        id: item.id,
        name: item.name,
        description: item.description || "",
        dueDate: formatDateForInput(item.dueDate),
        completedAt: formatDateForInput(item.completedAt),
        serial: item.serial,
        cardId: item.cardId || 0,
        parentTaskId: item.parentTaskId || 0,
        priorityId: item.priorityId || 0,
        workspaceId: item.workspaceId || null,
        boardId: item.boardId || null,
        taskAssignees: taskAssignees,
        taskTags: taskTags,
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
            await deleteTaskMutation.mutateAsync(id);
            refetch();
          } catch (error) {
            console.error("Error deleting task:", error);
          }
        }
      });
    },
    [deleteTaskMutation, refetch],
  );

  // ➕ Add new task handler
  const handleAddTask = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // 🧠 ---------- TABLE ----------
  const columns = useTaskListTableColumn({
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handleViewTaskCommentsModal,
    handleVewTaskAssigneeModal,
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
    addOrUpdateTaskMutation?.isLoading ||
    deleteTaskMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  return (
    <div>
      <div className="flex items-center justify-between my-5">
        <div>
          <h1 className="title-color font-bold text-2xl">Task List</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your all tasks ({total} tasks found)
          </p>
        </div>
        {/* <div className="flex gap-2">
          <SimpleTooltip
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
          <ButtonTw onClick={handleAddTask} variant="blue" className="gap-2">
            <BiPlus /> Add Task
          </ButtonTw>
        </div> */}
        <div className="flex gap-2">
          <SimpleTooltip
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

          {/* View Toggle Buttons */}
          {/* <SimpleTooltip text="Table View">
            <ButtonTw
              onClick={() => setViewMode("table")}
              variant={viewMode === "table" ? "blue" : "outline"}
              className="gap-2"
            >
              📊
            </ButtonTw>
          </SimpleTooltip>

          <SimpleTooltip text="Card View">
            <ButtonTw
              onClick={() => setViewMode("card")}
              variant={viewMode === "card" ? "blue" : "outline"}
              className="gap-2"
            >
              🗂️
            </ButtonTw>
          </SimpleTooltip> */}

          <ButtonTw onClick={handleAddTask} variant="blue" className="gap-2">
            <BiPlus /> Add Task
          </ButtonTw>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AddOrUpdateTaskListModal
        showModal={showModal}
        handleClose={handleClose}
        control={control}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isEditing={isEditing}
        isLoading={isLoading}
        dropdowns={dropdowns}
        workspaceOptions={workspaceOptions}
        taskBoardOptions={taskBoardOptions}
      />
      <TaskAssigneeModal
        showModal={showTaskAssigneeModal}
        onClose={handleCloseTaskAssigneeModal}
        selectedTaskDetails={selectedTaskDetails}
      />

      <TaskCommentModal
        showModal={showTaskComments}
        onClose={handleCloseTaskCommentsModal}
        selectedTaskDetails={selectedTaskDetails}
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

      {/* Task Table */}
      {/* {viewMode === "card" ? (
        <TaskBoardView
          tasks={listData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewAssignees={handleVewTaskAssigneeModal}
          onViewComments={handleViewTaskCommentsModal}
          viewMode={viewMode}
        />
      ) : ( */}
      <CommonTable
        table={table}
        isFetching={isLoading}
        itemsPerPage={itemsPerPage}
        columns={columns}
        hasActiveFilters={hasActiveFilters}
      />
      {/* )} */}

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

export default TaskList;
