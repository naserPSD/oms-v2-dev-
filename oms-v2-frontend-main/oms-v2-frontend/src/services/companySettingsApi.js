// services/companySettingsApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// ========================= Start Services ========================
// export const fetchServices = async () => {
//   const { data } = await RestApi.get(`/api/v1/application/get-app-services`, {
//     // cache: { next: { revalidate: 3 } } // next.js caching
//   });
//   return data.data;
// };

export const fetchServices = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "name:ASC",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/application/get-app-services-with-pagination?${queryParams}`,
  );
  return data;
};

export const checkServiceDuplicate = async ({ name, typeId, id }) => {
  const normalizedName = String(name ?? "").trim();
  const normalizedTypeId = Number(typeId);

  if (!normalizedName || !Number.isInteger(normalizedTypeId) || normalizedTypeId < 1) {
    return false;
  }

  try {
    const data = await fetchServices({
      page: 1,
      limit: 10,
      name: normalizedName,
      typeId: normalizedTypeId,
    });
    
    const items = data?.data || [];
    const isDuplicate = items.some(
      (item) =>
        item.name.toLowerCase() === normalizedName.toLowerCase() &&
        item.typeId === normalizedTypeId &&
        item.id !== id
    );
    return isDuplicate;
  } catch (error) {
    console.warn("Service duplicate check failed:", error?.response?.data || error);
    // If the check fails, we throw an error so the frontend knows it couldn't verify
    throw new Error("Could not verify duplicate");
  }
};

export const addOrUpdateService = (payload) =>
  RestApi.post(`/api/v1/application/add-or-update-service`, payload).then(
    (res) => res.data,
  );

export const deleteService = (id) =>
  RestApi.delete(`/api/v1/application/delete-service/${id}`).then(
    (res) => res.data,
  );

export const toggleServiceStatus = (id) =>
  RestApi.patch(`/api/v1/application/change-service-active-status/${id}`).then(
    (res) => res.data,
  );
// ========================= End Services ========================

// ========================= Start Departments ========================
export const fetchDepartments = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "name:ASC",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/application/get-departments-with-pagination?${queryParams}`,
  );
  return data;
};


export const fetchDepartmentsDropdown = async () => {
  const { data } = await RestApi.get(`/api/v1/application/get-departments`, {
    cache: { next: { revalidate: 3 } }, // next.js caching
  });
  return data.data;
};

export const createDepartment = (payload) => {
  const { id, ...department } = payload;
  if (id !== undefined && id !== null && id !== "") {
    throw new Error("A department ID must not be provided when creating.");
  }
  return RestApi.post(
    `/api/v1/application/add-or-update-department`,
    department,
  ).then((res) => res.data);
};

export const updateDepartment = ({ id, ...department }) => {
  const departmentId = Number(id);
  if (!Number.isInteger(departmentId) || departmentId < 1) {
    throw new Error("A valid department ID is required when updating.");
  }
  return RestApi.post(`/api/v1/application/add-or-update-department`, {
    ...department,
    id: departmentId,
  }).then((res) => res.data);
};

export const addOrUpdateDepartment = (payload) => {
  const hasId =
    payload.id !== undefined && payload.id !== null && payload.id !== "";
  return hasId ? updateDepartment(payload) : createDepartment(payload);
};

export const deleteDepartment = (id) =>
  RestApi.delete(`/api/v1/application/delete-department/${id}`).then(
    (res) => res.data,
  );

export const toggleDepartmentStatus = (id) =>
  RestApi.patch(
    `/api/v1/application/change-department-active-status/${id}`,
  ).then((res) => res.data);
// ========================= End Departments ========================

// ========================= Start Designation ========================
// export const  fetchDesignations= async () => {
//   const { data } = await RestApi.get(`/api/v1/application/get-designations`, {
//     // cache: { next: { revalidate: 3 } } // next.js caching
//   });
//   return data.data;
// };

