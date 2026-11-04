"use client";

// path: src/hooks/queryApi/useMyProfileQueryApi.js
import helpers, { toaster } from "@/utils/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNetworkStore } from "@/utils/offline/networkStore";
import {
  endBreakForAuthUser,
  fetchAttendanceAndLeaveSummeryForAuthUser,
  fetchAttendanceSummeryForAuthUser,
  fetchAuthUserInfo,
  fetchEmployeeRecentActivities,
  fetchMyPaymentHistory,
  fetchMySalaryGrade,
  fetchMyTodayDashboardData,
  fetchRecentActivities,
  fetchTotalExperienceAndPromotionForAuthUser,
  startBreakForAuthUser,
  updatePasswordForAuthUser,
} from "@/services/myProfileRelatedApi";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const response = {};

export const useMyProfileQueryApi = ({
  reset = () => { },
  setError = () => { },
  handleClose = () => { },
  setShowModal = () => { },
} = {}) => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();
  const router = useRouter();

  // --- Fetch Data ---
  response.useAttendanceAndLeaveSummeryForAuthUserQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["attendanceAndLeaveSummeryForAuthUser"],
      queryFn: () => fetchAttendanceAndLeaveSummeryForAuthUser(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useTotalExperienceAndPromotionForAuthUserQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["totalExperienceAndPromotionForAuthUser"],
      queryFn: () => fetchTotalExperienceAndPromotionForAuthUser(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useAttendanceSummeryForAuthUserQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["attendanceSummeryForAuthUser"],
      queryFn: () => fetchAttendanceSummeryForAuthUser(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useUpdatePasswordMutation = useMutation({
    mutationFn: (variables) =>
      updatePasswordForAuthUser(variables, ["update-password"]),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["update-password"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["update-password"]);

      // Optimistically update the cache
      queryClient.setQueryData(["update-password"], (old) => {
        if (!old) return [variables];

        return variables;
      });

      // handleClose();

      // Return context with previous update-password
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving service:", error);
      // Rollback on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // // ✅ Keep user input values when resetting form
      reset(variables);

      //setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // queryClient.invalidateQueries({ queryKey: ['update-password'] });
      // queryClient.invalidateQueries({ queryKey: ['update-password'], refetchType: 'none' });
    },
    onSuccess: (data, variables) => {
      toaster(
        `New Password ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      reset();
      queryClient.invalidateQueries({ queryKey: ["update-password"] });
    },
  });

  response.useMyTodayDashboardDataQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["myTodayDashboardData"],
      queryFn: () => fetchMyTodayDashboardData(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useStartBreakMutation = useMutation({
    mutationFn: (variables) =>
      startBreakForAuthUser(variables, ["myTodayDashboardData"]),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["myTodayDashboardData"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["myTodayDashboardData"]);

      // Optimistically update the cache
      queryClient.setQueryData(["myTodayDashboardData"], (old) => {
        if (!old) return [variables];

        return variables;
      });

      // handleClose();

      // Return context with previous update-password
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving service:", error);
      // Rollback on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // // ✅ Keep user input values when resetting form
      reset(variables);

      //setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // queryClient.invalidateQueries({ queryKey: ['update-password'] });
      // queryClient.invalidateQueries({ queryKey: ['update-password'], refetchType: 'none' });
    },
    onSuccess: (data, variables) => {
      toaster(`Break started successfully`, "success");
      queryClient.invalidateQueries({ queryKey: ["myTodayDashboardData"] });
    },
  });

  response.useEndBreakMutation = useMutation({
    mutationFn: (variables) =>
      endBreakForAuthUser(variables, ["myTodayDashboardData"]),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["myTodayDashboardData"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["myTodayDashboardData"]);

      // Optimistically update the cache
      queryClient.setQueryData(["myTodayDashboardData"], (old) => {
        if (!old) return [variables];

        return variables;
      });

      // handleClose();

      // Return context with previous update-password
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving service:", error);
      // Rollback on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // // ✅ Keep user input values when resetting form
      reset(variables);

      //setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // queryClient.invalidateQueries({ queryKey: ['update-password'] });
      // queryClient.invalidateQueries({ queryKey: ['update-password'], refetchType: 'none' });
    },
    onSuccess: (data, variables) => {
      toaster(`Break started successfully`, "success");
      queryClient.invalidateQueries({ queryKey: ["myTodayDashboardData"] });
    },
  });

  response.useFetchMySalaryGradeQuery = (enabled = true) => {
    return useQuery({
      queryKey: ["my_salary_grade"],
      queryFn: () => fetchMySalaryGrade(),
      keepPreviousData: true,
      enabled: isOnline && enabled,
    });
  };

  response.useFetchRecentActivitiesQuery = (queryParams = {}) => {
    return useQuery({
      queryKey: ["my_recent_activities", queryParams],
      queryFn: () => fetchRecentActivities(queryParams),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useFetchEmployeeRecentActivitiesQuery = (
    employeeId,
    queryParams = {},
  ) => {
    return useQuery({
      queryKey: ["employee_recent_activities", employeeId, queryParams],
      queryFn: () => fetchEmployeeRecentActivities(employeeId, queryParams),
      keepPreviousData: true,
      enabled: !!employeeId && isOnline, // only run if employeeId exists
    });
  };

  response.useFetchMyPaymentHistoryQuery = (queryParams = {}) => {
    return useQuery({
      queryKey: ["my_payment_history", queryParams],
      queryFn: () => fetchMyPaymentHistory(queryParams),
      keepPreviousData: true,
      enabled: isOnline, // only fetch if online
    });
  };

  response.useFetchAuthUserInfoQuery = () => {
    return useQuery({
      queryKey: ["authUserInfo"],
      queryFn: fetchAuthUserInfo,
      enabled: isOnline,
      keepPreviousData: true,
    });
  };

  return response;
};
