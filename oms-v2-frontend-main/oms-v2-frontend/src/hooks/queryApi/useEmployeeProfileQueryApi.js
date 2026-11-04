"use client";

// path: src/hooks/queryApi/useHrQueryApi.js
import helpers, { toaster } from "@/utils/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNetworkStore } from "@/utils/offline/networkStore";
import {
  addOrUpdateEducationListWithEmployeeId,
  addOrUpdateReferenceWithEmployeeId,
  addOrUpdateTrainingWithEmployeeId,
  addOrUpdateWorkExperienceWithEmployeeId,
  fetchAttendanceAndLeaveSummeryForEmployee,
  fetchAttendanceSummeryForEmployee,
  fetchEmployeeAssetList,
  fetchEmployeeDetails,
  fetchEmployeeEducationList,
  fetchEmployeeReferenceList,
  fetchEmployeeSalaryGradeById,
  fetchEmployeeTrainingList,
  fetchEmployeeWorkExperienceList,
  fetchTotalExperienceAndPromotionForEmployee,
  updateEmployeeDetails,
} from "@/services/employeeProfileRelatedApi";

const response = {};

export const useEmployeeProfileQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
}) => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();

  response.useAttendanceAndLeaveSummeryForEmployeeQuery = (id) => {
    return useQuery({
      queryKey: ["attendanceAndLeaveSummeryForEmployee"],
      queryFn: () => fetchAttendanceAndLeaveSummeryForEmployee(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useTotalExperienceAndPromotionForEmployeeQuery = (id) => {
    return useQuery({
      queryKey: ["totalExperienceAndPromotionForEmployee", id],
      queryFn: () => fetchTotalExperienceAndPromotionForEmployee(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useAttendanceSummeryForEmployeeQuery = (params = {}) => {
    return useQuery({
      queryKey: ["attendanceSummeryForEmployee", params],
      queryFn: () => fetchAttendanceSummeryForEmployee(params),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  response.useEmployeeAssetListQuery = (id) => {
    const employeeId = id != null && id !== "" ? Number(id) : NaN;
    const isValidEmployeeId = Number.isFinite(employeeId) && employeeId > 0;

    return useQuery({
      queryKey: ["employeeAssetList", isValidEmployeeId ? employeeId : null],
      queryFn: () => fetchEmployeeAssetList(employeeId),
      enabled: isOnline && isValidEmployeeId,
    });
  };

  response.useEmployeeWorkExperienceListQuery = (id) => {
    return useQuery({
      queryKey: ["employeeWorkExperienceList", id],
      queryFn: () => fetchEmployeeWorkExperienceList(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  //add and update.... Epmplyee Work Experience With Id

  response.addOrUpdateWorkExperienceMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateWorkExperienceWithEmployeeId(payload, employee_id),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["employeeWorkExperienceList"],
      });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["employeeWorkExperienceList"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables.payload.id || 0; // 👈 now JSON, no FormData

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return { data: [] };

          const exists = old.data.some((item) => item.id == id);

          return {
            ...old,
            data: exists ? old.data : old.data,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving Work Experience:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.payload.id || 0;

      toaster(
        `Work Experience ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({
        queryKey: ["employeeWorkExperienceList"],
      });
    },
  });

  response.useEmployeeEducationListQuery = (id) => {
    return useQuery({
      queryKey: ["employeeEducationList", id],
      queryFn: () => fetchEmployeeEducationList(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  //add and update.... Epmplyee Work Experience With Id

  response.addOrUpdateEducationListMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateEducationListWithEmployeeId(payload, employee_id),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["employeeEducationList"],
      });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["employeeEducationList"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables.payload.id || 0; // 👈 now JSON, no FormData

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return { data: [] };

          const exists = old.data.some((item) => item.id == id);

          return {
            ...old,
            data: exists ? old.data : old.data,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving Education List:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.payload.id || 0;

      toaster(
        `Education List ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({
        queryKey: ["employeeEducationList"],
      });
    },
  });

  response.useEmployeeTrainingListQuery = (id) => {
    return useQuery({
      queryKey: ["employeeTrainingList", id],
      queryFn: () => fetchEmployeeTrainingList(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  //add and update.... Epmplyee Training With Id

  response.addOrUpdateTrainingMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateTrainingWithEmployeeId(payload, employee_id),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["employeeTrainingList"] });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["employeeTrainingList"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables.payload.id || 0; // 👈 now JSON, no FormData

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return { data: [] };

          const exists = old.data.some((item) => item.id == id);

          return {
            ...old,
            data: exists ? old.data : old.data,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving Training:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.payload.id || 0;

      toaster(
        `Training ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["employeeTrainingList"] });
    },
  });

  response.useEmployeeReferenceListQuery = (id) => {
    return useQuery({
      queryKey: ["employeeReferenceList", id],
      queryFn: () => fetchEmployeeReferenceList(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  //add and update.... Epmplyee Training With Id

  response.addOrUpdateReferenceMutationWithEmployeeId = useMutation({
    mutationFn: ({ payload, employee_id }) =>
      addOrUpdateReferenceWithEmployeeId(payload, employee_id),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["employeeReferenceList"] });

      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["employeeReferenceList"],
      });

      const previousQueriesData = new Map(allItemsQueries);

      const id = variables.payload.id || 0; // 👈 now JSON, no FormData

      allItemsQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return { data: [] };

          const exists = old.data.some((item) => item.id == id);

          return {
            ...old,
            data: exists ? old.data : old.data,
          };
        });
      });

      handleClose();

      return { previousQueriesData };
    },

    onError: (error, variables, context) => {
      console.error("Error saving Reference:", error);

      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: (data, variables) => {
      const id = variables.payload.id || 0;

      toaster(
        `Reference ${id && id != 0 ? "updated" : "added"} successfully`,
        "success",
      );

      queryClient.invalidateQueries({ queryKey: ["employeeReferenceList"] });
    },
  });

  response.useEmployeeDetailsQuery = (id) => {
    return useQuery({
      queryKey: ["employeeDetails", id],
      queryFn: () => fetchEmployeeDetails(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  //Employee Update...........................

  response.updateEmployeeDetailsMutation = useMutation({
    mutationFn: updateEmployeeDetails,

    onMutate: async (variables) => {
      console.log("variables===", variables);

      await queryClient.cancelQueries({
        queryKey: ["employeeDetails", variables.id],
      });

      const previousData = queryClient.getQueryData([
        "employeeDetails",
        variables.id,
      ]);

      // optimistic update
      queryClient.setQueryData(["employeeDetails", variables.id], (old) => ({
        ...old,
        ...variables.payload,
      }));

      handleClose();

      return { previousData };
    },

    onError: (error, variables, context) => {
      console.error("Error updating employee details:", error);

      if (context?.previousData) {
        queryClient.setQueryData(
          ["employeeDetails", variables.id],
          context.previousData,
        );
      }

      reset(variables.payload);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: () => {
      toaster("Employee details updated successfully", "success");

      queryClient.invalidateQueries({
        queryKey: ["employeeDetails"],
      });
    },
  });

  response.useFetchEmployeeSalaryGradeQuery = (id) => {
    return useQuery({
      queryKey: ["emp_salary_grade", id],
      queryFn: () => fetchEmployeeSalaryGradeById(id),
      keepPreviousData: true,
      enabled: isOnline,
    });
  };

  return response;
};
