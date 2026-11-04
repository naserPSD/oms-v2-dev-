"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchExpenses,
  fetchExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  fetchExpenseSummary,
  uploadExpenseAttachment,
  deleteExpenseAttachment,
  bulkDeleteExpenses,
  bulkUpdateExpenseStatus,
  fetchInvoices,
} from "@/services/accountsApi";
import helpers, { toaster } from "@/utils/helpers";

const response = {};

export const useAccountsQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
} = {}) => {
  const queryClient = useQueryClient();

  // --- QUERIES ---

  response.useInvoicesQuery = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ["accountsInvoices", params],
      queryFn: () => fetchInvoices(params),
      keepPreviousData: true,
      staleTime: 3 * 60 * 1000, // 3 minutes cache
      refetchOnWindowFocus: false,
      ...options,
    });
  };

  response.useExpensesQuery = (params = {}) => {
    return useQuery({
      queryKey: ["expenses", params],
      queryFn: () => fetchExpenses(params),
      keepPreviousData: true,
    });
  };

  response.useExpenseDetailsQuery = (id, options = {}) => {
    return useQuery({
      queryKey: ["expenseDetails", id],
      queryFn: () => fetchExpenseById(id),
      enabled: !!id && (options.enabled ?? true),
    });
  };

  response.useExpenseCategoriesQuery = (params = {}) => {
    return useQuery({
      queryKey: ["expenseCategories", params],
      queryFn: () => fetchExpenseCategories(params),
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: 'always'
    });
  };

  response.useExpenseSummaryQuery = (params = {}) => {
    return useQuery({
      queryKey: ["expenseSummary", params],
      queryFn: () => fetchExpenseSummary(params),
    });
  };

  // --- MUTATIONS: CORE EXPENSE ---

  response.createExpenseMutation = useMutation({
    mutationFn: (payload) => createExpense(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["expenses"] });

      const newItem = {
        id: payload.id || `temp-${Date.now()}`,
        expenseNumber: payload.reference || `EXP-${Date.now().toString().slice(-4)}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };

      previousQueries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return { data: [newItem], pagination: { total: 1, page: 1, limit: 10 } };
          const list = Array.isArray(old.data)
            ? old.data
            : Array.isArray(old)
            ? old
            : [];
          const updatedList = [newItem, ...list];
          return {
            ...old,
            data: updatedList,
            pagination: old.pagination
              ? { ...old.pagination, total: (old.pagination.total || 0) + 1 }
              : { total: updatedList.length, page: 1, limit: 10 },
          };
        });
      });

      handleClose();
      return { previousQueries };
    },
    onError: (error, payload, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      helpers.handleApiValidationError(error, setError);
      setShowModal(true);
    },
    onSuccess: () => {
      toaster("Expense record created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
    },
  });

  response.updateExpenseMutation = useMutation({
    mutationFn: ({ id, payload }) => updateExpense(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["expenses"] });

      previousQueries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          const list = Array.isArray(old.data)
            ? old.data
            : Array.isArray(old)
            ? old
            : [];
          const updatedList = list.map((item) =>
            String(item.id ?? item._id) === String(id)
              ? { ...item, ...payload }
              : item
          );
          return {
            ...old,
            data: updatedList,
          };
        });
      });

      handleClose();
      return { previousQueries };
    },
    onError: (error, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      helpers.handleApiValidationError(error, setError);
      setShowModal(true);
    },
    onSuccess: (_, variables) => {
      toaster("Expense record updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseDetails", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
    },
  });

  response.deleteExpenseMutation = useMutation({
    mutationFn: (id) => deleteExpense(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previousQueriesData = queryClient.getQueriesData({ queryKey: ["expenses"] });

      previousQueriesData.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          const list = Array.isArray(old?.data)
            ? old.data
            : Array.isArray(old)
            ? old
            : [];
          const filtered = list.filter(
            (item) => String(item.id ?? item._id) !== String(id)
          );
          return {
            ...old,
            data: filtered,
            pagination: old.pagination
              ? { ...old.pagination, total: Math.max(0, old.pagination.total - 1) }
              : undefined,
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: () => {
      toaster("Expense record deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
    },
  });

  // --- MUTATIONS: EXPENSE CATEGORY ---

  response.createCategoryMutation = useMutation({
    mutationFn: (payload) => createExpenseCategory(payload),
    onSuccess: () => {
      toaster("Expense category created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      handleClose();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message;
      if (typeof msg === "string") toaster(msg, "error");
      else helpers.handleApiValidationError(error, setError);
      setShowModal(true);
    },
  });

  response.updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => updateExpenseCategory(id, payload),
    onSuccess: () => {
      toaster("Expense category updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      handleClose();
    },
    onError: (error) => {
      const msg = error?.response?.data?.message;
      if (typeof msg === "string") toaster(msg, "error");
      else helpers.handleApiValidationError(error, setError);
      setShowModal(true);
    },
  });

  response.deleteCategoryMutation = useMutation({
    mutationFn: ({ id, source }) => deleteExpenseCategory(id, source),
    onSuccess: () => {
      toaster("Expense category deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message;
      if (typeof msg === "string") toaster(msg, "error");
      else toaster("Failed to delete category", "error");
    }
  });

  // --- QUERIES & MUTATIONS: INCOME CATEGORY ---

  response.useIncomeCategoriesQuery = (params = {}) => {
    return useQuery({
      queryKey: ["incomeCategories", params],
      queryFn: () => import("@/services/accountsApi").then((m) => m.fetchIncomeCategories(params)),
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: 'always'
    });
  };

  response.createIncomeCategoryMutation = useMutation({
    mutationFn: (payload) => import("@/services/accountsApi").then((m) => m.createIncomeCategory(payload)),
    onSuccess: () => {
      toaster("Income category created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["incomeCategories"] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Failed to create category", "error");
    },
  });

  response.updateIncomeCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => import("@/services/accountsApi").then((m) => m.updateIncomeCategory(id, payload)),
    onSuccess: () => {
      toaster("Income category updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["incomeCategories"] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Failed to update category", "error");
    },
  });

  response.deleteIncomeCategoryMutation = useMutation({
    mutationFn: ({ id, source }) => import("@/services/accountsApi").then((m) => m.deleteIncomeCategory(id, source)),
    onSuccess: () => {
      toaster("Income category deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["incomeCategories"] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Failed to delete category", "error");
    },
  });

  // --- MUTATIONS: IMPORT MASTER CATEGORIES ---
  response.importMasterCategoriesMutation = useMutation({
    mutationFn: (payload) => import("@/services/accountsApi").then((m) => m.importMasterCategories(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      queryClient.invalidateQueries({ queryKey: ["incomeCategories"] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Failed to import master categories", "error");
    },
  });

  // --- MUTATIONS: ATTACHMENTS ---

  response.uploadAttachmentMutation = useMutation({
    mutationFn: ({ id, formData }) => uploadExpenseAttachment(id, formData),
    onSuccess: (_, variables) => {
      toaster("Attachment uploaded successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseDetails", variables.id] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Failed to upload attachment", "error");
    },
  });

  response.deleteAttachmentMutation = useMutation({
    mutationFn: ({ id, fileId }) => deleteExpenseAttachment(id, fileId),
    onSuccess: (_, variables) => {
      toaster("Attachment deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseDetails", variables.id] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Failed to delete attachment", "error");
    },
  });

  // --- MUTATIONS: BULK OPERATIONS ---

  response.bulkDeleteExpensesMutation = useMutation({
    mutationFn: (ids) => bulkDeleteExpenses(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["expenses"] });
      const idStrings = ids.map(String);

      previousQueries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          const list = Array.isArray(old.data)
            ? old.data
            : Array.isArray(old)
            ? old
            : [];
          const filtered = list.filter(
            (item) => !idStrings.includes(String(item.id ?? item._id))
          );
          return {
            ...old,
            data: filtered,
          };
        });
      });

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toaster(error?.response?.data?.message || "Bulk deletion failed", "error");
    },
    onSuccess: () => {
      toaster("Selected expenses deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
    },
  });

  response.bulkUpdateExpenseStatusMutation = useMutation({
    mutationFn: ({ ids, status }) => bulkUpdateExpenseStatus(ids, status),
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["expenses"] });
      const idStrings = ids.map(String);

      previousQueries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          const list = Array.isArray(old.data)
            ? old.data
            : Array.isArray(old)
            ? old
            : [];
          const updatedList = list.map((item) =>
            idStrings.includes(String(item.id ?? item._id))
              ? { ...item, status }
              : item
          );
          return {
            ...old,
            data: updatedList,
          };
        });
      });

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toaster(error?.response?.data?.message || "Bulk status update failed", "error");
    },
    onSuccess: () => {
      toaster("Expense statuses updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseSummary"] });
    },
  });

  return response;
};
