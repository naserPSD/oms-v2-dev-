"use client";

// path: src/hooks/queryApi/usePayrollQueryApi.js
import {
  updateTaskCardSerial,
  addOrUpdateTask,
  addOrUpdateTaskCard,
  deleteTask,
  deleteTaskCard,
  fetchAllCardTaskListDropDown,
  fetchAllTask,
  fetchBoardListByWorkspaceId,
  fetchCardListByBoardId,
  fetchCardListByWorkspaceId,
  fetchDashboardPendingTaskList,
  fetchParentTaskListDropDown,
  fetchSingleTaskById,
  fetchTaskCards,
  fetchTaskListByCardId,
  fetchWorkSpaceById,
  fetchWorkspaceListSidebar,
  toggleTaskCardStatus,
  toggleTaskStatus,
  updateTaskStatus,
  workSpace,
  addOrUpdateTaskCommentFile,
  taskCommentFiles,
} from "@/services/tasksServiceApi";
import helpers, { toaster } from "@/utils/helpers";
import { useNetworkStore } from "@/utils/offline/networkStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const response = {};

export const useTasksQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
}) => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();

  // ===================  Task Dropdown Fetch Api List Start ====================

  response.useParentTaskListQuery = () => {
    return useQuery({
      queryKey: ["parentTaskList"],
      queryFn: () => fetchParentTaskListDropDown(),
    });
  };

  response.useAllCardTaskListQuery = () => {
    return useQuery({
      queryKey: ["allCardTaskList"],
      queryFn: () => fetchAllCardTaskListDropDown(),
    });
  };
  // ===================  Task Dropdown Fetch Api List End ====================

  response.useDashboardPendingTaskListQuery = () => {
    return useQuery({
      queryKey: ["dashboardPendingTaskList"],
      queryFn: () => fetchDashboardPendingTaskList(),
    });
  };
  response.useFetchSingleTaskByIdQuery = (id) => {
    return useQuery({
      queryKey: ["fetchSingleTaskById", id],
      queryFn: () => fetchSingleTaskById(id),
      keepPreviousData: true,
      enabled: isOnline && !!id,
    });
  };

  const workspaceListSidebar = ["workspaceListSidebar"];

  response.useWorkspaceListSidebarQuery = () => {
    return useQuery({
      queryKey: ["workspaceListSidebar"],
      queryFn: () => fetchWorkspaceListSidebar(),
    });
  };
  response.useFetchWorkspaceByIdQuery = (id) => {
    return useQuery({
      queryKey: ["fetchWorkSpaceById", id],
      queryFn: () => fetchWorkSpaceById(id),
      keepPreviousData: true,
      enabled: isOnline && !!id,
    });
  };
  response.useFetchBoardListByWorkspaceIdQuery = (id) => {
    return useQuery({
      queryKey: ["fetchBoardListByWorkspaceId", id],
      queryFn: () => fetchBoardListByWorkspaceId(id),
      keepPreviousData: true,
      enabled: isOnline && !!id,
    });
  };

  response.useFetchCardListByWorkspaceIdQuery = (id) => {
    return useQuery({
      queryKey: ["fetchCardListByWorkspaceId", id],
      queryFn: () => fetchCardListByWorkspaceId(id),
      keepPreviousData: true,
      enabled: isOnline && !!id,
    });
  };

  response.useFetchCardListByBoardIdQuery = (id) => {
    return useQuery({
      queryKey: ["fetchCardListByBoardId", id],
      queryFn: () => fetchCardListByBoardId(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };
  response.useFetchTaskListByCardIdQuery = (id) => {
    return useQuery({
      queryKey: ["fetchTaskListByCardId", id],
      queryFn: () => fetchTaskListByCardId(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  // ===================  Tasks List Start ====================

  const tasksListKey = ["tasksList"];
  // --- Fetch Data ---
  response.useTasksListQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["tasksList", params],
      queryFn: () => fetchAllTask(params),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateTaskMutation = useMutation({
    mutationFn: (variables) => addOrUpdateTask(variables, tasksListKey),
    onMutate: async (variables) => {
      console.log(
        "UseTasksQueryApi onMutate called with variables:",
        variables,
      );

      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: tasksListKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: tasksListKey,
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
                item.id === variables.id ? variables : item,
              )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError, "Failed to save task. Please check the form.", true);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Task ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: tasksListKey });
      queryClient.invalidateQueries({ queryKey: ["parentTaskList"] });
    },
  });

  //---Update of serial of task Card
  response.updateTaskCardSerial = useMutation({
    mutationFn: (variables) =>
      updateTaskCardSerial(variables.cards, ["allCardTaskList"]),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["allCardTaskList"] });
      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["allCardTaskList"],
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: variables.cards,
            };
          }

          return {
            ...old,
            data: variables.cards,
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Task Card Serial ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["allCardTaskList"] });
      queryClient.invalidateQueries({ queryKey: tasksListKey });
      queryClient.invalidateQueries({
        queryKey: ["fetchCardListByWorkspaceId", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetchCardListByBoardId", variables.boardId],
      });
    },
  });

  // --- Delete ---
  response.deleteTaskMutation = useMutation({
    mutationFn: (id) => deleteTask(id, tasksListKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: tasksListKey,
      });
      // console.log("All queries:", allItemsQuery);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: tasksListKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allItemsQuery);

      // Update ALL note queries in the cache
      allItemsQuery.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          // console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {},
    onSuccess: () => {
      toaster("Task deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: tasksListKey });
      queryClient.invalidateQueries({ queryKey: ["parentTaskList"] });
    },
  });

  // --- Toggle Status ---
  response.toggleTaskStatusMutation = useMutation({
    mutationFn: (id) => toggleTaskStatus(id, tasksListKey),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: tasksListKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: tasksListKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allItemsQuery);

      // Update ALL user queries in the cache
      allItemsQuery.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {},
    onSuccess: () => {
      toaster("Task status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: tasksListKey });
    },
  });

  // ===================  Tasks Cards Start ====================
  const tasksCardsKey = ["tasksCards"];
  response.useTasksCardsQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["tasksCards", params],
      queryFn: () => fetchTaskCards(params),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateTaskCardMutation = useMutation({
    mutationFn: (variables) => addOrUpdateTaskCard(variables, tasksCardsKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: tasksCardsKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: tasksCardsKey,
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update ALL items queries in the cache
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);
          const newData = exists
            ? old.data.map((item) =>
                item.id === variables.id ? variables : item,
              )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      handleClose();

      // Return context for rollback
      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(
        `Task card ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );

      console.log("Variables on success:", variables);
      // Invalidate to ensure we have the latest data from server
      // queryClient.invalidateQueries({ queryKey: tasksCardsKey });
      queryClient.invalidateQueries({
        queryKey: ["fetchCardListByWorkspaceId", variables.workspaceId],
      });
    },
  });

  //add Work Space....................................

  response.addWorkSpace = useMutation({
    mutationFn: (variables) => workSpace(variables, workspaceListSidebar),

    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: workspaceListSidebar });

      // Snapshot previous cache for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: workspaceListSidebar,
      });
      const previousQueriesData = new Map(allItemsQueries);

      // Optimistic update
      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) {
            return {
              data: [variables],
              pagination: {
                page: 1,
                total: 1,
                limit: 10,
                lastPage: 1,
                resultRows: 1,
              },
            };
          }

          const exists = old.data.some((item) => item.id === variables.id);

          const newData = exists
            ? old.data.map((item) =>
                item.id === variables.id
                  ? {
                      ...item, // ✅ KEEP OLD DATA
                      ...variables, // ✅ APPLY UPDATED FIELDS
                    }
                  : item,
              )
            : [...old.data, variables];

          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: exists ? old.pagination.total : old.pagination.total + 1,
              resultRows: newData.length,
            },
          };
        });
      });

      // Close modal optimistically
      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback cache
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Restore form state
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      toaster(
        `Work Space ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );

      // Ensure latest data from server
      queryClient.invalidateQueries({
        queryKey: workspaceListSidebar,
      });
    },
  });

  // --- Delete ---
  response.deleteTaskCardMutation = useMutation({
    mutationFn: (id) => deleteTaskCard(id, tasksCardsKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: tasksCardsKey,
      });
      // console.log("All queries:", allItemsQuery);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: tasksCardsKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allItemsQuery);

      // Update ALL note queries in the cache
      allItemsQuery.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          // console.log("Updating query:", queryKey, "with data:", old);

          if (!old || !old.data) return old;

          const newData = old.data.filter((item) => item.id !== id);
          return {
            ...old,
            data: newData,
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
              resultRows: newData.length,
            },
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {},
    onSuccess: () => {
      toaster("Task card deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  response.toggleTaskCardStatusMutation = useMutation({
    mutationFn: (id) => toggleTaskCardStatus(id, tasksCardsKey),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allNoteQueries = queryClient.getQueriesData({
        queryKey: tasksCardsKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: tasksCardsKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allNoteQueries);

      // Update ALL user queries in the cache
      allNoteQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {},
    onSuccess: () => {
      toaster("Task Card status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: tasksCardsKey });
    },
  });

  response.updateTaskStatusMutation = useMutation({
    mutationFn: (variables) => {
      updateTaskStatus(variables, tasksListKey);
    },
    onMutate: async (payload) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: tasksListKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: tasksListKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allItemsQuery);

      // Update ALL user queries in the cache
      allItemsQuery.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === payload.id
                ? { ...item, taskStatusId: payload.taskStatusId }
                : item,
            ),
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving:", error);

      // Rollback all queries on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Keep user input values when resetting form
      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (data, variables) => {
      toaster(`Task status updated successfully`, "success");
      handleClose(); // Move here to close on success
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: tasksListKey });
    },
  });
  // ===================  Tasks List End ====================

  //..............For Task Comment File  start ..............////

  response.useTaskcommentQuery = (id) => {
    return useQuery({
      queryKey: ["taskComment", id],
      queryFn: () => taskCommentFiles(id),
      keepPreviousData: true,
      enabled: !!id && isOnline,
    });
  };

  response.addOrUpdateTaskCommentFileMutation = useMutation({
    mutationFn: (variables) => addOrUpdateTaskCommentFile(variables),

    // Optimistic Update
    onMutate: async (variables) => {
      const { taskId, comment } = variables;

      await queryClient.cancelQueries({ queryKey: ["taskComment", taskId] });

      const previousData = queryClient.getQueryData(["taskComment", taskId]);

      queryClient.setQueryData(["taskComment", taskId], (old) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: [
            ...old.data,
            {
              taskId: `temp-${Date.now()}`,
              comment,
              created_at: new Date().toISOString(),
              optimistic: true,
            },
          ],
        };
      });

      return { previousData };
    },

    // ❌ Rollback if error
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["taskComment", variables.taskId],
        context?.previousData,
      );
    },

    // ✅ Success → sync with server
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["taskComment", variables.taskId],
      });

      toaster("Task Comment added successfully", "success");
      setShowModal?.(false);
    },
  });

  //..............For Comment File end ..............////

  return response;
};
