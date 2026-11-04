"use client";

// path: src/hooks/queryApi/useCompanySettingsQueryApi.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import helpers, { toaster } from "@/utils/helpers";
import { useCommonStore } from "@/store/useCommonStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchServices,
  addOrUpdateService,
  deleteService,
  toggleServiceStatus,
  fetchDepartments,
  addOrUpdateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  fetchDesignations,
  fetchAllDesignations,
  addOrUpdateDesignation,
  deleteDesignation,
  toggleDesignationStatus,
  reorderDesignations,
  fetchPermissions,
  addOrUpdatePermission,
  deletePermission,
  togglePermissionStatus,
  addOrUpdateUser,
  deleteUser,
  toggleUserStatus,
  fetchUsers,
  fetchRoles,
  addOrUpdateRoleAndPermission,
  deleteRoleAndPermission,
  toggleRoleStatus,
  toggleRoleIsSystemStatus,
  fetchAllRoles,
  togglePermissionSystemStatus,
  togglePermissionRequireStatus,
  fetchAllPermissions,
  fetchAllModulePermissions,
  fetchRoleById,
  fetchCompanyInfo,
  addOrUpdateCompanyInfo,
  addOrUpdateCompanyLogo,
  addOrUpdateCompanyInvoiceLogo,
  fetchParentDepartments,
  fetchDepartmentsDropdown,
  fetchCompanyRoles,
  fetchCompanyRoleById,
  addOrUpdateCompanyRole,
  deleteCompanyRole,
  toggleCompanyRoleStatus,
  fetchCompanyAssignableRoles,
  fetchCompanyAssignablePermissions,
} from "@/services/companySettingsApi";

