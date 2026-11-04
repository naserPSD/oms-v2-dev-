"use client";

// path: src/hooks/queryApi/useHrQueryApi.js
import helpers, { toaster } from "@/utils/helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNetworkStore } from "@/utils/offline/networkStore";
import { resetFirstPassword } from "@/services/authServiceApi";

const response = {};

export const useAuthQueryApi = ({
  reset = () => {},
  setError = () => {},
  handleClose = () => {},
  setShowModal = () => {},
}) => {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();

  response.useResetFirstPasswordMutation = useMutation({
    mutationFn: resetFirstPassword,

    onMutate: async (variables,) => {
      console.log("variables===", variables);
      return { variables };
    },

    onError: (error, variables, context) => {
      console.error("Error updating employee details:", error);
      reset(variables.payload);
      helpers.handleApiValidationError(error, setError);
    },

    onSuccess: () => {
      toaster("Employee details updated successfully", "success");
    },
  });

  return response;
};
