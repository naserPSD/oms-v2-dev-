"use client";

import {
  fetchMyAttendance,
  fetchMyAttendanceHistory,
  fetchMyAttendanceReconciliation,
  requestMyAttendanceReconciliation,
} from "@/services/hrServiceApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const myAttendanceQueryKey = ["my-attendance"];
export const myAttendanceHistoryQueryKey = ["my-attendance-history"];
export const myAttendanceReconciliationQueryKey = ["my-attendance-reconciliation"];

export const useMyAttendanceQuery = (params = {}, enabled = true) => {
  const hasToken =
    typeof window !== "undefined" &&
    !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  return useQuery({
    queryKey: [...myAttendanceQueryKey, params],
    queryFn: () => fetchMyAttendance(params),
    enabled: Boolean(enabled && hasToken),
    staleTime: 30 * 1000,
    retry: false,
  });
};

export const useMyAttendanceHistoryQuery = (params = {}, enabled = true) => {
  const hasToken =
    typeof window !== "undefined" &&
    !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  return useQuery({
    queryKey: [...myAttendanceHistoryQueryKey, params],
    queryFn: () => fetchMyAttendanceHistory(params),
    enabled: Boolean(enabled && hasToken),
    staleTime: 30 * 1000,
    retry: false,
  });
};

export const useMyAttendanceReconciliationQuery = (params = {}, enabled = true) => {
  const hasToken =
    typeof window !== "undefined" &&
    !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  return useQuery({
    queryKey: [...myAttendanceReconciliationQueryKey, params],
    queryFn: () => fetchMyAttendanceReconciliation(params),
    enabled: Boolean(enabled && hasToken),
    staleTime: 30 * 1000,
    retry: false,
  });
};

export const useRequestMyAttendanceReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestMyAttendanceReconciliation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myAttendanceQueryKey });
      queryClient.invalidateQueries({ queryKey: myAttendanceReconciliationQueryKey });
      queryClient.invalidateQueries({ queryKey: myAttendanceHistoryQueryKey });
    },
  });
};
