// src/services/subscriptionApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

const buildQueryParams = ({ page = 1, limit = 10, fields, ...otherParams }) => {
  const query = {
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
  };

  if (fields !== undefined && fields !== null && fields !== "") {
    query.fields = fields;
  }

  return new URLSearchParams(query).toString();
};

// --- GET Operations ---
export const fetchJobPositions = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      // sort: "sortOrder:ASC",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/job/get-all-job-positions?${queryParams}`
    );
  });
};

export const fetchJobPostings = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      // sort: "sortOrder:ASC",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/job/get-all-job-postings?${queryParams}`
    );
  });
};

export const addOrUpdateJobCategory = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/recruitment/job-category/add-or-update`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const fetchJobCategories = async (params) => {
  return offlineHandler.get(async () => {
    const queryParams = buildQueryParams(params || {});
    return RestApi.get(
      `/api/v1/recruitment/job-category/get-all?${queryParams}`,
    );
  });
};

export const deleteJobCategory = async (id) => {
  await RestApi.delete(`/api/v1/recruitment/job-category/delete-by-id/${id}`);
};

export const addOrUpdateJobRecruitmentStepName = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/recruitment/job-recruitment/add-or-update-job-recruitment-step-name`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const fetchJobRecruitmentStepNames = async (params = {}) => {
  return offlineHandler.get(async () => {
    const queryParams = buildQueryParams(params);
    return RestApi.get(
      `/api/v1/recruitment/job-recruitment/get-all-job-recruitment-step-names?${queryParams}`,
    );
  });
};

export const deleteJobRecruitmentStepNameById = async (id) => {
  await RestApi.delete(
    `/api/v1/recruitment/job-recruitment/delete-job-recruitment-step-name-by-id/${id}`,
  );
};