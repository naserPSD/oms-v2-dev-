"use client";

import { addOrUpdateSubscription, addUserSubscriptionRecord, deleteSubscription, fetchActiveSubscriptions, fetchCompanyPurchaseHistory, fetchCurrentCompanySubscription, fetchSubscriberCompanies, fetchSubscriptions, togglePopularSubscription, toggleStatusSubscription, toggleSubscriberCompanyStatus } from "@/services/subscriptionApi";
import helpers, { toaster } from "@/utils/helpers";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

const response = {};

export const useSubscriptionQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
} = {}) => {
  const queryClient = useQueryClient();

  response.useSubscriptionQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["subscription", params],
      queryFn: () => fetchSubscriptions(params),
      placeholderData: keepPreviousData, // TanStack Query v5 smooth transition
    });
  };

  response.useActiveSubscriptionQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["activeSubscription", params],
      queryFn: () => fetchActiveSubscriptions(params),
      placeholderData: keepPreviousData, // TanStack Query v5 smooth transition
    });
  };

  response.useCurrentCompanySubscriptionQuery = (options = {}) => {
    return useQuery({
      queryKey: ["currentCompanySubscription"],
      queryFn: () => fetchCurrentCompanySubscription(),
      staleTime: 60 * 1000,
      ...options,
    });
  };

  const SUBSCRIPTION_QUERY_KEY = ["subscription"];

  response.addOrUpdateSubscriptionMutation = useMutation({
    mutationFn: (variables) => addOrUpdateSubscription(variables, SUBSCRIPTION_QUERY_KEY),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["subscription"] });

      const allSubscriptionQueries = queryClient.getQueriesData({
        queryKey: ["subscription"],
      });
      const previousQueriesData = new Map(allSubscriptionQueries);

      allSubscriptionQueries.forEach(([queryKey, oldData]) => {
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
                item.id === variables.id ? variables : item
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
        `Notice Note ${variables.id ? "updated" : "added"} successfully`,
        "success"
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  response.deleteSubscriptionMutation = useMutation({
    mutationFn: (id) => deleteSubscription(id, SUBSCRIPTION_QUERY_KEY),
    onMutate: async (id) => {
      const allSubscriptionQueries = queryClient.getQueriesData({
        queryKey: ["subscription"],
      });
      console.log("All queries:", allSubscriptionQueries);

      await queryClient.cancelQueries({ queryKey: ["subscription"] });

      const previousQueriesData = new Map(allSubscriptionQueries);

      allSubscriptionQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          console.log("Updating query:", queryKey, "with data:", old);

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
      toaster("Subscription deleted successfully", "success");
    },
  });

  response.toggleSubscriptionMutation = useMutation({
    mutationFn: (id) => toggleStatusSubscription(id, SUBSCRIPTION_QUERY_KEY),
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allSubscriptionQueries = queryClient.getQueriesData({
        queryKey: ["subscription"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["subscription"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allSubscriptionQueries);

      // Update ALL user queries in the cache
      allSubscriptionQueries.forEach(([queryKey, oldData]) => {
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
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {},
    onSuccess: () => {
      toaster("Subscription status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  response.addUserSubscriptionMutation = useMutation({
    mutationFn: (variables) => addUserSubscriptionRecord(variables, SUBSCRIPTION_QUERY_KEY),
    onSuccess: (data, variables) => {
      toaster(
        `User subscription ${variables.id ? "updated" : "added"} successfully`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["subscription"] }); // Or specific key for user subscriptions if any
    },
    onError: (error) => {
      console.error("Error saving user subscription:", error);
      helpers.handleApiValidationError(error, setError);
    },
  });
  
  response.useSubscriberCompaniesQuery = (params = {}) => {
    return useQuery({
      queryKey: ["subscriberCompanies", params],
      queryFn: () => fetchSubscriberCompanies(params),
      placeholderData: keepPreviousData,
    });
  };

  response.useToggleSubscriberCompanyStatusMutation = useMutation({
    mutationFn: (variables) => toggleSubscriberCompanyStatus(variables),
    onSuccess: (data) => {
      const message =
        data?.message ||
        data?.data?.message ||
        "Company status updated successfully";
      toaster(message, "success");
      queryClient.invalidateQueries({ queryKey: ["subscriberCompanies"] });
      queryClient.invalidateQueries({ queryKey: ["paymentDashboardOverview"] });
    },
    onError: (error) => {
      console.error("Error toggling company status:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update company status";
      toaster(msg, "error");
    },
  });

  const useCompanyPurchaseHistoryQuery = (companyId, options = {}) => {
    return useQuery({
      queryKey: ["companyPurchaseHistory", companyId],
      queryFn: () => fetchCompanyPurchaseHistory(companyId),
      enabled: Boolean(companyId),
      ...options,
    });
  };
  response.useCompanyPurchaseHistoryQuery = useCompanyPurchaseHistoryQuery;

  response.togglePopularSubscriptionMutation = useMutation({
    mutationFn: (id) => togglePopularSubscription(id),
    onSuccess: (data) => {
      const message =
        data?.message ||
        data?.data?.message ||
        "Plan popular status updated successfully";
      toaster(message, "success");
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["activeSubscription"] });
    },
    onError: (error) => {
      console.error("Error toggling popular status:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update popular status";
      toaster(msg, "error");
    },
  });

  return response;
};