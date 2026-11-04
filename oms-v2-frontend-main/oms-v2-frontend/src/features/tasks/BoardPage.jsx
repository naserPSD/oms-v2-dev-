"use client";

import { TabItemTw } from "@/components/ui/TabItemTw";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCommonStore } from "@/store/useCommonStore";
import { useTasksQueryApi } from "@/hooks/queryApi/useTasksQueryApi";
import { useHrQueryApi } from "@/hooks/queryApi/useHrQueryApi";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/utils/zodResolver";
import { z } from "zod";
import Swal from "sweetalert2";
import helpers from "@/utils/helpers";

import { FaCalendar, FaGripVertical, FaList } from "react-icons/fa6";
import { FaProjectDiagram } from "react-icons/fa";
import TaskListView from "@/features/tasks/task-list/TaskListView";
import TaskBoardView from "@/features/tasks/task-list/TaskBoardView";
import CalendarView from "@/features/tasks/task-list/CalendarView";
import GanttView from "@/features/tasks/task-list/GanttView";
import TaskList from "@/features/tasks/task-list/TaskList";
import { useTaskListFilters } from "@/features/tasks/task-list/hooks/useTaskListFilters";
import TaskAssigneeModal from "@/features/tasks/task-list/modals/TaskAssigneeModal";
import TaskCommentModal from "@/features/tasks/task-list/modals/TaskCommentModal";
import WorkspaceBreadcrumb from "@/features/tasks/task-list/WorkspaceBreadcrumb";
import TaskStatusModalChange from "@/features/tasks/task-list/modals/TaskStatusModalChange";
import AddNewBoardModal from "@/features/tasks/task-list/modals/AddNewBoardModal";
import AddNewCardModal from "@/features/tasks/task-list/modals/AddNewCardModal";
import AddTaskListModal from "@/features/tasks/task-list/modals/AddTaskListModal";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/useAuthStore";
import AddWorkSpace from "@/shared/dashBoardSidebar/AddWorkSpace";

// Task schema
const taskSchema = z.object({
  id: z.coerce.number().optional(),
  boardId: z.coerce.number().optional().nullable(),
  workspaceId: z.coerce.number().optional().nullable(),
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional().nullable(),
  dueDate: z.string().min(1, "Due date is required"),
  serial: z.coerce.number().min(1, "Serial number must be at least 1"),
  cardId: z.coerce.number().min(1, "Task card is required"),
  parentTaskId: z.coerce.number().optional().nullable(),
  priorityId: z.coerce.number().min(1, "Priority is required"),
  taskStatusId: z.coerce.number().optional().nullable(),
  taskAssignees: z
    .array(
      z.object({
        taskRoleId: z.coerce.number().optional(),
        assignedOnId: z.coerce.number().optional(),
      }),
    )
    .optional()
    .default([]),
  taskTags: z.array(z.string()).optional().default([]),
});

const initialValues = {
  id: 0,
  boardId: 0,
  workspaceId: 0,
  name: "",
  description: "",
  dueDate: "",
  serial: 1,
  cardId: 0,
  parentTaskId: 0,
  priorityId: 0,
  taskStatusId: 223,
  taskAssignees: [],
  taskTags: [],
};

