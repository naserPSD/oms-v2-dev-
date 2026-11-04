"use client";

// path: src/hooks/queryApi/usePayrollQueryApi.js
import helpers, { toaster } from "@/utils/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNetworkStore } from "@/utils/offline/networkStore";
import {
  addOrUpdateEmployeePromotions,
  addOrUpdateEmpMonthlySalaryList,
  addOrUpdatePayItems,
  addOrUpdatePayrollRuns,
  addOrUpdateSalaryGrade,
  addOrUpdateSalaryGradeRules,
  addOrUpdateSalaryStructure,
  deleteBulkEmpMonthlyRecord,
  deleteEmpMonthlyRecord,
  deletePayItems,
  deletePromotion,
  deleteSalaryGrade,
  deleteSalaryGradeRules,
  deleteSalaryStructure,
  fetchEmployeePenaltiesList,
  fetchEmployeePromotions,
  fetchEmployeeSalarytList,
  fetchEmpMonthlySalaryList,
  fetchPayItems,
  fetchPayrollRuns,
  fetchSalaryGrade,
  fetchSalaryGradeRules,
  fetchSalaryStructures,
  getActivePayItemsList,
  getActiveSalaryGradeList,
  getActiveSalaryGradeRuleList,
  payNowBulkEmpMonthlyRecord,
  payNowEmpMonthlySalary,
  toggleStatusPayItems,
  toggleStatusSalaryGrade,
  toggleStatusSalaryGradeRules,
  toggleStatusSalaryStructure,
  toggleTaxablePayItems,
} from "@/services/payrollRelatedApi";

const response = {};

