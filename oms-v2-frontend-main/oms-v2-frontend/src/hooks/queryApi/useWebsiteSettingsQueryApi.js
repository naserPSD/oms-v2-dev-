import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrUpdateWebsiteContent,
  deleteWebsiteContent,
  fetchWebsiteContentsAdmin,
} from "@/services/websiteSettingsAdminApi";
import helpers, { toaster } from "@/utils/helpers";

const QUERY_KEY = "websiteContents";

export default function useWebsiteSettingsQueryApi({
  reset,
  setError,
  handleClose,
  setShowModal,
} = {}) {
  const queryClient = useQueryClient();
  const response = {};

  response.useWebsiteContentsQuery = (params = {}) =>
    useQuery({
      queryKey: [QUERY_KEY, params],
      queryFn: () => fetchWebsiteContentsAdmin(params),
      keepPreviousData: true,
    });

  response.addOrUpdateWebsiteContentMutation = useMutation({
    mutationFn: (variables) => addOrUpdateWebsiteContent(variables),
    onSuccess: (_, variables) => {
      toaster(
        `Content ${variables.id ? "updated" : "added"} successfully`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      handleClose?.();
    },
    onError: (error, variables) => {
      setShowModal?.(true);
      if (variables) reset?.(variables);
      helpers.handleApiValidationError?.(error, setError);
    },
  });

  response.deleteWebsiteContentMutation = useMutation({
    mutationFn: (id) => deleteWebsiteContent(id),
    onSuccess: () => {
      toaster("Content deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Delete failed", "error");
    },
  });

  return response;
}