const BoardPage = ({ workspaceId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdowns = useCommonStore((state) => state.dropdowns);
  const initialLimit =
    parseInt(searchParams.get("limit")) || helpers.perPageListItems;

  // Form state
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

  // Local UI states
  const [canEditTask, setCanEditTask] = useState(false);
  const [showWorkSpaceModal, setShowWorkSpaceModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // For List tab only
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [showModal, setShowModal] = useState(false);
  const [showTaskAssigneeModal, setShowTaskAssigneeModal] = useState(false);
  const [showTaskComments, setShowTaskComments] = useState(false);
  const [showTaskStatus, setshowTaskStatus] = useState(false);
  const [showBoardDetails, setShowBoardDetails] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cardIsOpen, setIsCardOpen] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [showFilter, setShowFilter] = useState(
    localStorage.getItem("showFilter") || "show",
  );
  const [sorting, setSorting] = useState([]);

  // State for selected Card Id
  const [card_Id, SetCard_Id] = useState(null);

  const handleClose = useCallback(() => {
    reset(initialValues);
    SetCard_Id(null);
    setShowModal(false);
  }, [reset]);
  // API hooks
  const {
    useFetchBoardListByWorkspaceIdQuery,
    useFetchCardListByWorkspaceIdQuery,
    useFetchWorkspaceByIdQuery,
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

  // State for selected board
  const [selectedBoardId, setSelectedBoardId] = useState(null);

  const mergedQueryParams = useMemo(() => {
    return {
      ...queryParams,
      workspaceId: Number(workspaceId),
      boardId: selectedBoardId,
    };
  }, [queryParams, workspaceId, selectedBoardId]);

  // Data fetching
  const {
    data: responseData,
    isLoading: isFetching,
    refetch,
  } = useTasksListQuery(mergedQueryParams);

  const { data: parentTaskListData } = useParentTaskListQuery();
  const { data: allCardTaskListData } = useAllCardTaskListQuery();
  const { data: appEmployeeUsers } = useAppEmployeeUsersQuery();

  // Extracted dropdown statuses
  const taskPriorities = useMemo(
    () =>
      dropdowns.statusGroupList?.find((s) => s.code === "task_priorities")
        ?.statuses ?? [],
    [dropdowns.statusGroupList],
  );

  const taskAssigneeRole = useMemo(
    () =>
      dropdowns.statusGroupList?.find((s) => s.code === "task_assignee_roles")
        ?.statuses ?? [],
    [dropdowns.statusGroupList],
  );

  const assignedOnId = useMemo(
    () =>
      dropdowns.statusGroupList?.find((s) => s.code === "assignedOnId")
        ?.statuses ?? [],
    [dropdowns.statusGroupList],
  );

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

  const handleCloseTaskAssigneeModal = () => {
    setShowTaskAssigneeModal(false);
    setSelectedTaskDetails(null);
  };

  const handleViewTaskCommentsModal = useCallback((item) => {
    setSelectedTaskDetails(item);
    setShowTaskComments(true);
  }, []);

  const handleCloseTaskCommentsModal = useCallback(() => {
    setSelectedTaskDetails();
    setShowTaskComments(null);
  }, []);

  const handleStatusChaged = useCallback((item) => {
    setSelectedTaskDetails(item);
    setshowTaskStatus(true);
  }, []);

  const handleStatusChagedClosed = () => {
    setshowTaskStatus(false);
    setSelectedTaskDetails(null);
  };

  const handleAddNewBoard = useCallback((item) => {
    setSelectedTaskDetails(item);
    setShowBoardDetails(true);
    setIsOpen(false);
  }, []);

  const handalAddNewCard = useCallback((item) => {
    setSelectedTaskDetails(item);
    setShowCardDetails(true);
    setIsCardOpen(false);
  }, []);

  // Called when you want to edit a workspace
  const onEditWorkSpace = (workspaceData) => {
    setEditingWorkspace(workspaceData); // set the workspace data to state
    setShowWorkSpaceModal(true); // open the modal
  };

  // Called when closing modal
  const handleCloseModal = () => {
    setShowWorkSpaceModal(false);
    setEditingWorkspace(null); // clear editing data
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
  const handleAddTask = useCallback(
    (cardOrParam) => {
      let resolvedCardId = null;
      let prefilledDueDate = "";

      if (typeof cardOrParam === "number" && cardOrParam > 0) {
        resolvedCardId = cardOrParam;
      } else if (
        cardOrParam &&
        typeof cardOrParam === "object" &&
        !cardOrParam.nativeEvent &&
        !cardOrParam._reactName
      ) {
        if (typeof cardOrParam.cardId === "number" && cardOrParam.cardId > 0) {
          resolvedCardId = cardOrParam.cardId;
        }
        if (cardOrParam.dueDate) {
          prefilledDueDate = cardOrParam.dueDate;
        }
      }

      SetCard_Id(resolvedCardId);
      reset({
        ...initialValues,
        cardId: resolvedCardId || 0,
        dueDate: prefilledDueDate,
        workspaceId: Number(workspaceId),
        boardId: selectedBoardId,
      });
      setCanEditTask(true);
      setShowModal(true);
    },
    [reset, workspaceId, selectedBoardId],
  );

  const authUser = useAuthStore((state) => state.user);

  const isTaskAssigneeAdminOrEditor = (task, userId) => {
    if (!userId || !task) return false;

    // 1. Company Admin or Super Admin can edit any task
    if (
      authUser?.appUseCase === "Admin" ||
      authUser?.role?.name?.toLowerCase() === "admin" ||
      authUser?.role?.name?.toLowerCase() === "super admin"
    ) {
      return true;
    }

    // 2. Task creator can edit their own task
    const creatorId = task?.creatorId || task?.createdById || task?.creator?.id;
    if (creatorId && Number(creatorId) === Number(userId)) {
      return true;
    }

    // 3. If task has no assignees yet, workspace user can edit it
    if (!task?.assignees || task.assignees.length === 0) {
      return true;
    }

    // 4. If assigned, check if user is assignee with Admin (87), Editor (88), or non-viewer role
    const assignee = task.assignees.find(
      (a) =>
        a?.assignedOn?.user?.id === userId ||
        a?.assignedOn?.userId === userId ||
        a?.assignedOnId === authUser?.employeeId,
    );

    if (assignee) {
      if (assignee.taskRoleId === 87 || assignee.taskRoleId === 88) return true;
      return true;
    }

    // Default: allow editing for workspace members
    return true;
  };

  // Edit task handler
  const handleEdit = useCallback(
    (item, isView = false) => {
      if (!authUser?.id) {
        toast.error("User information is still loading. Please try again.");
        return;
      }
      const canEdit = isTaskAssigneeAdminOrEditor(item, authUser.id);

      setCanEditTask(isView ? false : canEdit);

      const resolvedCardId = item.cardId || item.card?.id || 0;
      SetCard_Id(resolvedCardId);

      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const taskAssignees = item.assignees?.map((assignee) => ({
        taskRoleId: assignee.taskRoleId || 0,
        assignedOnId: assignee.assignedOnId || 0,
      })) || [{ taskRoleId: 0, assignedOnId: 0 }];

      const taskTags = item.tags?.map((tag) => tag.name) || [];

      reset({
        id: item.id,
        name: item.name || "",
        description: item.description || "",
        dueDate: formatDateForInput(item.dueDate),
        workspaceId: Number(workspaceId || item.workspaceId || item.workspace?.id || 0),
        boardId: item.boardId || item.board?.id || selectedBoardId || 0,
        serial: item.serial || 1,
        cardId: resolvedCardId,
        parentTaskId: item.parentTaskId || item.parentTask?.id || 0,
        priorityId: item.priorityId || item.priority?.id || 0,
        taskStatusId: item.taskStatusId || item.taskStatus?.id || 223,
        taskAssignees,
        taskTags,
      });

      // 🔑 important
      setShowModal(true);
    },
    [authUser?.id, reset, workspaceId, selectedBoardId],
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
      // cardId source decide
      const finalCardId = Number(values.cardId || card_Id || 0);

      // safety validation
      if (!finalCardId || finalCardId < 1) {
        toast.error("Task card is required");
        return;
      }

      // Check for partially filled assignees
      const rawAssignees = values.taskAssignees || [];
      const hasPartiallyFilled = rawAssignees.some(
        (a) =>
          (Number(a.taskRoleId) > 0 && (!a.assignedOnId || Number(a.assignedOnId) === 0)) ||
          (Number(a.assignedOnId) > 0 && (!a.taskRoleId || Number(a.taskRoleId) === 0)),
      );
      if (hasPartiallyFilled) {
        toast.error("Please select both Role and Assignee for each team member");
        return;
      }

      const validAssignees = rawAssignees
        .filter((a) => Number(a.taskRoleId) > 0 && Number(a.assignedOnId) > 0)
        .map((a) => ({
          taskRoleId: Number(a.taskRoleId),
          assignedOnId: Number(a.assignedOnId),
        }));

      const cardObj = cardListsData.find((c) => c.id === finalCardId);
      const finalBoardId = Number(
        values.boardId || selectedBoardId || cardObj?.boardId || 0,
      );

      const requestData = {
        id: values.id ? Number(values.id) : 0,
        name: values.name,
        description: values.description || "",
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        workspaceId: Number(workspaceId || values.workspaceId),
        boardId: finalBoardId > 0 ? finalBoardId : null,
        cardId: finalCardId,
        parentTaskId:
          values.parentTaskId && Number(values.parentTaskId) > 0
            ? Number(values.parentTaskId)
            : null,
        priorityId: Number(values.priorityId),
        serial: Number(values.serial) || 1,
        taskStatusId: values.taskStatusId ? Number(values.taskStatusId) : 223,
        taskAssignees: validAssignees,
        taskTags: Array.isArray(values.taskTags) ? values.taskTags : [],
      };

      // ✅ SINGLE mutation for both
      await addOrUpdateTaskMutation.mutateAsync(requestData);

      refetch();
    } catch (error) {
      console.error("Error submitting task:", error);
      const apiMessage = error?.response?.data?.message;
      const errorText = Array.isArray(apiMessage)
        ? apiMessage.join(", ")
        : typeof apiMessage === "string"
          ? apiMessage
          : error?.message || "Failed to save task";
      toast.error(errorText);
    }
  };

  // Filter config
  const filterConfig = useMemo(
    () => [
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
        component: "datePicker",
        name: "dueDate",
        label: "Due Date",
        placeholder: "Filter by Due Date",
      },
      {
        component: "clear",
      },
    ],
    [taskPriorities],
  );

  // Loading state
  const isLoading =
    isFetching ||
    addOrUpdateTaskMutation?.isPending ||
    deleteTaskMutation?.isPending ||
    addOrUpdateTaskMutation?.isLoading ||
    deleteTaskMutation?.isLoading;

  const isEditing = watch("id") !== 0;

  // ========== RENDER TAB CONTENT BASED ON ACTIVE TAB ==========

  // Get workspace data
  const { data: workspace, isLoading: isWorkspaceLoading } =
    useFetchWorkspaceByIdQuery(workspaceId);

  // Get board lists
  const {
    data: boardLists,
    isLoading: isBoardLists,
    refetch: refetchBoardLists,
  } = useFetchBoardListByWorkspaceIdQuery(workspaceId);

  // Get Card lists
  const {
    data: cardLists,
    isLoading: isCardLists,
    refetch: refetchCardLists,
  } = useFetchCardListByWorkspaceIdQuery(workspaceId);

  const workspaceData = useMemo(() => workspace?.data || {}, [workspace?.data]);
  const boardListsData = useMemo(
    () => boardLists?.data || [],
    [boardLists?.data],
  );
  const cardListsData = useMemo(() => cardLists?.data || [], [cardLists?.data]);

  const taskCardDropdownOptions = useMemo(() => {
    const currentCards = selectedBoardId
      ? cardListsData.filter((c) => !c.boardId || c.boardId === selectedBoardId)
      : cardListsData;

    if (currentCards?.length > 0) {
      return currentCards.map((c) => ({
        value: c.id,
        label: c.name,
      }));
    }
    return (allCardTaskListData || []).map((c) => ({
      value: c.value ?? c.id,
      label: c.label ?? c.name,
    }));
  }, [cardListsData, selectedBoardId, allCardTaskListData]);

  // Clean combined dropdowns without mutating Zustand store
  const combinedDropdowns = useMemo(() => {
    return {
      ...dropdowns,
      taskAssigneeRole,
      taskPriorities,
      assignedOnId,
      parentTaskList: parentTaskListData || [],
      taskCards: taskCardDropdownOptions,
      employees: appEmployeeUsers || [],
    };
  }, [
    dropdowns,
    taskAssigneeRole,
    taskPriorities,
    assignedOnId,
    parentTaskListData,
    taskCardDropdownOptions,
    appEmployeeUsers,
  ]);

  // Find selected board
  const selectedBoard = useMemo(() => {
    if (!selectedBoardId || !boardListsData.length) return null;
    return boardListsData.find((board) => board.id === selectedBoardId);
  }, [selectedBoardId, boardListsData]);

  // Get dynamic view types from API
  const taskBoardViewTypes = useMemo(() => {
    return (
      dropdowns.statusGroupList?.find((s) => s.code === "task_board_view_types")
        ?.statuses || []
    );
  }, [dropdowns.statusGroupList]);

  // Create dynamic tab config from API response - prioritze selected board's view type
  const TAB_CONFIG = useMemo(() => {
    if (!taskBoardViewTypes || taskBoardViewTypes.length === 0) {
      return [
        {
          key: "task_board_view_type_list",
          label: "Task List",
          icon: <FaList className="w-4 h-4" />,
          code: "task_board_view_type_list",
        },
        {
          key: "task_board_view_type_kanban",
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

  // State for active tab - prioritize selected board's view type
  const [activeTab, setActiveTab] = useState(() => {
    // First check URL param
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_CONFIG.some((tab) => tab.key === tabParam)) {
      return tabParam;
    }

    // Then check selected board's view type
    if (selectedBoard?.viewType?.code) {
      return selectedBoard.viewType.code;
    }

    // Default to first tab
    return TAB_CONFIG[0]?.key || "task_board_view_type_list";
  });

  // Update active tab when selected board changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");

    // যদি user manually tab select করে (URL এ tab আছে)
    if (tabParam) return;

    if (selectedBoard?.viewType?.code) {
      const boardViewType = selectedBoard.viewType.code;

      if (TAB_CONFIG.some((tab) => tab.key === boardViewType)) {
        setActiveTab(boardViewType);

        const params = new URLSearchParams(searchParams);
        params.set("tab", boardViewType);

        router.replace(`/task-workspace/${workspaceId}?${params.toString()}`, {
          scroll: false,
        });
      }
    }
  }, [selectedBoard, TAB_CONFIG, workspaceId, router, searchParams]);

  // Handle board selection
  const handleBoardSelect = (boardId) => {
    setSelectedBoardId(boardId);

    // Update URL with board ID
    const params = new URLSearchParams(searchParams);
    params.set("board", boardId);
    router.push(`/task-workspace/${workspaceId}?${params.toString()}`, {
      scroll: false,
    });
  };

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabKey);
    router.push(`/task-workspace/${workspaceId}?${params.toString()}`, {
      scroll: false,
    });
  };
  // ========== RENDER TAB CONTENT ==========
  const renderTabContent = () => {
    const commonProps = {
      tasks: listData,
      cardListsData: cardListsData,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onViewAssignees: handleVewTaskAssigneeModal,
      onViewComments: handleViewTaskCommentsModal,
      onToggleStatus: handleToggleStatus,
      onUpdateStatus: handleStatusChaged,
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
      dropdowns: combinedDropdowns,
      sorting,
      setSorting,
      setGlobalFilter,
      selectedBoardId,
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

  // Loading state for workspace/board data
  if (isWorkspaceLoading || isBoardLists || isCardLists) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* Breadcrumb */}
      <WorkspaceBreadcrumb
        workspaceData={workspaceData}
        boardListsData={boardListsData}
        selectedBoardId={selectedBoardId}
        onBoardSelect={handleBoardSelect}
        activeTab={activeTab}
        isLoading={isWorkspaceLoading || isBoardLists || isCardLists}
        onAddNewBoard={handleAddNewBoard}
        onAddNewCard={handalAddNewCard}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        setIsCardOpen={setIsCardOpen}
        cardIsOpen={cardIsOpen}
        cardListsData={cardListsData || []}
        onEditWorkSpace={onEditWorkSpace}
      />

      {boardListsData.length ? (
        cardListsData.length ? (
          <>
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
          </>
        ) : (
          <div className="text-center text-xl text-gray-500 mt-6">
            📝 This Board Has No Cards Yet. Add a Card to Manage Tasks.
          </div>
        )
      ) : (
        <div className="text-center text-xl text-gray-500 mt-6">
          You Haven’t Created Any Board Yet. Please Add a Board First to Create
          Card and Task.
        </div>
      )}

      {/* Modals - Common for all tabs */}
      <AddTaskListModal
        showModal={showModal}
        handleClose={handleClose}
        control={control}
        handleSubmit={handleSubmit}
        submitForm={submitForm}
        isEditing={isEditing}
        isLoading={isLoading}
        dropdowns={combinedDropdowns}
        canEditTask={canEditTask}
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

      <TaskStatusModalChange
        showModal={showTaskStatus}
        onClose={handleStatusChagedClosed}
        selectedTaskDetails={selectedTaskDetails}
        refetch={refetch}
      />

      <AddNewBoardModal
        showModal={showBoardDetails}
        setShowBoardDetails={setShowBoardDetails}
        selectedTaskDetails={selectedTaskDetails}
        setSelectedTaskDetails={setSelectedTaskDetails}
        refetchBoardLists={refetchBoardLists}
      />
      <AddNewCardModal
        showModal={showCardDetails}
        setShowCardDetails={setShowCardDetails}
        setSelectedBoardId={setSelectedBoardId}
        selectedTaskDetails={selectedTaskDetails}
        selectedBoardId={selectedBoardId}
        setSelectedTaskDetails={setSelectedTaskDetails}
        refetchCardLists={refetchCardLists}
      />

      <AddWorkSpace
        showModal={showWorkSpaceModal}
        onClose={handleCloseModal}
        workspaceData={editingWorkspace}
      />
    </div>
  );
};

export default BoardPage;