export const usePayrollQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
  setValue = () => {},
}) => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();

  const salaryGradeKey = ["salaryGrades"];
  // --- Fetch Data ---
  response.useSalaryGradeQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["salaryGrades", params],
      queryFn: () => fetchSalaryGrade(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Fetch Data ---
  response.useActiveSalaryGradeQuery = () => {
    return useQuery({
      queryKey: ["activeSalaryGrades"],
      queryFn: () => getActiveSalaryGradeList(),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Fetch Data ---
  response.useActiveSalaryGradeRuleQuery = (params = {}, options = {}) => {
    console.log("params ================> ", params);
    console.log("options ================> ", options);
    // Always call useQuery to preserve hook order across renders.
    // Control whether the query runs using the `enabled` flag.
    const hasParams = params && Object.keys(params).length > 0;
    return useQuery({
      queryKey: ["activeSalaryGradeRules", params],
      queryFn: () => getActiveSalaryGradeRuleList(params),
      keepPreviousData: true,
      enabled: isOnline && hasParams && options.enabled !== false,
      ...options,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateSalaryGradeMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateSalaryGrade(variables, salaryGradeKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: salaryGradeKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: salaryGradeKey,
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
        `Salary grade ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: salaryGradeKey });
      queryClient.invalidateQueries({ queryKey: ["activeSalaryGrades"] });
    },
  });

  // --- Delete ---
  response.deleteSalaryGradeMutation = useMutation({
    mutationFn: (id) => deleteSalaryGrade(id, salaryGradeKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: salaryGradeKey,
      });

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: salaryGradeKey });

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
      toaster("Salary grade deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["activeSalaryGrades"] });
    },
  });

  // --- Toggle Status ---
  response.toggleSalaryGradeStatusMutation = useMutation({
    mutationFn: (id) => toggleStatusSalaryGrade(id, salaryGradeKey),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: salaryGradeKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: salaryGradeKey });

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
      toaster("Salary grade status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: salaryGradeKey });
      queryClient.invalidateQueries({ queryKey: ["activeSalaryGrades"] });
    },
  });

  // Pay Items Start =====================================================================

  const payItemsKey = ["payItems"];
  // --- Fetch Data ---
  response.usePayItemsQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["payItems", params],
      queryFn: () => fetchPayItems(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Fetch Data ---
  response.useActivePayItemQuery = () => {
    return useQuery({
      queryKey: ["activePayItems"],
      queryFn: () => getActivePayItemsList(),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdatePayItemsMutation = useMutation({
    mutationFn: (variables) => addOrUpdatePayItems(variables, payItemsKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: payItemsKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: payItemsKey,
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
        `Pay item ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: payItemsKey });
      queryClient.invalidateQueries({ queryKey: ["activePayItems"] });
    },
  });

  // --- Delete ---
  response.deletePayItemsMutation = useMutation({
    mutationFn: (id) => deletePayItems(id, payItemsKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: payItemsKey,
      });
      // console.log("All queries:", allItemsQuery);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: payItemsKey });

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
      toaster("Pay item deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["activePayItems"] });
    },
  });

  // --- Toggle Status ---
  response.togglePayItemStatusMutation = useMutation({
    mutationFn: (id) => toggleStatusPayItems(id, payItemsKey),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: payItemsKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: payItemsKey });

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
      toaster("Pay item status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: payItemsKey });
      queryClient.invalidateQueries({ queryKey: ["activePayItems"] });
    },
  });

  // --- Toggle Status ---
  response.togglePayItemTaxableMutation = useMutation({
    mutationFn: (id) => toggleTaxablePayItems(id, payItemsKey),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: payItemsKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: payItemsKey });

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
              item.id === id ? { ...item, isTaxable: !item.isTaxable } : item,
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
      toaster("Taxable status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: payItemsKey });
    },
  });

  // ===================== Salary Grade Rules Start ===========================

  const salaryGradeRulesKey = ["salaryGradeRules"];
  // --- Fetch Data ---
  response.useSalaryGradeRulesQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["salaryGradeRules", params],
      queryFn: () => fetchSalaryGradeRules(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateSalaryGradeRulesMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateSalaryGradeRules(variables, salaryGradeRulesKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: salaryGradeRulesKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: salaryGradeRulesKey,
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
        `Salary grade rule ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: salaryGradeRulesKey });
    },
  });

  // --- Delete ---
  response.deleteSalaryGradeRuleMutation = useMutation({
    mutationFn: (id) => deleteSalaryGradeRules(id, salaryGradeRulesKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: salaryGradeRulesKey,
      });
      // console.log("All queries:", allItemsQuery);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: salaryGradeRulesKey });

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
      toaster("Salary grade rule deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  response.toggleSalaryGradeRuleStatusMutation = useMutation({
    mutationFn: (id) => toggleStatusSalaryGradeRules(id, salaryGradeRulesKey),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: salaryGradeRulesKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: salaryGradeRulesKey });

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
      toaster("Salary grade status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: salaryGradeRulesKey });
    },
  });

  // ==================== Salary Grade Rules End ===========================

  // ==================== Salary Structure Start ===========================

  const salaryStructureKey = ["salaryStructures"];
  // --- Fetch Data ---
  response.useSalaryStructuresQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["salaryStructures", params],
      queryFn: () => fetchSalaryStructures(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateSalaryStructureMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateSalaryStructure(variables, salaryStructureKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: salaryStructureKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: salaryStructureKey,
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
        `Salary structure ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: salaryStructureKey });
    },
  });

  // --- Delete ---
  response.deleteSalaryGradeRuleMutation = useMutation({
    mutationFn: (id) => deleteSalaryStructure(id, salaryStructureKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: salaryStructureKey,
      });
      // console.log("All queries:", allItemsQuery);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: salaryStructureKey });

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
      toaster("Salary Structure deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  response.toggleSalaryStructureStatusMutation = useMutation({
    mutationFn: (id) => toggleStatusSalaryStructure(id, salaryStructureKey),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: salaryStructureKey,
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: salaryStructureKey });

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
      toaster("Salary structure status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: salaryStructureKey });
    },
  });
  // ==================== Salary Structure End ===========================

  // ==================== Employee Promotions Start ===========================

  const employeePromotionsKey = ["employeePromotions"];
  // --- Fetch Data ---
  response.useEmployeePromotionsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["employeePromotions", params],
      queryFn: () => fetchEmployeePromotions(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateEmployeePromotionsMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateEmployeePromotions(variables, employeePromotionsKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: employeePromotionsKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: employeePromotionsKey,
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
        `Employee Promotion ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: employeePromotionsKey });
    },
  });

  response.deletePromotionMutation = useMutation({
    mutationFn: (id) => deletePromotion(id, employeePromotionsKey),

    onMutate: async (id) => {
      console.log("id", id);
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: employeePromotionsKey,
      });
      // console.log("All queries:", allItemsQuery);

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: employeePromotionsKey });

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
      toaster("Promotion deleted successfully", "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: employeePromotionsKey });
    },
  });

  const payrollRunsKey = ["payrollRuns"];

  // --- Fetch Data ---
  response.usePayrollRunsQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["payrollRuns", params],
      queryFn: () => fetchPayrollRuns(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdatePayrollRunsMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdatePayrollRuns(variables, payrollRunsKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: payrollRunsKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: payrollRunsKey,
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
      setValue(
        "payPeriodMonthExist",
        error.response?.data?.message?.payPeriodMonthExist,
      );

      // console.log('Submit response:', error.response?.data?.message?.payPeriodMonthExist);
    },
    onSuccess: (data, variables) => {
      toaster(`Payroll month created successfully`, "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: payrollRunsKey });
    },
  });

  const empMonthlySalaryListKey = ["empMonthlySalaryList"];

  // --- Fetch Data ---
  response.useEmpMonthlySalaryListQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["empMonthlySalaryList", params],
      queryFn: () => fetchEmpMonthlySalaryList(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline,
    });
  };

  // --- Add or Update ---
  response.addOrUpdateEmpMonthlySalaryListMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateEmpMonthlySalaryList(variables, empMonthlySalaryListKey),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: empMonthlySalaryListKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: empMonthlySalaryListKey,
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
        `${variables.id ? "Updated" : "Created"} Employee Salary successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: empMonthlySalaryListKey });
    },
  });

  // --- Add or Update ---
  response.payNowEmpMonthlySalaryMutation = useMutation({
    mutationFn: (variables) =>
      payNowEmpMonthlySalary(variables, empMonthlySalaryListKey),
    onMutate: async (variables) => {
      console.log("variables", variables);
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: empMonthlySalaryListKey });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: empMonthlySalaryListKey,
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

          const exists = old.data?.list?.data?.some(
            (item) => item.id === variables.id,
          );
          // const newData = old.data?.list.filter((item) => item.id !== id);
          const newData = exists
            ? old.data?.list?.data?.map((item) =>
                item.id === variables.id ? variables : item,
              )
            : [...old.data?.list?.data, variables];

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
      toaster(`Employee Salary payment updated successfully`, "success");
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: empMonthlySalaryListKey });
    },
  });

  // --- Delete ---
  response.deleteEmpMonthlyRecordMutation = useMutation({
    mutationFn: (id) => deleteEmpMonthlyRecord(id, empMonthlySalaryListKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: empMonthlySalaryListKey,
      });

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: empMonthlySalaryListKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allItemsQuery);

      // Update ALL note queries in the cache
      // allItemsQuery.forEach(([queryKey, oldData]) => {
      //   if (!oldData || !oldData.data) return;

      //   queryClient.setQueryData(queryKey, (old) => {
      //     // console.log("Updating query:", queryKey, "with data:", old);

      //     if (!old || !old.data) return old;

      //     console.log("Updating query:", queryKey, "with data:", old);

      //     const newData = old.data?.list?.data?.filter((item) => item.id !== id);
      //     return {
      //       ...old.data?.list?.data,
      //       data: newData,
      //       pagination: {
      //         ...old.pagination,
      //         total: old.pagination.total - 1,
      //         resultRows: newData.length,
      //       },
      //     };
      //   });
      // });

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
      toaster("Employee Salary payment deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: empMonthlySalaryListKey });
    },
  });

  // --- Delete ---
  response.deleteBulkEmpMonthlyRecordMutation = useMutation({
    mutationFn: (id) => deleteBulkEmpMonthlyRecord(id, empMonthlySalaryListKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: empMonthlySalaryListKey,
      });

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: empMonthlySalaryListKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allItemsQuery);

      // Update ALL note queries in the cache
      // allItemsQuery.forEach(([queryKey, oldData]) => {
      //   if (!oldData || !oldData.data) return;

      //   queryClient.setQueryData(queryKey, (old) => {
      //     // console.log("Updating query:", queryKey, "with data:", old);

      //     if (!old || !old.data) return old;

      //     console.log("Updating query:", queryKey, "with data:", old);

      //     const newData = old.data?.list?.data?.filter((item) => item.id !== id);
      //     return {
      //       ...old.data?.list?.data,
      //       data: newData,
      //       pagination: {
      //         ...old.pagination,
      //         total: old.pagination.total - 1,
      //         resultRows: newData.length,
      //       },
      //     };
      //   });
      // });

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
      toaster("Employee Salary payment deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: empMonthlySalaryListKey });
    },
  });

  // --- Pay Now ---
  response.payNowBulkEmpMonthlyRecordMutation = useMutation({
    mutationFn: (id) => payNowBulkEmpMonthlyRecord(id, empMonthlySalaryListKey),
    onMutate: async (id) => {
      // Get ALL note queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: empMonthlySalaryListKey,
      });

      // Cancel all note queries
      await queryClient.cancelQueries({ queryKey: empMonthlySalaryListKey });

      // Store previous data for all queries
      const previousQueriesData = new Map(allItemsQuery);

      // Update ALL note queries in the cache
      // allItemsQuery.forEach(([queryKey, oldData]) => {
      //   if (!oldData || !oldData.data) return;

      //   queryClient.setQueryData(queryKey, (old) => {
      //     // console.log("Updating query:", queryKey, "with data:", old);

      //     if (!old || !old.data) return old;

      //     console.log("Updating query:", queryKey, "with data:", old);

      //     const newData = old.data?.list?.data?.filter((item) => item.id !== id);
      //     return {
      //       ...old.data?.list?.data,
      //       data: newData,
      //       pagination: {
      //         ...old.pagination,
      //         total: old.pagination.total - 1,
      //         resultRows: newData.length,
      //       },
      //     };
      //   });
      // });

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
      toaster("Employee Salary paid successfully", "success");
      queryClient.invalidateQueries({ queryKey: empMonthlySalaryListKey });
    },
  });

  // --- Fetch Data ---
  response.useEmployeePenaltiesListQuery = (params = {}) => {
    // Only enable this query when we have meaningful params (e.g., empId)
    const hasParams =
      params && Object.keys(params).length > 0 && Boolean(params.empId);

    return useQuery({
      queryKey: ["empPenaltyList", params],
      queryFn: () => fetchEmployeePenaltiesList(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
      enabled: isOnline && hasParams,
    });
  };

  //get Select Employee By Id

  response.useEmployeeSalarytListQuery = (employeeId, options = {}) => {
    return useQuery({
      queryKey: ["employeeSalaryList", employeeId],
      queryFn: () => fetchEmployeeSalarytList(employeeId),
      keepPreviousData: true,
      ...options,
      enabled:
        isOnline &&
        Boolean(employeeId) &&
        options.enabled !== false,
    });
  };

  return response;
};