export const useCompanySettingsQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
} = {}) => {
  const queryClient = useQueryClient();

  // ===================================== Start Service =====================================
  // --- GET Services ---
  // const servicesQuery = useQuery({
  //   queryKey: ["services"],
  //   queryFn: fetchServices,
  // });

  const servicesQuery = (params = {}) => {
    return useQuery({
      queryKey: ["services", params],
      queryFn: () => fetchServices(params),
      keepPreviousData: true,
      // Reduce background refetching to avoid rapid data updates causing repeated renders/logs
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchInterval: false,
    });
  };

  // --- Add or Update ---
  const addOrUpdateServiceMutation = useMutation({
    mutationFn: addOrUpdateService,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["services"] });

      // Get ALL services queries from the cache
      const allServicesQueries = queryClient.getQueriesData({
        queryKey: ["services"],
      });

      // Store previous data for all queries
      const previousQueriesData = new Map(allServicesQueries);

      return { previousQueriesData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving service:", error);
      // Rollback on error
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // ✅ Keep user input values when resetting form
      reset(variables);

      if (error?.response?.status === 409) {
        setError("name", {
          type: "server",
          message:
            error.response.data?.message ||
            "A product or service with this name and type already exists.",
        });
      } else {
        helpers.handleApiValidationError(error, setError);
      }
    },
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onSuccess: (data, variables) => {
      handleClose(); // Close modal only on success
      toaster(
        `Service ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // --- Delete ---
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["services"]);
      const previousData = queryClient.getQueryData(["services"]);
      queryClient.setQueryData(
        ["services"],
        (old) => old?.filter((service) => service.id !== id) || [],
      );
      return { previousData };
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
      toaster("Service deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // --- Toggle Status ---
  const toggleServiceStatusMutation = useMutation({
    mutationFn: toggleServiceStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: ["services"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["services"] });

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
      toaster("Service status changed successfully", "success");
    },
  });

  // ===================================== End Service =====================================

  // ===================================== Start Department =====================================

  const departmentsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["departments", params],
      queryFn: () => fetchDepartments(params),
      keepPreviousData: true,
    });
  };
  // --- Fetch Data ---
  const useDepartmentDropdownQuery = useQuery({
    queryKey: ["departmentsDropdown"],
    queryFn: fetchDepartmentsDropdown,
  });

  const useParentDepartmentQuery = () => {
    return useQuery({
      queryKey: ["parentDepartments"],
      queryFn: () => fetchParentDepartments(),
      keepPreviousData: true,
    });
  };

  // --- Add or Update ---
  const addOrUpdateDepartmentMutation = useMutation({
    mutationFn: addOrUpdateDepartment,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["departments"] });
    },
    onError: (error, variables) => {
      const duplicateNameMessage =
        error.response?.status === 409 &&
        typeof error.response?.data?.message?.name === "string"
          ? error.response.data.message.name
          : null;
      if (duplicateNameMessage) {
        toaster(duplicateNameMessage, "error");
      }

      const isFieldValidationConflict =
        error.response?.status === 409 &&
        typeof error.response?.data?.message === "object";
      if (!isFieldValidationConflict) {
        console.error("Error saving :", error);
      }

      reset(variables);
      setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // queryClient.invalidateQueries({ queryKey: ['services'] });
      // queryClient.invalidateQueries({ queryKey: ['services'], refetchType: 'none' });
    },
    onSuccess: (data, variables) => {
      handleClose();
      toaster(
        `Department ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departmentsDropdown"] });
      queryClient.invalidateQueries({ queryKey: ["parentDepartments"] });
      queryClient.invalidateQueries({ queryKey: ["departmentList"] });
    },
  });

  // --- Delete ---
  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartment,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["departments"]);
      const previousData = queryClient.getQueryData(["departments"]);
      queryClient.setQueryData(
        ["departments"],
        (old) => old?.filter((service) => service.id !== id) || [],
      );
      return { previousData };
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
      toaster("Department deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departmentsDropdown"] });
      queryClient.invalidateQueries({ queryKey: ["parentDepartments"] });
      queryClient.invalidateQueries({ queryKey: ["departmentList"] });
    },
  });

  // --- Toggle Status ---
  const toggleDepartmentStatusMutation = useMutation({
    mutationFn: toggleDepartmentStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: ["departments"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["departments"] });

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
      toaster("Department status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["departmentsDropdown"] });
      queryClient.invalidateQueries({ queryKey: ["parentDepartments"] });
      queryClient.invalidateQueries({ queryKey: ["departmentList"] });
    },
  });

  // ===================================== End Department =====================================

  // ===================================== Start Designation =====================================
  // --- Fetch Data ---
  // const designationsQuery = useQuery({
  //   queryKey: ["designations"],
  //   queryFn: fetchDesignations,
  // });

  const designationsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["designations", params],
      queryFn: () => fetchDesignations(params),
      keepPreviousData: true,
    });
  };

  const allDesignationsQuery = useQuery({
    queryKey: ["all-designations"],
    queryFn: fetchAllDesignations,
    staleTime: 60 * 1000,
  });

  // --- Add or Update ---
  const addOrUpdateDesignationMutation = useMutation({
    mutationFn: addOrUpdateDesignation,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["designations"] });
      const previousData = queryClient.getQueryData(["designations"]);
      return { previousData };
    },
    onError: (error, variables, context) => {
      console.error("Error saving designation:", error);
      if (context?.previousData) {
        queryClient.setQueryData(["designations"], context.previousData);
      }

      const isConflict = error.response?.status === 409;
      const duplicateMessage =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : typeof error.response?.data?.message?.name === "string"
          ? error.response.data.message.name
          : "Designation name already exists";

      if (isConflict) {
        if (typeof setError === "function") {
          setError("name", {
            type: "server",
            message: duplicateMessage,
          });
        }
      } else {
        helpers.handleApiValidationError(
          error,
          setError,
          "Failed to save designation",
          true,
        );
      }
    },
    onSuccess: (data, variables) => {
      handleClose();
      toaster(
        `Designation ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      queryClient.invalidateQueries({ queryKey: ["all-designations"] });
      queryClient.invalidateQueries({ queryKey: ["designationList"] });
    },
  });

  // --- Delete ---
  const deleteDesignationMutation = useMutation({
    mutationFn: deleteDesignation,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["designations"]);
      const previousData = queryClient.getQueryData(["designations"]);
      queryClient.setQueryData(
        ["designations"],
        (old) => old?.filter((item) => item.id !== id) || [],
      );
      return { previousData };
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
      toaster("Designation deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      queryClient.invalidateQueries({ queryKey: ["all-designations"] });
      queryClient.invalidateQueries({ queryKey: ["designationList"] });
    },
  });

  // --- Toggle Status ---
  const toggleDesignationStatusMutation = useMutation({
    mutationFn: toggleDesignationStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allItemsQuery = queryClient.getQueriesData({
        queryKey: ["designations"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["designations"] });

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
      toaster("Designation status changed successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      queryClient.invalidateQueries({ queryKey: ["all-designations"] });
      queryClient.invalidateQueries({ queryKey: ["designationList"] });
    },
  });

  // --- Reorder ---
  const reorderDesignationsMutation = useMutation({
    mutationFn: reorderDesignations,
    onSuccess: () => {
      toaster("Designation order and levels updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      queryClient.invalidateQueries({ queryKey: ["all-designations"] });
      queryClient.invalidateQueries({ queryKey: ["designationList"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error);
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      queryClient.invalidateQueries({ queryKey: ["all-designations"] });
      queryClient.invalidateQueries({ queryKey: ["designationList"] });
    },
  });

  // ===================================== End Designation =====================================

  // ===================================== Start Permission =====================================
  // --- Fetch Data ---
  // const permissionsQuery = useQuery({
  //     queryKey: ['permissions', params],
  //     queryFn: fetchPermissions(params),
  //     keepPreviousData: true, // This prevents UI jumps when changing pages
  // });

  const usePermissionsQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["permissions", JSON.stringify(params)],
      queryFn: () => fetchPermissions(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
    });
  };

  // --- Add or Update ---
  const addOrUpdatePermissionMutation = useMutation({
    mutationFn: addOrUpdatePermission,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL permission queries
      await queryClient.cancelQueries({ queryKey: ["permissions"] });

      // Get all current permission queries for rollback
      const allPermissionQueries = queryClient.getQueriesData({
        queryKey: ["permissions"],
      });
      const previousQueriesData = new Map(allPermissionQueries);

      // Optimistically update ALL permission queries in the cache
      allPermissionQueries.forEach(([queryKey, oldData]) => {
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
      console.error("Error saving permission:", error);

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
        `Permission ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["modulePermissionList"] });
    },
  });

  // --- Delete ---
  const deletePermissionMutation = useMutation({
    mutationFn: deletePermission,
    onMutate: async (id) => {
      // Get ALL permission queries from the cache
      const allPermissionQueries = queryClient.getQueriesData({
        queryKey: ["permissions"],
      });
      console.log("All permission queries:", allPermissionQueries);

      // Cancel all permission queries
      await queryClient.cancelQueries({ queryKey: ["permissions"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allPermissionQueries);

      // Update ALL permission queries in the cache
      allPermissionQueries.forEach(([queryKey, oldData]) => {
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
      toaster("Permission deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  const togglePermissionStatusMutation = useMutation({
    mutationFn: togglePermissionStatus,
    onMutate: async (id) => {
      // Get ALL permission queries from the cache
      const allPermissionQueries = queryClient.getQueriesData({
        queryKey: ["permissions"],
      });

      // Cancel all permission queries
      await queryClient.cancelQueries({ queryKey: ["permissions"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allPermissionQueries);

      // Update ALL permission queries in the cache
      allPermissionQueries.forEach(([queryKey, oldData]) => {
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
      toaster("Permission status changed successfully", "success");
    },
  });

  // --- Toggle Status ---
  const togglePermissionSystemStatusMutation = useMutation({
    mutationFn: togglePermissionSystemStatus,
    onMutate: async (id) => {
      // Get ALL permission queries from the cache
      const allPermissionQueries = queryClient.getQueriesData({
        queryKey: ["permissions"],
      });

      // Cancel all permission queries
      await queryClient.cancelQueries({ queryKey: ["permissions"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allPermissionQueries);

      // Update ALL permission queries in the cache
      allPermissionQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isSystem: !item.isSystem } : item,
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
      toaster("Permission system status changed successfully", "success");
    },
  });

  // --- Toggle Status ---
  const togglePermissionRequireStatusMutation = useMutation({
    mutationFn: togglePermissionRequireStatus,
    onMutate: async (id) => {
      // Get ALL permission queries from the cache
      const allPermissionQueries = queryClient.getQueriesData({
        queryKey: ["permissions"],
      });

      // Cancel all permission queries
      await queryClient.cancelQueries({ queryKey: ["permissions"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allPermissionQueries);

      // Update ALL permission queries in the cache
      allPermissionQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isRequired: !item.isRequired } : item,
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
      toaster("Permission require status changed successfully", "success");
    },
  });

  // ===================================== End Permission =====================================

  // ===================================== Start Users =====================================
  // --- Fetch Data ---
  const useUsersQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["users", params],
      queryFn: async () => {
        try {
          return await fetchUsers(params);
        } catch (error) {
          // Suppress 404 errors - return empty data instead
          if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
            return {
              data: [],
              pagination: {
                page: 1,
                limit: 10,
                total: 0,
                lastPage: 1,
                resultRows: 0,
              },
            };
          }
          throw error;
        }
      },
      keepPreviousData: true, // This prevents UI jumps when changing pages
      // Suppress error logging for 404s (handled gracefully)
      onError: (error) => {
        // Only log non-404 errors or errors that aren't from user endpoints
        if (error?.response?.status !== 404 && !error?._isLeadEndpoint404) {
          console.error("Users fetch error:", error);
        }
      },
    });
  };

  // --- Add or Update ---
  const addOrUpdateUserMutation = useMutation({
    mutationFn: addOrUpdateUser,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Get all current items queries for rollback
      const allItemQueries = queryClient.getQueriesData({
        queryKey: ["users"],
      });
      const previousQueriesData = new Map(allItemQueries);

      // Optimistically update ALL user items in the cache
      allItemQueries.forEach(([queryKey, oldData]) => {
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
      console.error("Error saving user:", error);

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
        `User ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // --- Delete ---
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["users"],
      });
      console.log("All user queries:", allUserQueries);

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allUserQueries);

      // Update ALL user queries in the cache
      allUserQueries.forEach(([queryKey, oldData]) => {
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
      if (context?.previousData)
        queryClient.setQueryData(["users"], context.previousData);
      toaster("Failed to delete data", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onSuccess: () => {
      toaster("User deleted successfully", "success");
    },
  });

  // --- Toggle Status ---
  const toggleUserStatusMutation = useMutation({
    mutationFn: toggleUserStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allUserQueries = queryClient.getQueriesData({
        queryKey: ["users"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["users"] });

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
              item.id === id ? { ...item, isActive: !item.isActive } : item,
            ),
          };
        });
      });

      return { previousQueriesData };
    },
    onError: (err, id, context) => {
      if (context?.previousData)
        queryClient.setQueryData(["users"], context.previousData);
      toaster("Failed to update status", "error");
    },
    onSettled: () => {},
    onSuccess: () => {
      toaster("User status changed successfully", "success");
    },
  });

  // ===================================== End User =====================================

  // ===================================== Start Role and Permissions =====================================

  // --- Fetch All Roles Data ---
  const useAllRolesQuery = () => {
    return useQuery({
      queryKey: ["roleList"],
      queryFn: () => fetchAllRoles(),
      staleTime: 1000 * 4, // fresh for 4s
      gcTime: 1000 * 7, // cache kept for 7s after last unmount
    });
  };

  /** Company Admin–safe role dropdown: Admin + this app's custom roles */
  const useCompanyAssignableRolesQuery = () => {
    return useQuery({
      queryKey: ["companyAssignableRoles"],
      queryFn: () => fetchCompanyAssignableRoles(),
      staleTime: 1000 * 4,
      gcTime: 1000 * 7,
    });
  };

  const useAllPermissionsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["permissionList", params],
      queryFn: () => fetchAllPermissions(params),
      // staleTime: 1000 * 4,         // fresh for 4s
      // gcTime: 1000 * 7,            // cache kept for 7s after last unmount
    });
  };

  const useCompanyAssignablePermissionsQuery = (params = {}) => {
    return useQuery({
      queryKey: ["companyAssignablePermissions", params],
      queryFn: () => fetchCompanyAssignablePermissions(params),
    });
  };

  const useCompanyRolesQuery = (params = {}) => {
    return useQuery({
      queryKey: ["companyRoles", params],
      queryFn: () => fetchCompanyRoles(params),
      keepPreviousData: true,
      refetchOnMount: true,
    });
  };

  const useCompanyRoleByIdQuery = (id, options = {}) => {
    return useQuery({
      queryKey: ["companyRole", id],
      queryFn: () => fetchCompanyRoleById(id),
      enabled: options.enabled !== undefined ? options.enabled : true,
      ...options,
      staleTime: 1000 * 4,
      gcTime: 1000 * 7,
    });
  };

  const addOrUpdateCompanyRoleMutation = useMutation({
    mutationFn: addOrUpdateCompanyRole,
    onError: (error, variables) => {
      reset(variables);

      const errorData = error?.response?.data;
      const apiMessage = errorData?.message;
      const duplicateErrorText = [
        apiMessage,
        errorData?.sqlMessage,
        errorData?.driverError?.message,
      ]
        .filter((message) => typeof message === "string")
        .join(" ");
      const isDuplicateRole =
        errorData?.code === "ER_DUP_ENTRY" ||
        errorData?.errno === 1062 ||
        duplicateErrorText.includes("Duplicate entry") ||
        duplicateErrorText.includes("idx_roles_app_id_name");

      if (isDuplicateRole) {
        setError("name", {
          type: "server",
          message: "A role with this name already exists. Please choose a different name.",
        });
        return;
      }

      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: async (data, variables) => {
      toaster(
        `Company role ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companyRoles"] }),
        queryClient.invalidateQueries({ queryKey: ["companyAssignableRoles"] }),
        queryClient.invalidateQueries({ queryKey: ["roleList"] }),
      ]);
    },
  });

  const deleteCompanyRoleMutation = useMutation({
    mutationFn: deleteCompanyRole,
    onSuccess: () => {
      toaster("Company role deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["companyRoles"] });
      queryClient.invalidateQueries({ queryKey: ["companyAssignableRoles"] });
      queryClient.invalidateQueries({ queryKey: ["roleList"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  const toggleCompanyRoleStatusMutation = useMutation({
    mutationFn: toggleCompanyRoleStatus,
    onSuccess: () => {
      toaster("Company role status updated", "success");
      queryClient.invalidateQueries({ queryKey: ["companyRoles"] });
      queryClient.invalidateQueries({ queryKey: ["companyAssignableRoles"] });
    },
    onError: (error) => {
      helpers.handleApiValidationError(error, setError);
    },
  });

  const useAllModulePermissionsQuery = () => {
    return useQuery({
      queryKey: ["modulePermissionList"],
      queryFn: () => fetchAllModulePermissions(),
      // staleTime: 1000 * 4, // fresh for 4s
      // gcTime: 1000 * 7, // cache kept for 7s after last unmount
    });
  };

  // --- Fetch Data with pagination ---
  const useRolesQuery = (params = {}) => {
    // console.log('params => ', params);
    return useQuery({
      queryKey: ["roles", params],
      queryFn: () => fetchRoles(params),
      keepPreviousData: true, // This prevents UI jumps when changing pages
    });
  };

  const useRoleByIdQuery = (id, options = {}) => {
    // if (!id) return;
    return useQuery({
      queryKey: ["role", id],
      queryFn: () => fetchRoleById(id),
      enabled: options.enabled !== undefined ? options.enabled : true, // <-- use enabled option
      ...options, // spread other options if needed
      staleTime: 1000 * 4, // fresh for 4s
      gcTime: 1000 * 7, // cache kept for 7s after last unmount
    });
  };
  // --- Add or Update ---
  const addOrUpdateRoleMutation = useMutation({
    mutationFn: addOrUpdateRoleAndPermission,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for ALL user queries
      await queryClient.cancelQueries({ queryKey: ["roles"] });

      // Get all current items queries for rollback
      const allItemsQueries = queryClient.getQueriesData({
        queryKey: ["roles"],
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
        `Role and Permission ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["roles"] });

      // Invalidate all roles list
      queryClient.invalidateQueries({ queryKey: ["roleList"] });
    },
  });

  // --- Delete ---
  const deleteRoleMutation = useMutation({
    mutationFn: deleteRoleAndPermission,
    onMutate: async (id) => {
      // Get ALL role queries from the cache
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["roles"],
      });
      console.log("All queries:", allRoleQueries);

      // Cancel all role queries
      await queryClient.cancelQueries({ queryKey: ["roles"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL role queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
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
      toaster("Role deleted successfully", "success");
      // Invalidate all roles list
      queryClient.invalidateQueries({ queryKey: ["roleList"] });
    },
  });

  // --- Toggle Status ---
  const toggleRoleStatusMutation = useMutation({
    mutationFn: toggleRoleStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["roles"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["roles"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL user queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
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
      toaster("Role status changed successfully", "success");
      // Invalidate all roles list
      queryClient.invalidateQueries({ queryKey: ["roleList"] });
    },
  });

  // --- Toggle Status ---
  const toggleRoleIsSystemStatusMutation = useMutation({
    mutationFn: toggleRoleIsSystemStatus,
    onMutate: async (id) => {
      // Get ALL user queries from the cache
      const allRoleQueries = queryClient.getQueriesData({
        queryKey: ["roles"],
      });

      // Cancel all user queries
      await queryClient.cancelQueries({ queryKey: ["roles"] });

      // Store previous data for all queries
      const previousQueriesData = new Map(allRoleQueries);

      // Update ALL user queries in the cache
      allRoleQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !oldData.data) return;

        queryClient.setQueryData(queryKey, (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id ? { ...item, isSystem: !item.isSystem } : item,
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
      toaster("Role is system status changed successfully", "success");
    },
  });

  // ===================================== End Role and Permissions =====================================

  // ===================================== ...Start Company Logo  and company Info get api...Add Get And Upadte..... =====================================

  const useGetCompanyInfoQuery = () => {
    return useQuery({
      queryKey: ["company-Info"],
      queryFn: () => fetchCompanyInfo(),
      staleTime: 10 * 60 * 1000, // Fresh for 10 minutes - avoids constant refetches
      refetchOnWindowFocus: false,
    });
  };

  // --- Add or Update ---
  const addAndUpdateCompanyInfoMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateCompanyInfo(variables, ["company-Info"]),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["company-Info"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["company-Info"]);

      // Optimistically update the cache
      queryClient.setQueryData(["company-Info"], (old) => {
        if (!old) return [variables];

        return variables;
      });

      handleClose();

      // Return context with previous company-Info
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

      // ✅ Keep user input values when resetting form
      reset(variables);

      //setShowModal(true);
      helpers.handleApiValidationError(error, setError);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      // queryClient.invalidateQueries({ queryKey: ['company-Info'] });
      // queryClient.invalidateQueries({ queryKey: ['company-Info'], refetchType: 'none' });
    },
    onSuccess: (data, variables) => {
      toaster(
        `Company Info ${variables.id ? "updated" : "added"} successfully`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["company-Info"] });
    },
  });

  // --- Add or Update Logo---
  const uploadLogoMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateCompanyLogo(variables, ["company-Info"]),
    onError: (error, variables, context) => {
      console.error("Error saving company logo:", error);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (response, variables) => {
      toaster("Company Logo updated successfully", "success");
      const updatedApp = response?.data?.data || response?.data;
      if (updatedApp && typeof updatedApp === "object") {
        queryClient.setQueryData(["company-Info"], (old) => {
          if (!old) return response.data;
          const oldData = old?.data?.data || old?.data || old;
          return {
            ...old,
            data: {
              ...(typeof oldData === "object" ? oldData : {}),
              ...updatedApp,
            },
          };
        });

        try {
          const authState = useAuthStore.getState();
          if (authState?.user) {
            authState.setAuth({
              ...authState,
              user: {
                ...authState.user,
                activeApp: {
                  ...(authState.user.activeApp || {}),
                  ...updatedApp,
                },
              },
            });
          }
        } catch (e) {
          console.warn("Could not sync auth store activeApp logo:", e);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["company-Info"] });
    },
  });

  // --- Add or Update Invoice Logo---
  const uploadInvoiceLogoMutation = useMutation({
    mutationFn: (variables) =>
      addOrUpdateCompanyInvoiceLogo(variables, ["company-Info"]),
    onError: (error, variables, context) => {
      console.error("Error saving company invoice logo:", error);
      helpers.handleApiValidationError(error, setError);
    },
    onSuccess: (response, variables) => {
      toaster("Company Invoice Logo updated successfully", "success");
      const updatedApp = response?.data?.data || response?.data;
      if (updatedApp && typeof updatedApp === "object") {
        queryClient.setQueryData(["company-Info"], (old) => {
          if (!old) return response.data;
          const oldData = old?.data?.data || old?.data || old;
          return {
            ...old,
            data: {
              ...(typeof oldData === "object" ? oldData : {}),
              ...updatedApp,
            },
          };
        });

        try {
          const authState = useAuthStore.getState();
          if (authState?.user) {
            authState.setAuth({
              ...authState,
              user: {
                ...authState.user,
                activeApp: {
                  ...(authState.user.activeApp || {}),
                  ...updatedApp,
                },
              },
            });
          }
        } catch (e) {
          console.warn("Could not sync auth store activeApp invoice logo:", e);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["company-Info"] });
    },
  });

  // ===================================== ...End Company Logo Add Get And Upadte..... =====================================

  return {
    // Services
    servicesQuery,
    addOrUpdateServiceMutation,
    deleteServiceMutation,
    toggleServiceStatusMutation,

    // Departments
    departmentsQuery,
    useDepartmentDropdownQuery,
    addOrUpdateDepartmentMutation,
    deleteDepartmentMutation,
    toggleDepartmentStatusMutation,

    // Designations
    designationsQuery,
    allDesignationsQuery,
    addOrUpdateDesignationMutation,
    deleteDesignationMutation,
    toggleDesignationStatusMutation,
    reorderDesignationsMutation,

    // Permissions
    usePermissionsQuery,
    addOrUpdatePermissionMutation,
    deletePermissionMutation,
    togglePermissionStatusMutation,
    togglePermissionSystemStatusMutation,
    togglePermissionRequireStatusMutation,

    // Users
    useUsersQuery,
    useAllModulePermissionsQuery,
    addOrUpdateUserMutation,
    deleteUserMutation,
    toggleUserStatusMutation,

    // Role And Permissions
    useAllRolesQuery,
    useCompanyAssignableRolesQuery,
    useAllPermissionsQuery,
    useCompanyAssignablePermissionsQuery,
    useCompanyRolesQuery,
    useCompanyRoleByIdQuery,
    addOrUpdateCompanyRoleMutation,
    deleteCompanyRoleMutation,
    toggleCompanyRoleStatusMutation,
    useRolesQuery,
    useRoleByIdQuery,
    addOrUpdateRoleMutation,
    deleteRoleMutation,
    toggleRoleStatusMutation,
    toggleRoleIsSystemStatusMutation,
    addAndUpdateCompanyInfoMutation,
    uploadLogoMutation,
    uploadInvoiceLogoMutation,
    useGetCompanyInfoQuery,
    useParentDepartmentQuery,
    servicesQuery,
  };
};
