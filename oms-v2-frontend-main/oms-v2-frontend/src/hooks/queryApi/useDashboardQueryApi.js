"use client";

// path: src/hooks/queryApi/useDashboardQueryApi.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import helpers, { toaster } from "@/utils/helpers";
import {
  acceptMyEmployeeInvitation,
  employeeCheckIn,
  employeeCheckOut,
  fetchDashboardAttendanceStatistics,
  fetchCRMDashboardStats,
  fetchAccountsDashboardStats,
  fetchMyAttendanceToday,
  fetchNotifications,
  getMyEmployeeInvitations,
  markAllReadNotification,
  requestForRemovingLateAttendance,
} from "@/services/dashboardApi";
import { useNetworkStore } from "@/utils/offline/networkStore";
import { useAuthStore } from "@/store/useAuthStore";

const response = {};

export const useDashboardQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
}) => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();

  // --- Fetch All Roles Data ---
  response.useAllNotificationsQuery = () => {
    return useQuery({
      queryKey: ["notificationList"],
      queryFn: () => fetchNotifications(),
      staleTime: 1000 * 4, // fresh for 4s
      gcTime: 1000 * 7, // cache kept for 7s after last unmount
    });
  };

  response.useMarkAllReadMutation = useMutation({
    mutationFn: markAllReadNotification,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["notificationList"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["notificationList"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allUserQueries);

      // Update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousData)
        queryClient.setQueryData(["notificationList"], context.previousData);
      toaster("Failed to update status", "error");
    },
    onSettled: () => {},
    onSuccess: () => {
      // toaster("Notifications marked successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["notificationList"] });
    },
  });

  const myEmployeeInvitationsQueryKey = ["myEmployeeInvitations"];

  response.useMyEmployeeInvitationsQuery = () => {
    return useQuery({
      queryKey: myEmployeeInvitationsQueryKey,
      queryFn: () => getMyEmployeeInvitations(),
    });
  };

  response.acceptEmployeeInvitationMutation = useMutation({
    mutationFn: (id) =>
      acceptMyEmployeeInvitation(id, myEmployeeInvitationsQueryKey),
    onMutate: async (id) => {
      // Get ALL data queries from the cache
      const allDataQueries = queryClient.getQueriesData({
        queryKey: myEmployeeInvitationsQueryKey,
      });

      // Cancel all data queries
      await queryClient.cancelQueries({
        queryKey: myEmployeeInvitationsQueryKey,
      });

      // Store previous data for all queries
      const previousQueriesData = new Map(allDataQueries);

      // Update ALL data queries in the cache
      allDataQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id
                ? {
                    ...item,
                    statusId: item.statusId,
                    confirmedAt: helpers.dateToUtcDateTime(new Date()),
                  }
                : item
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
      toaster("Invitation accepted successfully", "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({
        queryKey: myEmployeeInvitationsQueryKey,
      });
    },
  });

  // ===================================== Start My Attendance =====================================
  response.useFetchDashboardAttendanceStatisticsQuery = (params = {}) => {
    const user = useAuthStore((state) => state.user);
    return useQuery({
      queryKey: ["dashboardAttendanceStats"],
      queryFn: () => fetchDashboardAttendanceStatistics(),
      enabled: isOnline && Boolean(user?.appUseCase),
    });
  };

  response.useFetchCRMDashboardStatsQuery = () => {
    const user = useAuthStore((state) => state.user);
    return useQuery({
      queryKey: ["crmDashboardStats"],
      queryFn: () => fetchCRMDashboardStats(),
      enabled: isOnline && Boolean(user?.appUseCase),
    });
  };

  response.useFetchAccountsDashboardStatsQuery = () => {
    const user = useAuthStore((state) => state.user);
    return useQuery({
      queryKey: ["accountsDashboardStats"],
      queryFn: () => fetchAccountsDashboardStats(),
      enabled: isOnline && Boolean(user?.appUseCase),
    });
  };

  const MY_ATTENDANCE_QUERY_KEY = ["myAttendance"];
  // --- Fetch Data ---
  response.useMyAttendanceQuery = (params = {}) => {
    const user = useAuthStore((state) => state.user);
    return useQuery({
      queryKey: ["myAttendance"],
      queryFn: () => fetchMyAttendanceToday(),
      enabled: isOnline && Boolean(user?.appUseCase),
    });
  };

  // --- Add or Update ---
  response.checkInOrCheckOutAttendanceMutation = useMutation({
    mutationFn: (variables) => {
      // console.log('variables => ', variables);
      if (variables?.id) {
        return employeeCheckOut(variables, MY_ATTENDANCE_QUERY_KEY);
      } else {
        return employeeCheckIn(variables, MY_ATTENDANCE_QUERY_KEY);
      }
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["myAttendance"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["myAttendance"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update the cache
      queryClient.setQueryData(["myAttendance"], (old) => {
        if (!old) return [variables];
        const exists = old.data;
        return exists ? old : variables;
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
      toaster(`Check-${variables?.id ? "Out" : "In"} successfully`, "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["myAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["myTodayDashboardData"] });
    },
  });



  // --- Add or Update ---
  response.requestForRemovingLateAttendanceMutation = useMutation({
    mutationFn: (variables) => {
      return requestForRemovingLateAttendance(variables, MY_ATTENDANCE_QUERY_KEY);
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["myAttendance"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["myAttendance"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      // Optimistically update the cache
      queryClient.setQueryData(["myAttendance"], (old) => {
        if (!old) return [variables];
        const exists = old.data;
        return exists ? old : variables;
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
      toaster(`Request for removing late attendance successfully`, "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["myAttendance"] });
    },
  });

  return response;
};