export const fetchDesignations = async (params = {}) => {
  const { page = 1, limit = 10, sort = "level:asc,id:asc", fields = "", ...otherParams } = params;
  delete otherParams.sort;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: sort || "level:asc,id:asc",
    fields: fields || "",
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/application/get-designations-with-pagination?${queryParams}`,
  );
  return data;
};

export const fetchAllDesignations = async () => {
  const { data } = await RestApi.get(`/api/v1/application/get-designations`);
  return data?.data || data || [];
};

export const addOrUpdateDesignation = (payload) =>
  RestApi.post(`/api/v1/application/add-or-update-designation`, payload).then(
    (res) => res.data,
  );

export const deleteDesignation = (id) =>
  RestApi.delete(`/api/v1/application/delete-designation/${id}`).then(
    (res) => res.data,
  );

export const toggleDesignationStatus = (id) =>
  RestApi.patch(
    `/api/v1/application/change-designation-active-status/${id}`,
  ).then((res) => res.data);

export const reorderDesignations = (payload) =>
  RestApi.post(`/api/v1/application/reorder-designations`, payload).then(
    (res) => res.data,
  );
// ========================= End Designation ========================

// ========================= Start Permission ========================
export const fetchPermissions = async (params) => {
  const { page = 1, limit = 10, sort, fields, ...otherParams } = params;

  otherParams.parent = otherParams.parentId;
  delete otherParams.parentId;

  const query = {
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
  };
  if (sort) query.sort = sort;
  if (fields) query.fields = fields;

  const queryParams = new URLSearchParams(query).toString();
  const { data } = await RestApi.get(
    `/api/v1/role-permission/permission/get-all-with-pagination?${queryParams}`,
  );
  return data;
};

export const addOrUpdatePermission = (payload) =>
  RestApi.post(
    `/api/v1/role-permission/permission/add-or-update`,
    payload,
  ).then((res) => res.data);

export const deletePermission = (id) =>
  RestApi.delete(`/api/v1/role-permission/permission/${id}`).then(
    (res) => res.data,
  );

export const togglePermissionStatus = (id) =>
  RestApi.patch(
    `/api/v1/role-permission/permission/change-active-status/${id}`,
  ).then((res) => res.data);

export const togglePermissionSystemStatus = (id) =>
  RestApi.patch(
    `/api/v1/role-permission/permission/change-system-status/${id}`,
  ).then((res) => res.data);

export const togglePermissionRequireStatus = (id) =>
  RestApi.patch(
    `/api/v1/role-permission/permission/change-required-status/${id}`,
  ).then((res) => res.data);

export const fetchAllPermissions = async (params = {}) => {
  const queryParams = new URLSearchParams(params);
  const { data } = await RestApi.get(
    `/api/v1/role-permission/permission/get-all-list?${queryParams}`,
    {
      // cache: { next: { revalidate: 3 } } // next.js caching
    },
  );
  return data.data;
};

export const fetchAllModulePermissions = async () => {
  const { data } = await RestApi.get(
    `/api/v1/role-permission/permission/get-all-module-list`,
    {
      // cache: { next: { revalidate: 3 } } // next.js caching
    },
  );
  return data.data;
};
// ========================= End Permission ========================

// ========================= Start Users ========================
export const fetchUsers = async (params) => {
  try {
    const { page = 1, limit = 10, sort, fields, ...otherParams } = params;
    // console.log('params', params)
    // console.log('otherParams', otherParams)
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort,
      fields,
    }).toString();
    const { data } = await RestApi.get(`/api/v1/users/get-all-users-with-pagination?${queryParams}`);
    return data;
  } catch (error) {
    // Handle 404 errors gracefully - return empty data instead of throwing
    if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          lastPage: 1,
          resultRows: 0,
        },
      };
    }
    throw error;
  }
};

export const addOrUpdateUser = (payload) =>
  RestApi.post(`api/v1/users/add-or-update`, payload).then((res) => res.data);

export const deleteUser = (id) =>
  RestApi.delete(`api/v1/users/${id}`).then((res) => res.data);

export const toggleUserStatus = (id) =>
  RestApi.patch(`api/v1/users/change-active-status/${id}`).then(
    (res) => res.data,
  );

export const checkCompanyEmailApi = async (
  email,
  { userId, employeeId } = {},
) => {
  const params = new URLSearchParams();
  if (email) params.append("email", email);
  if (userId) params.append("userId", userId);
  if (employeeId) params.append("employeeId", employeeId);
  const { data } = await RestApi.get(
    `api/v1/users/check-company-email?${params.toString()}`,
  );
  return data?.data || data;
};
// ========================= End Users ========================

// ========================= Start Role And Permissions ========================

export const fetchAllRoles = async () => {
  const { data } = await RestApi.get(
    `/api/v1/role-permission/roles/get-active-role-list`,
    {
      // cache: { next: { revalidate: 3 } } // next.js caching
    },
  );
  return data.data;
};

export const fetchRoles = async (params) => {
  const { page = 1, limit = 10, sort, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort,
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/role-permission/roles/get-all?${queryParams}`,
  );
  return data;
};

