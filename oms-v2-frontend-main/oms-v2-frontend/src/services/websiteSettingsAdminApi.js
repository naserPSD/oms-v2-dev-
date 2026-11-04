import RestApi, { offlineHandler } from "@/utils/RestApi";

export const fetchWebsiteContentsAdmin = async (params = {}) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: otherParams.sort || "sortOrder:asc",
  }).toString();

  const { data } = await RestApi.get(
    `/api/v1/website-contents/admin/get-all?${queryParams}`
  );
  return data;
};

export const addOrUpdateWebsiteContent = (payload) =>
  offlineHandler.post(() =>
    RestApi.post(`/api/v1/website-contents/admin/add-or-update`, payload)
  );

export const deleteWebsiteContent = (id) =>
  RestApi.delete(`/api/v1/website-contents/admin/delete/${id}`).then(
    (res) => res.data
  );
