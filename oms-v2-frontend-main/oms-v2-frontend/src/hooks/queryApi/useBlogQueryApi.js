import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addOrUpdateBlog,
  deleteBlog,
  fetchBlogByIdAdmin,
  fetchBlogsAdmin,
} from "@/services/blogAdminApi";
import helpers, { toaster } from "@/utils/helpers";

const QUERY_KEY = "blogsAdmin";

export default function useBlogQueryApi({
  reset,
  setError,
  handleClose,
  setShowModal,
  onSaveSuccess,
} = {}) {
  const queryClient = useQueryClient();
  const response = {};

  response.useBlogsAdminQuery = (params = {}) =>
    useQuery({
      queryKey: [QUERY_KEY, params],
      queryFn: () => fetchBlogsAdmin(params),
      keepPreviousData: true,
    });

  response.useBlogByIdQuery = (id, options = {}) =>
    useQuery({
      queryKey: [QUERY_KEY, "detail", id],
      queryFn: () => fetchBlogByIdAdmin(id),
      enabled: !!id && (options.enabled ?? true),
    });

  response.addOrUpdateBlogMutation = useMutation({
    mutationFn: (variables) => addOrUpdateBlog(variables),
    onSuccess: (data, variables) => {
      toaster(
        `Blog post ${variables.id ? "updated" : "created"} successfully`,
        "success"
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (onSaveSuccess) {
        onSaveSuccess(data, variables);
      } else {
        handleClose?.();
      }
    },
    onError: (error, variables) => {
      setShowModal?.(true);
      if (variables) reset?.(variables);
      helpers.handleApiValidationError?.(error, setError);
    },
  });

  response.deleteBlogMutation = useMutation({
    mutationFn: (id) => deleteBlog(id),
    onSuccess: () => {
      toaster("Blog post deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      toaster(error?.response?.data?.message || "Delete failed", "error");
    },
  });

  return response;
}
