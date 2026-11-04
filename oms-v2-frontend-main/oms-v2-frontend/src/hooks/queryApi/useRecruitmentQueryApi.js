"use client";

import {
  addOrUpdateJobCategory,
  addOrUpdateJobRecruitmentStepName,
  deleteJobRecruitmentStepNameById,
  deleteJobCategory,
  fetchJobCategories,
  fetchJobPositions,
  fetchJobPostings,
  fetchJobRecruitmentStepNames,
} from "@/services/recruitmentApi";
import helpers from "@/utils/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const response = {};

export const useRecruitmentQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
}) => {
  const queryClient = useQueryClient();

  response.useJobPositionQuery = (params = {}) => {
    return useQuery({
      queryKey: ["recruitment", params],
      queryFn: () => fetchJobPositions(params),
      keepPreviousData: true, 
    });
  };

  response.useJobPostingQuery = (params = {}) => {
    return useQuery({
      queryKey: ["recruitment", params],
      queryFn: () => fetchJobPostings(params),
      keepPreviousData: true, 
    });
  };

  response.useJobCategoryQuery = (params = {}) => {
    return useQuery({
      queryKey: ["job-categories", params],
      queryFn: () => fetchJobCategories(params),
      keepPreviousData: true,
    });
  };

  response.addOrUpdateJobCategoryMutation = useMutation({
    mutationFn: (payload) => addOrUpdateJobCategory(payload, ["job-categories"]),
    onSuccess: (_, variables) => {
      helpers.toaster(
        `Job category ${variables?.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["job-categories"] });
      handleClose();
    },
    onError: (error, variables) => {
      reset(variables || {});
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
  });

  response.deleteJobCategoryMutation = useMutation({
    mutationFn: deleteJobCategory,
    onSuccess: () => {
      helpers.toaster("Job category deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["job-categories"] });
    },
  });

  response.useJobRecruitmentStepNameQuery = (params = {}) => {
    return useQuery({
      queryKey: ["job-recruitment-step-names", params],
      queryFn: () => fetchJobRecruitmentStepNames(params),
      keepPreviousData: true,
    });
  };

  response.addOrUpdateJobRecruitmentStepNameMutation = useMutation({
    mutationFn: (payload) =>
      addOrUpdateJobRecruitmentStepName(payload, ["job-recruitment-step-names"]),
    onSuccess: (_, variables) => {
      helpers.toaster(
        `Job recruitment step name ${variables?.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["job-recruitment-step-names"] });
      queryClient.invalidateQueries({ queryKey: ["activeJobRecruitmentStepNames"] });
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },
    onError: (error, variables) => {
      reset(variables || {});
      helpers.handleApiValidationError(error, setError);
    },
  });

  response.deleteJobRecruitmentStepNameMutation = useMutation({
    mutationFn: deleteJobRecruitmentStepNameById,
    onSuccess: () => {
      helpers.toaster("Job recruitment step name deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["job-recruitment-step-names"] });
      queryClient.invalidateQueries({ queryKey: ["activeJobRecruitmentStepNames"] });
      queryClient.invalidateQueries({ queryKey: ["jobVacancy"] });
    },
  });
  
  return response;
}