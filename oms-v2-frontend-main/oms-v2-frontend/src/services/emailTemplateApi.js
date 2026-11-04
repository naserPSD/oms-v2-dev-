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

export const fetchMasterEmailTemplates = async (params) => {
  const { data } = await RestApi.get(
    `/api/v1/email-templates/master${toQuery(params)}`,
  );
  return data;
};

export const saveMasterEmailTemplate = async (payload) => {
  if (payload.id) {
    const { data } = await RestApi.patch(
      `/api/v1/email-templates/master/${payload.id}`,
      payload,
    );
    return data;
  }
  const { data } = await RestApi.post(`/api/v1/email-templates/master`, payload);
  return data;
};

export const deleteMasterEmailTemplate = async (id) => {
  const { data } = await RestApi.delete(`/api/v1/email-templates/master/${id}`);
  return data;
};

export const fetchCompanyEmailTemplates = async (params) => {
  const { data } = await RestApi.get(
    `/api/v1/email-templates/company${toQuery(params)}`,
  );
  return data;
};

export const saveCompanyEmailTemplate = async (payload) => {
  if (payload.id) {
    const { data } = await RestApi.patch(
      `/api/v1/email-templates/company/${payload.id}`,
      payload,
    );
    return data;
  }
  const { data } = await RestApi.post(
    `/api/v1/email-templates/company`,
    payload,
  );
  return data;
};

export const deleteCompanyEmailTemplate = async (id) => {
  const { data } = await RestApi.delete(
    `/api/v1/email-templates/company/${id}`,
  );
  return data;
};

export const fetchImportableEmailTemplates = async () => {
  const { data } = await RestApi.get(`/api/v1/email-templates/importable`);
  return data;
};

export const importEmailTemplate = async (id) => {
  const { data } = await RestApi.post(`/api/v1/email-templates/import/${id}`);
  return data;
};
