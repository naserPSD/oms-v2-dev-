"use client";

// path: src/hooks/queryApi/useCommonQueryApi.js
import {
  fetchDepartmentList,
  fetchDesignationList,
  fetchJobCategoryList,
  fetchJobInterviewers,
  fetchOfficeList,
  fetchServiceList,
} from "@/services/commonServiceApi";
import helpers, { toaster } from "@/utils/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const response = {};

export const useCommonQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
}) => {
  const queryClient = useQueryClient();

  // ===============================================================================================

  response.useOfficeListQuery = () => {
    return useQuery({
      queryKey: ["officeList"],
      queryFn: () => fetchOfficeList(),
      // staleTime: 1000 * 4,         // fresh for 4s
      // gcTime: 1000 * 7,            // cache kept for 7s after last unmount
    });
  };

  response.useJobInterviewersQuery = (jobVacancyId, options = {}) => {
    return useQuery({
      queryKey: ["jobInterviewers", jobVacancyId],
      queryFn: () => fetchJobInterviewers(jobVacancyId),
      enabled: !!jobVacancyId, 
      ...options,
    });
  };

  response.useJobCategoryListQuery = () => {
    return useQuery({
      queryKey: ["jobCategoryList"],
      queryFn: () => fetchJobCategoryList(),
      // staleTime: 1000 * 4,         // fresh for 4s
      // gcTime: 1000 * 7,            // cache kept for 7s after last unmount
    });
  };

  response.useDesignationListQuery = () => {
    return useQuery({
      queryKey: ["designationList"],
      queryFn: () => fetchDesignationList(),
      // staleTime: 1000 * 4,         // fresh for 4s
      // gcTime: 1000 * 7,            // cache kept for 7s after last unmount
    });
  };

  response.useDepartmentListQuery = () => {
    return useQuery({
      queryKey: ["departmentList"],
      queryFn: () => fetchDepartmentList(),
      // staleTime: 1000 * 4,         // fresh for 4s
      // gcTime: 1000 * 7,            // cache kept for 7s after last unmount
    });
  };

  response.useServiceListQuery = () => {
    return useQuery({
      queryKey: ["serviceList"],
      queryFn: () => fetchServiceList(),
      // staleTime: 1000 * 4,         // fresh for 4s
      // gcTime: 1000 * 7,            // cache kept for 7s after last unmount
    });
  };

  // Reset tanstack query cache. I don't refetch here, just make it empty the cache.
  response.useResetTanstackCache = () => {
    return queryClient.resetQueries();
    // queryClient.clear();
  };

  // ===============================================================================================

  return response;
};
