import RestApi from "@/utils/RestApi";

const toQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchBroadcastRecipients = async () => {
  const { data } = await RestApi.get(`/api/v1/email-broadcasts/recipients`);
  return data;
};

export const fetchCompanyEmailBroadcasts = async (params) => {
  const { data } = await RestApi.get(
    `/api/v1/email-broadcasts${toQuery(params)}`,
  );
  return data;
};

export const saveCompanyEmailBroadcast = async (payload) => {
  if (payload.id) {
    const { data } = await RestApi.patch(
      `/api/v1/email-broadcasts/${payload.id}`,
      payload,
    );
    return data;
  }
  const { data } = await RestApi.post(`/api/v1/email-broadcasts`, payload);
  return data;
};

export const sendCompanyEmailBroadcast = async (id) => {
  const { data } = await RestApi.post(`/api/v1/email-broadcasts/${id}/send`);
  return data;
};

export const deleteCompanyEmailBroadcast = async (id) => {
  const { data } = await RestApi.delete(`/api/v1/email-broadcasts/${id}`);
  return data;
};
