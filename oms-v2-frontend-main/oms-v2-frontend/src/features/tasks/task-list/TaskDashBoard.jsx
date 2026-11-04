"use client";

import { TabItemTw } from "@/components/ui/TabItemTw";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCommonStore } from "@/store/useCommonStore";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";
import TaskList from "./TaskList";
import TaskBoardView from "./TaskBoardView";
import AddOrUpdateTaskListModal from "./modals/AddOrUpdateTaskListModal";
import TaskAssigneeModal from "./modals/TaskAssigneeModal";
import TaskCommentModal from "./modals/TaskCommentModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import { z } from "zod";
import Swal from "sweetalert2";
import helpers from "@/utils/helpers";
import { useTaskListFilters } from "./hooks/useTaskListFilters";
import CalendarView from "./CalendarView";
import GanttView from "./GanttView";
import { FaCalendar, FaGripVertical, FaList } from "react-icons/fa6";
import { FaProjectDiagram } from "react-icons/fa";
import TaskListView from "./TaskListView";

// Task schema
const taskSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
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
  dueDate: "",
  completedAt: "",
  serial: 1,
  cardId: 0,
  parentTaskId: 0,
  priorityId: 0,
  taskAssignees: [],
  taskTags: [],
};

const TaskDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // Get dynamic view types from API
  const taskBoardViewTypes = useMemo(() => {
    return (
      dropdowns.statusGroupList?.find((s) => s.code === "task_board_view_types")
        ?.statuses || []
    );
  }, [dropdowns.statusGroupList]);

  console.log("Task Board View Types:", taskBoardViewTypes);

  // Create dynamic tab config from API response
  const TAB_CONFIG = useMemo(() => {
    if (!taskBoardViewTypes || taskBoardViewTypes.length === 0) {
      return [
        {
          key: "task-list",
          label: "Task List",
          icon: <FaList className="w-4 h-4" />,
          code: "task_board_view_type_list",
        },
        {
          key: "task-kanban",
          label: "Kanban Board",
          icon: <FaGripVertical className="w-4 h-4" />,
          code: "task_board_view_type_kanban",
        },
      ];
    }

    const iconMap = {
      task_board_view_type_calendar: <FaCalendar className="w-4 h-4" />,
      task_board_view_type_gantt: <FaProjectDiagram className="w-4 h-4" />,
      task_board_view_type_kanban: <FaGripVertical className="w-4 h-4" />,
      task_board_view_type_list: <FaList className="w-4 h-4" />,
    };

    return taskBoardViewTypes.map((viewType) => ({
      key: viewType.code,
      label: viewType.name,
      icon: iconMap[viewType.code] || "📄",
      code: viewType.code,
      id: viewType.id,
    }));
  }, [taskBoardViewTypes]);

  // State for active tab
  const [activeTab, setActiveTab] = useState(TAB_CONFIG[0]?.key || "task-list");

  // Initialize active tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, TAB_CONFIG]);

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabKey);
    router.push(`/tasks?${params.toString()}`, { scroll: false });
  };

  // ========== ALL STATE AND FUNCTIONS IN PARENT ==========

  // Form state
  const { handleSubmit, control, watch, reset, setError } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Local UI states
  const [viewMode, setViewMode] = useState("table"); // For List tab only
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showTaskAssigneeModal, setShowTaskAssigneeModal] = useState(false);
  const [showTaskComments, setShowTaskComments] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  const handleClose = useCallback(() => {
    reset(initialValues);
    setShowModal(false);
  }, [reset]);
  // API hooks
  const {
    useTasksListQuery,
    addOrUpdateTaskMutation,
    deleteTaskMutation,
    toggleTaskStatusMutation,
    useParentTaskListQuery,
    useAllCardTaskListQuery,
  } = useTasksQueryApi({ reset, setError, handleClose, setShowModal });

  const { useAppEmployeeUsersQuery } = useHrQueryApi({
    reset,
    setError,
    handleClose,
    setShowModal,
  });

  // Filters
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

  // Data fetching
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useTasksListQuery(queryParams);

  const { data: parentTaskListData } = useParentTaskListQuery();
  const { data: allCardTaskListData } = useAllCardTaskListQuery();
  const { data: appEmployeeUsers } = useAppEmployeeUsersQuery();

  // Prepare dropdowns
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
  dropdowns.parentTaskList = parentTaskListData || [];
  dropdowns.taskCards = allCardTaskListData || [];
  dropdowns.employees = appEmployeeUsers || [];

  // Data processing
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

  // ========== ALL HANDLER FUNCTIONS ==========

  // Modal handlers

  const handleVewTaskAssigneeModal = useCallback((item) => {
    setSelectedTaskDetails(item);
    setShowTaskAssigneeModal(true);
  }, []);

  const handleViewTaskCommentsModal = useCallback((item) => {
    setSelectedTaskDetails(item);
    setShowTaskComments(true);
  }, []);

  const handleCloseTaskAssigneeModal = () => {
    setShowTaskAssigneeModal(false);
    setSelectedTaskDetails(null);
  };

  const handleCloseTaskCommentsModal = () => {
    setShowTaskComments(false);
    setSelectedTaskDetails(null);
  };

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => {
      const newValue = prev === "show" ? "hide" : "show";
      localStorage.setItem("showFilter", newValue);
      return newValue;
    });
  }, []);

  // Add task handler
  const handleAddTask = useCallback(() => {
    reset(initialValues);
    setShowModal(true);
  }, [reset]);

  // Edit task handler
  const handleEdit = useCallback(
    (item) => {
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const taskAssignees = item.assignees?.map((assignee) => ({
        taskRoleId: assignee.taskRoleId || 0,
        assignedOnId: assignee.assignedOnId || 0,
      })) || [
        {
          taskRoleId: 0,
          assignedOnId: 0,
        },
      ];

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
        taskAssignees: taskAssignees,
        taskTags: taskTags,
      });
      setShowModal(true);
    },
    [reset],
  );

  // Delete task handler
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

  // Toggle status handler
  const handleToggleStatus = useCallback(
    async (id) => {
      try {
        await toggleTaskStatusMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Error toggling task card status:", error);
      }
    },
    [toggleTaskStatusMutation, refetch],
  );

  // Submit form handler
  const submitForm = async (values) => {
    try {
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

  // Filter config
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
      options: taskPriorities,
      placeholder: "Filter by Priority",
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

  // Loading state
  const isLoading =
    isFetching ||
    addOrUpdateTaskMutation?.isLoading ||
    deleteTaskMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  // ========== RENDER TAB CONTENT BASED ON ACTIVE TAB ==========
  const renderTabContent = () => {
    const commonProps = {
      tasks: listData,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onViewAssignees: handleVewTaskAssigneeModal,
      onViewComments: handleViewTaskCommentsModal,
      onToggleStatus: handleToggleStatus,
      onAddTask: handleAddTask,
      isLoading,
      total,
      refetch,
      filters,
      globalFilter,
      hasActiveFilters,
      filterConfig,
      showFilter: showFilter === "show",
      toggleFilter,
      handleFilterChange,
      clearAllFilters,
      dropdowns,
      sorting,
      setSorting,
      setGlobalFilter,
    };

    const listViewProps = {
      ...commonProps,
      viewMode,
      setViewMode,
      itemsPerPage,
      setItemsPerPage,
      currentPage,
      setCurrentPage,
      pagination,
    };

    switch (activeTab) {
      case "task_board_view_type_list":
        return <TaskListView {...listViewProps} />;

      case "task_board_view_type_kanban":
        return <TaskBoardView {...commonProps} />;

      case "task_board_view_type_calendar":
        return <CalendarView {...commonProps} />;

      case "task_board_view_type_gantt":
        return <GanttView {...commonProps} />;

      default:
        return <TaskList {...listViewProps} />;
    }
  };

console.log("selectedTaskDetails :", selectedTaskDetails);

  return (
    <div className="my-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center text-gray-500 font-bold text-xs mb-4 border-b">
        {TAB_CONFIG.map((tab) => (
          <div key={tab.key}>
            <TabItemTw
              active={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center px-3 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t border-l border-r border-gray-200 dark:border-gray-700"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </TabItemTw>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">{renderTabContent()}</div>

      {/* Modals - Common for all tabs */}
      <AddOrUpdateTaskListModal
        showModal={showModal}
        handleClose={handleClose}
        control={control}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isEditing={isEditing}
        isLoading={isLoading}
        dropdowns={dropdowns}
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
        setShowTaskComments={setShowTaskComments}
      />
    </div>
  );
};

export default TaskDashboard;
