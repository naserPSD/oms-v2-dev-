// services/commonServiceApi.js
import RestApi from "@/utils/RestApi";

export const fetchOfficeList = async () => {
  const { data } = await RestApi.get(`/api/v1/hr-management/office/list`, {
    // cache: { next: { revalidate: 3 } } // next.js caching
  });
  return data.data;
};

export const fetchJobInterviewers = async (jobVacancyId) => {
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-job-vacancy-interviewer/${jobVacancyId}`,
  );
  return data.data;
};

export const fetchJobCategoryList = async () => {
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-category/get-all-without-pagination`,
    {
      // cache: { next: { revalidate: 3 } } // next.js caching
    },
  );
  return data.data;
};

export const fetchDesignationList = async () => {
  const { data } = await RestApi.get(`/api/v1/application/designation/list`, {
    // cache: { next: { revalidate: 3 } } // next.js caching
  });
  return data.data;
};

export const fetchDepartmentList = async () => {
  const { data } = await RestApi.get(`/api/v1/application/department/list`, {
    // cache: { next: { revalidate: 3 } } // next.js caching
  });
  return data.data;
};

export const fetchServiceList = async () => {
  const { data } = await RestApi.get(`/api/v1/application/service/list`, {
    // cache: { next: { revalidate: 3 } } // next.js caching
  });
  return data.data;
};