export const fetchRoleById = async (id) => {
  // if (!id) return;
  return await RestApi.get(
    `/api/v1/role-permission/roles/get-by-id/${id}`,
  ).then((res) => res.data.data);
};

export const addOrUpdateRoleAndPermission = (payload) =>
  RestApi.post(`/api/v1/role-permission/roles/add-or-update`, payload).then(
    (res) => res.data,
  );

export const deleteRoleAndPermission = (id) =>
  RestApi.delete(`/api/v1/role-permission/roles/${id}`).then((res) => res.data);

export const toggleRoleStatus = (id) =>
  RestApi.patch(
    `/api/v1/role-permission/roles/change-active-status/${id}`,
  ).then((res) => res.data);

export const toggleRoleIsSystemStatus = (id) =>
  RestApi.patch(
    `/api/v1/role-permission/roles/change-is-system-status/${id}`,
  ).then((res) => res.data);
// ========================= End Role And Permissions ========================

// ========================= Start Company User Roles ========================

export const fetchCompanyRoles = async (params) => {
  const { page = 1, limit = 10, sort, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    ...(sort ? { sort } : {}),
    ...(fields ? { fields } : {}),
  }).toString();

  const { data } = await RestApi.get(
    `/api/v1/role-permission/roles/company/get-all?${queryParams}`,
  );
  return data;
};

export const fetchCompanyRoleById = async (id) => {
  return await RestApi.get(
    `/api/v1/role-permission/roles/company/get-by-id/${id}`,
  ).then((res) => res.data.data);
};

export const addOrUpdateCompanyRole = (payload) =>
  RestApi.post(
    `/api/v1/role-permission/roles/company/add-or-update`,
    payload,
  ).then((res) => res.data);

export const deleteCompanyRole = (id) =>
  RestApi.delete(`/api/v1/role-permission/roles/company/${id}`).then(
    (res) => res.data,
  );

export const toggleCompanyRoleStatus = (id) =>
  RestApi.patch(
    `/api/v1/role-permission/roles/company/change-active-status/${id}`,
  ).then((res) => res.data);

export const fetchCompanyAssignableRoles = async () => {
  const { data } = await RestApi.get(
    `/api/v1/role-permission/roles/company/assignable-active-list`,
  );
  const list = data?.data ?? data;
  return Array.isArray(list) ? list : [];
};

export const fetchCompanyAssignablePermissions = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const { data } = await RestApi.get(
    `/api/v1/role-permission/permission/company/assignable-list?${queryParams}`,
  );
  // Transform interceptor wraps payloads as { data: ... }
  const list = data?.data ?? data;
  return Array.isArray(list) ? list : [];
};
// ========================= End Company User Roles ========================

export const fetchNotifications = async () => {
  const { data } = await RestApi.get(
    `/api/v1/users/notification/find-by-auth-user`,
    {
      // cache: { next: { revalidate: 3 } } // next.js caching
    },
  );
  return data.data;
};

// ===================================== ...start Company Logo Add Get company info And Upadte..... =====================================

export const fetchCompanyInfo = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/application/get-company-profile`);
  });
};

export const addOrUpdateCompanyInfo = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/application/update-company-profile/${payload.id}`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const addOrUpdateCompanyLogo = async (payload, queryKey) => {
  console.log("payload====", payload);
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/application/update-company-logo`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  });
};

export const addOrUpdateCompanyInvoiceLogo = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/application/update-company-invoice-logo`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  });
};



export const fetchParentDepartments = async () => {
  const { data } = await RestApi.get(
    `/api/v1/application/get-parent-departments`,
  );
  return data;
};

// ===================================== ...End Company Logo Add Get And Upadte..... =====================================
