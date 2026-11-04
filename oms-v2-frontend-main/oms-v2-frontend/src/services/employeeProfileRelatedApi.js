// path: src/services/employeeProfileRelatedApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// --- GET Operations ---
export const fetchAttendanceAndLeaveSummeryForEmployee = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/attendance-and-leave-summary/${id}`,
    );
  });
};

export const fetchTotalExperienceAndPromotionForEmployee = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/total-experience-and-promotion-by-employeeId/${id}`,
    );
  });
};

// Attendance summery
export const fetchAttendanceSummeryForEmployee = async (params) => {
  const queryParams = new URLSearchParams({
    params: JSON.stringify(params),
  }).toString();

  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/attendance/get-monthly-attendance-summary?${queryParams}`,
    );
  });
};

export const fetchEmployeeAssetList = async (id) => {
  const employeeId = Number(id);
  if (!Number.isFinite(employeeId) || employeeId <= 0) {
    return { status: "success", data: [] };
  }

  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/get-employee-assets-list/${employeeId}`,
    );
  });
};

export const fetchEmployeeWorkExperienceList = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/get-employee-work-experiences/${id}`,
    );
  });
};

//add and update.... Epmplyee Work Experience With Id
export const addOrUpdateWorkExperienceWithEmployeeId = (payload, employee_id) =>
  RestApi.post(
    `/api/v1/users/add-or-update-work-experience/${employee_id}`,
    payload,
  ).then((res) => res.data);

export const fetchEmployeeEducationList = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/get-employee-educations/${id}`,
    );
  });
};

//add and update.... Epmplyee Education List With Id
export const addOrUpdateEducationListWithEmployeeId = (payload, employee_id) =>
  RestApi.post(
    `/api/v1/users/add-or-update-education/${employee_id}`,
    payload,
  ).then((res) => res.data);

export const fetchEmployeeTrainingList = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/get-employee-training/${id}`,
    );
  });
};

//add and update.... Epmplyee Training With Id
export const addOrUpdateTrainingWithEmployeeId = (payload, employee_id) =>
  RestApi.post(
    `/api/v1/users/add-or-update-training/${employee_id}`,
    payload,
  ).then((res) => res.data);

export const fetchEmployeeReferenceList = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/get-employee-references/${id}`,
    );
  });
};

//add and update.... Epmplyee Training With Id
export const addOrUpdateReferenceWithEmployeeId = (payload, employee_id) =>
  RestApi.post(
    `/api/v1/users/add-or-update-reference/${employee_id}`,
    payload,
  ).then((res) => res.data);

export const fetchEmployeeDetails = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/get-employee-details/${id}`,
    );
  });
};

export const updateEmployeeDetails = async ({ id, payload }) => {
  console.log("payload :", payload);
  console.log("id:", id);

  return RestApi.post(
    `/api/v1/hr-management/employee/update-employee-details/${id}`,
    payload,
  ).then((res) => res.data);
};

export const fetchEmployeeSalaryGradeById = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/payroll/employee/get-employee-salary-grade-info/${id}`,
    );
  });
};
