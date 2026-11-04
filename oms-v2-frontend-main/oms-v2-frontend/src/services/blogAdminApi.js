import RestApi, { offlineHandler } from "@/utils/RestApi";

export const fetchBlogByIdAdmin = async (id) => {
  const { data } = await RestApi.get(`/api/v1/blogs/admin/get-by-id/${id}`);
  return data?.data ?? data;
};

export const fetchBlogsAdmin = async (params = {}) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: otherParams.sort || "publishedAt:desc",
  }).toString();

  const { data } = await RestApi.get(
    `/api/v1/blogs/admin/get-all?${queryParams}`
  );
  return data;
};

export const uploadBlogImage = async (formData) => {
  const { data } = await RestApi.post(
    `/api/v1/blogs/admin/upload-image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

export const addOrUpdateBlog = (payload) =>
  offlineHandler.post(() =>
    RestApi.post(`/api/v1/blogs/admin/add-or-update`, payload)
  );

export const deleteBlog = (id) =>
  RestApi.delete(`/api/v1/blogs/admin/delete/${id}`).then((res) => res.data);
