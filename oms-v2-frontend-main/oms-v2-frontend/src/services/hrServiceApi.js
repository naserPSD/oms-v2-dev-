// src/services/hrServiceApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// --- GET Operations ---
export const fetchNotice = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/get-all-notices/get-all?${queryParams}`,
    );
  });
};

// --- CUD Operations ---

export const addOrUpdateNotice = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/hr-management/add-or-update-notice`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const deleteNotice = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/hr-management/delete-notice/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleStatusNotice = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/hr-management/change-status/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

// ========================= Start Notes ========================
export const fetchNotes = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "isPinned:DESC",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/personal-note/get-all?${queryParams}`,
  );
  return data;
};

// ========================= Get Attendance rules  ========================
export const fetchAttendanceRules = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-late-attendance-rules?${queryParams}`,
  );
  return data;
};

export const toggleServiceAttendaceActive = async (id) => {
  await RestApi.patch(
    `/api/v1/hr-management/change-late-attendance-rule-active-status/${id}`,
  );
};

export const toggleServiceAbsentActive = async (id) => {
  await RestApi.patch(
    `/api/v1/hr-management/change-late-attendance-rule-absent-status/${id}`,
  );
};

//add-update attendance rules ....api....

export const addUpdateAttendance = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/add-or-update-late-attendance-rule`,
    payload,
  ).then((res) => res.data);

//..........delete

export const deleteAttendanceRules = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/delete-late-attendance-rule-by-id/${id}`,
  ).then((res) => res.data);

export const addOrUpdateNotes = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/personal-note/add-or-update`,
    payload,
  ).then((res) => res.data);

export const updateVisitStatusApi = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/visit-application/update-visit-status`,
    payload,
  ).then((res) => res.data);

export const updateApplyStatusApi = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/visit-application/update-application-status`,
    payload,
  ).then((res) => res.data);

export const updateTimeStatusApi = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/visit-application/check-in-check-out`,
    payload,
  ).then((res) => res.data);

export const deleteNotes = (id) =>
  RestApi.delete(`/api/v1/hr-management/personal-note/delete/${id}`).then(
    (res) => res.data,
  );

export const pinNotes = (id) =>
  RestApi.patch(
    `/api/v1/hr-management/personal-note/change-pinned-status/${id}`,
  ).then((res) => res.data);

export const archiveNotes = (id) =>
  RestApi.patch(
    `/api/v1/hr-management/personal-note/change-archive-status/${id}`,
  ).then((res) => res.data);

// Archive Notes
export const fetchArchiveNotes = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "isPinned:DESC",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/personal-note/get-all-archived?${queryParams}`,
  );
  return data;
};

// ========================= End Notes ========================

// ========================= Start Notice ========================
// export const fetchNotice = async (params) => {
//   if (shouldUseOfflineMode()) {
//     console.log('Using offline data for fetchNotice');
//     return await OfflineDataService.getNotices(params);
//   }

//   const { page = 1, limit = 10, fields, ...otherParams } = params;
//   // console.log("params", params);
//   // console.log("otherParams", otherParams);
//   const queryParams = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//     params: JSON.stringify(otherParams),
//     sort: "",
//     fields,
//   }).toString();
//   const { data } = await RestApi.get(`/api/v1/hr-management/get-all-notices/get-all?${queryParams}`);
//   return data;
// };

// export const addOrUpdateNotice = async (payload) => {
//   if (shouldUseOfflineMode()) {
//     console.log('Using offline mode for addOrUpdateNotice');
//     return await OfflineDataService.addOrUpdateNotice(payload);
//   }

//   // Online mode - send to server directly
//   const response = await RestApi.post(`/api/v1/hr-management/add-or-update-notice`, payload);
//   return response.data;
// };

// // export const addOrUpdateNotice = (payload) =>
// //   RestApi.post(`/api/v1/hr-management/add-or-update-notice`, payload).then(
// //     (res) => res.data
// //   );

// export const deleteNotice = async (id) => {
//   console.log('shouldUseOfflineMode()', shouldUseOfflineMode())
//   if (shouldUseOfflineMode()) {
//     console.log('Using offline mode for deleteNotice');
//     return await OfflineDataService.deleteNotice(id);
//   }

//   // Online mode
//   const response = await RestApi.delete(`/api/v1/hr-management/delete-notice/${id}`);
//   return response.data;
// };

// export const toggleStatusNotice = async (id) => {
//   console.log('shouldUseOfflineMode()', shouldUseOfflineMode())
//   if (shouldUseOfflineMode()) {
//     console.log('Using offline mode for toggleStatusNotice');
//     return await OfflineDataService.toggleNoticeStatus(id);
//   }

//   // Online mode
//   const response = await RestApi.patch(`/api/v1/hr-management/change-status/${id}`);
//   return response.data;
// };
// ========================= End Notice ========================

// ========================= Start Office ========================
export const fetchOffice = async (params) => {
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
    `/api/v1/hr-management/get-all-offices?${queryParams}`,
  );
  return data;
};

export const fetchOfficeList = async () => {
  const { data } = await RestApi.get(`/api/v1/hr-management/office/list`, {
    // cache: { next: { revalidate: 3 } } // next.js caching
  });
  return data.data;
};

export const addOrUpdateOffice = (payload) =>
  RestApi.post(`/api/v1/hr-management/add-or-update-office`, payload).then(
    (res) => res.data,
  );

export const deleteOffice = (id) =>
  RestApi.delete(`/api/v1/hr-management/delete-office/${id}`).then(
    (res) => res.data,
  );

export const toggleStatusOffice = (id) =>
  RestApi.patch(`/api/v1/hr-management/change-office-active-status/${id}`).then(
    (res) => res.data,
  );

// ======================== End Office ========================//

// ========================= Start OfficeShift ===================//

// export const fetchOfficeShift = async (params) => {
//   const { page = 1, limit = 10, fields, ...otherParams } = params;

//   const queryParams = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//     params: JSON.stringify(otherParams),
//     sort: "",
//     fields,
//   }).toString();
//   const { data } = await RestApi.get(
//     `/api/v1/hr-management/get-all-office-shifts?${queryParams}`
//   );
//   return data;
// };

export const fetchOfficeShiftsByOfficeId = async (officeId) => {
  if (!officeId) return { data: [] };
  const { data } = await RestApi.get(
    `/api/v1/hr-management/find-offices-shift-by-office-id/${officeId}`,
  );
  const list = data?.data ?? data;
  return {
    ...data,
    data: Array.isArray(list) ? list : [],
  };
};
export const addOrUpdateOfficeShift = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/add-or-update-office-shift`,
    payload,
  ).then((res) => res.data);

export const deleteOfficeShift = (id) =>
  RestApi.delete(`/api/v1/hr-management/delete-office-shift/${id}`).then(
    (res) => res.data,
  );

// ========================= End OfficeShift ===================//

// ========================= Start Weekend ===================//

export const fetchWeekend = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-office-weekends?${queryParams}`,
  );
  return data;
};

export const addOrUpdateWeekend = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/add-or-update-office-weekend`,
    payload,
  ).then((res) => res.data);

export const deleteWeekend = (id) =>
  RestApi.delete(`/api/v1/hr-management/delete-office-weekend/${id}`).then(
    (res) => res.data,
  );

// ========================= End Weekend ===================//

export const fetchAllUsers = async () => {
  try {
    const { data } = await RestApi.get(`/api/v1/users/get-all-users`);
    return data;
  } catch (error) {
    // Handle 404 errors gracefully - return empty array instead of throwing
    if (error?.response?.status === 404 || error?._isLeadEndpoint404) {
      return { data: [] };
    }
    throw error;
  }
};

// ========================= Start Employee ===================//

export const fetchEmployee = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-all-employees?${queryParams}`,
  );
  return data;
};

export const deleteEmployee = (id) =>
  RestApi.delete(`/api/v1/hr-management/employee/delete-employee/${id}`).then(
    (res) => res.data,
  );

// ========================= End Employee ===================//

// ========================= Start Asset Allocation ========================
export const fetchEmployeeAssetAllocation = async (params) => {
  const { page = 1, limit = 10, sort, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort,
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-all-employee-assets?${queryParams}`,
  );
  return data;
};
export const addOrUpdateAssetAllocation = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/employee/add-or-update-employee-asset`,
    payload,
  ).then((res) => res.data);

export const deleteAssetAllocation = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/employee/delete-employee-asset/${id}`,
  ).then((res) => res.data);

export const toggleAssetAllocationStatus = (id) =>
  RestApi.patch(
    `/api/v1/hr-management/employee/update-employee-asset-status/${id}`,
  ).then((res) => res.data);

export const fetchAssetTypes = async () => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-company-asset-types`,
  );
  return data.data;
};

export const fetchGlobalAssetTypes = async () => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-all-asset-types`,
  );
  return data.data;
};

export const importGlobalAssetTypes = async (payload) => {
  const { data } = await RestApi.post(
    `/api/v1/hr-management/employee/import-global-asset-types`,
    payload
  );
  return data;
};

export const createCompanyAssetType = async (payload) => {
  const { data } = await RestApi.post(
    `/api/v1/hr-management/employee/add-or-update-company-asset-type`,
    payload
  );
  return data;
};

export const fetchAppEmployeeUsers = async () => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-app-employee-users`,
  );
  return data.data;
};

export const addOrUpdateAssetType = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/employee/add-or-update-asset-type`,
    payload,
  ).then((res) => res.data);

export const deleteAssetType = (id) =>
  RestApi.delete(`/api/v1/hr-management/employee/delete-asset-type/${id}`).then(
    (res) => res.data,
  );

// ========================= End Users ========================

// ========================= Start Employee Invitation ===================//

export const fetchEmployeeInvitation = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-all-emp-invitations?${queryParams}`,
  );
  return data;
};

export const sendEmployeeInvitation = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/employee/send-employee-invitation`,
    payload,
  ).then((res) => res.data);
// ========================= End Employee Invitation ===================//

// ========================= Start Requisition ========================
export const fetchRequisition = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  queryParams.set("params", JSON.stringify(otherParams));
  queryParams.set("sort", "");
  if (fields) queryParams.set("fields", fields);

  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-requisitions?${queryParams.toString()}`,
  );
  return data;
};

export const fetchAllPendingRequisition = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-pending-requisitions?${queryParams}`,
  );
  return data;
};

export const fetchMyRequisition = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-my-requisitions?${queryParams}`,
  );
  return data;
};

export const fetchPendingRequisition = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-pending-requisitions?${queryParams}`,
  );
  return data;
};

export const fetchRequisitionByStatus = async () => {
  const { data } = await RestApi.get(
    "/api/v1/hr-management/get-all-requisition-info",
    {
      params: {
        page: 1,
        limit: 10,
        sort: "",
      },
    },
  );

  return data;
};

export const fetchSingleRequisition = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-requisition-by-id/${id}`,
  );
  return data;
};
export const addOrUpdateRequisition = (payload) =>
  RestApi.post(`/api/v1/hr-management/add-or-update-requisition`, payload).then(
    (res) => res.data,
  );
export const requisitionStatusChange = (payload) =>
  RestApi.post(`/api/v1/hr-management/update-requisition-status`, payload).then(
    (res) => res.data,
  );

export const deleteRequisition = (id) =>
  RestApi.delete(`/api/v1/hr-management/delete-requisition/${id}`).then(
    (res) => res.data,
  );

// ========================= End Requisition ========================

// ===================== Start Training Request =====================
export const fetchTrainingRequests = async (params) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
  });
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-total-training-requests?${queryParams.toString()}`,
  );
  return data;
};

export const fetchPendingTrainingRequests = async (params) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
  });
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-pending-training-requests?${queryParams.toString()}`,
  );
  return data;
};

export const fetchApprovedTrainingRequests = async (params) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
  });
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-approved-training-requests?${queryParams.toString()}`,
  );
  return data;
};

export const fetchRejectedTrainingRequests = async (params) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
  });
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-rejected-training-requests?${queryParams.toString()}`,
  );
  return data;
};

export const fetchTrainingRequestsByEmployeeId = async (employeeId, params = {}) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
  });
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-training-requests-by-employee/${employeeId}?${queryParams.toString()}`,
  );
  return data;
};

export const fetchMyTrainingRequests = async (params = {}) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
  });
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-my-training-requests?${queryParams.toString()}`,
  );
  return data;
};

export const fetchTrainingRequestById = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-training-request-by-id/${id}`,
  );
  return data;
};

export const addOrUpdateTrainingRequest = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/add-or-update-training-request`,
    payload,
  ).then((res) => res.data);

export const trainingRequestStatusChange = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/update-training-request-status`,
    payload,
  ).then((res) => res.data);

export const deleteTrainingRequest = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/delete-training-request/${id}`,
  ).then((res) => res.data);
// ====================== End Training Request ======================

// ========================= Start Leave ========================
export const fetchEmployeeLeaveBalance = async (empId) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/${empId}/leave-balance`,
  );
  return data.data;
};

export const fetchLeaveSummaryList = async () => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-employee-leave-summary`,
  );
  return data.data;
};

const leaveDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round(ms / 86400000) + 1);
};

const isApprovedLeaveRequest = (req) => {
  const code = req?.approvalStatus?.code || req?.approvalStatusCode;
  if (code === "leave_request_approval_approved") return true;
  const name = String(req?.approvalStatus?.name || "").toLowerCase();
  if (name.includes("approved")) return true;
  return Number(req?.approvalStatusId) === 52;
};

const buildLeavePolicyFromTypes = (leaveTypes = [], leaveRequests = []) => {
  const usedByTypeId = new Map();
  const usedByName = new Map();

  leaveRequests.forEach((req) => {
    if (!isApprovedLeaveRequest(req)) return;
    const days = leaveDayCount(req.startDate, req.endDate);
    if (!days) return;
    const typeId =
      req.leaveTypeId ?? req.empLeaveType?.id ?? req.leaveType?.id;
    const typeName = req.empLeaveType?.name ?? req.leaveType?.name;
    if (typeId != null) {
      usedByTypeId.set(typeId, (usedByTypeId.get(typeId) || 0) + days);
    }
    if (typeName) {
      usedByName.set(typeName, (usedByName.get(typeName) || 0) + days);
    }
  });

  const leaveOverview = {};
  let totalLeave = 0;
  let totalUsed = 0;

  leaveTypes.forEach((leaveType) => {
    const name = leaveType?.name;
    if (!name) return;
    const total = Number(leaveType.maxDaysPerYear) || 0;
    const used =
      usedByTypeId.get(leaveType.id) ?? usedByName.get(name) ?? 0;
    const remaining = Math.max(0, total - used);
    leaveOverview[name] = { total, used, remaining };
    totalLeave += total;
    totalUsed += used;
  });

  return {
    leaveOverview,
    total: {
      totalLeave,
      totalUsed,
      totalRemaining: Math.max(0, totalLeave - totalUsed),
    },
  };
};

const normalizeLeaveTypeList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
};

const normalizeLeaveRequestList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
};

export const fetchMyLeavePolicy = async () => {
  // Remote DB can exceed default 10s axios timeout
  const policyOptions = {
    skipUnauthorizedHandler: true,
    timeout: 60000,
  };

  // 1) Dedicated policy endpoint (includes used days)
  try {
    const { data } = await RestApi.get(
      `/api/v1/hr-management/employee/get-my-leave-policy`,
      policyOptions,
    );
    if (data?.data?.leaveOverview) {
      return data;
    }
  } catch (error) {
    const status = error?.response?.status ?? error?.status;
    console.warn("fetchMyLeavePolicy unavailable:", status || error?.message);
  }

  // 2) Leave types + my leave requests → used/remaining like before
  try {
    const [typesRes, requestsRes] = await Promise.all([
      RestApi.get("/api/v1/hr-management/get-leave-types", { timeout: 60000 }),
      RestApi.get(
        `/api/v1/hr-management/employee/get-my-leave-requests?${new URLSearchParams(
          {
            page: "1",
            limit: "500",
            params: "{}",
            sort: "",
            fields: "",
          },
        ).toString()}`,
        { timeout: 60000 },
      ),
    ]);

    const policyYear = new Date().getFullYear();
    const leaveTypes = normalizeLeaveTypeList(typesRes?.data).filter(
      (leaveType) =>
        !leaveType?.year || Number(leaveType.year) === policyYear,
    );
    const leaveRequests = normalizeLeaveRequestList(requestsRes?.data).filter(
      (request) => {
        if (!request?.startDate) return true;
        const start = new Date(request.startDate);
        return (
          !Number.isNaN(start.getTime()) &&
          start.getFullYear() === policyYear
        );
      },
    );

    if (!leaveTypes.length) {
      return { status: "error", data: null };
    }

    return {
      status: "success",
      message: "Leave policy loaded from leave types and requests",
      data: buildLeavePolicyFromTypes(leaveTypes, leaveRequests),
    };
  } catch (error) {
    const status = error?.response?.status ?? error?.status;
    console.warn(
      "fetchMyLeavePolicy leave-types fallback failed:",
      status || error?.message,
    );
    return { status: "error", data: null };
  }
};
export const fetchMyLeaveRequest = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-my-leave-requests?${queryParams}`,
  );
  return data;
};
export const fetchAllLeaveRequest = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-employee-leave-requests?${queryParams}`,
  );
  return data;
};

//Get Pending Leave Request...........

export const fetchAllPendingLeaveRequest = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();

  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-employee-pending-leave-requests?${queryParams}`,
  );

  return data;
};

// API call
export const updateLeaveRequestApprovalStatus = ({ id, ...payload }) =>
  RestApi.post(
    `/api/v1/hr-management/employee/update-leave-request-approval-status-by-id/${id}`,
    payload,
  ).then((res) => res.data);

export const addOrUpdateLeaveRequest = async (payload) => {
  const hasFile = payload.attachmentMedia instanceof File;

  if (hasFile) {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    const { data } = await RestApi.post(
      `/api/v1/hr-management/employee/add-or-update-emp-leave-request/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      },
    );
    return data;
  }

  const body = { ...payload };
  delete body.attachmentMedia;
  if (!body.id || body.id === 0 || body.id === "0") {
    delete body.id;
  }

  const { data } = await RestApi.post(
    `/api/v1/hr-management/employee/add-or-update-emp-leave-request`,
    body,
    {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    },
  );
  return data;
};

export const deleteLeaveRequest = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/employee/delete-emp-leave-request/${id}`,
  ).then((res) => res.data);

export const fetchLeaveType = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-emp-leave-types?${queryParams}`,
  );
  return data;
};

// ========================= End Leave ========================

// ========================= Start Holiday ========================
// --- GET Operations ---
export const fetchHoliday = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/holiday/get-all-holidays?${queryParams}`,
    );
  });
};

// --- CUD Operations ---

export const addOrUpdateHoliday = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/hr-management/holiday/add-or-update-holiday`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const deleteHoliday = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/hr-management/holiday/delete-holiday/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleStatusHoliday = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/hr-management/holiday/change-status/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

// ========================= End Holiday ========================

// ===================== Start Office Holiday ===================

export const fetchOfficeHoliday = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/holiday/get-all-app-holidays?${queryParams}`,
    );
  });
};

// --- CUD Operations ---

export const addOrUpdateOfficeHoliday = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/hr-management/holiday/add-or-update-app-holiday`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const deleteOfficeHoliday = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(
      `/api/v1/hr-management/holiday/delete-app-holiday-by-id/${id}`,
      {
        offlineMetadata: { queryKey },
      },
    ),
  );
};

// export const toggleStatusOfficeHoliday = async (id, queryKey) => {
//   return offlineHandler.patch(async () =>
//     RestApi.patch(`/api/v1/hr-management/holiday/change-status/${id}`, {
//       offlineMetadata: { queryKey },
//     })
//   );
// };

// ===================== End Office Holiday ===================

// ============= Start All Employee Attendance =============

// --- GET Operations ---
export const fetchAllEmployeeAttendance = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/employee/attendance/get-all-attendance-list-by-date?${queryParams}`,
    );
  });
};

export const fetchPendingAttendance = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields: fields || "",
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/employee/attendance/get-pending-attendance?${queryParams}`,
    );
  });
};

export const fetchEmployeeAttendanceReconciliations = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/employee/attendance/get-reconciliations?${queryParams}`,
    );
  });
};

// --- GET Operations ---
export const fetchMonthlyEmployeeAttendance = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;

    const now = new Date();
    const monthAndYear = otherParams?.month ? String(otherParams.month) : "";

    if (monthAndYear) {
      if (monthAndYear.includes("-")) {
        const [year, month] = monthAndYear.split("-");
        otherParams.year = Number(year);
        otherParams.month = Number(month);
      } else {
        otherParams.year = now.getFullYear();
        otherParams.month = Number(monthAndYear);
      }
    } else {
      otherParams.year = now.getFullYear();
      otherParams.month = now.getMonth() + 1;
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/attendance/get-monthly-attendance-summary-list?${queryParams}`,
    );
  });
};

// ============= End All Employee Attendance =============

// --- GET Operations ---
export const fetchEmployeeDashboardDataById = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/get-dashboard-data/${id}`,
    );
  });
};

export const fetchEmployeeDashboardData = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(
        `/api/v1/hr-management/employee/my-dashboard-data`,
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: null } };
      }
      throw err;
    }
  });
};

// --- GET Operations ---
export const fetchEmployeeEventCalendar = async (employeeId) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/get-employee-event-calendar/${employeeId}`,
    );
  });
};

export const fetchEmployeeEventCalendarWithoutId = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(
        `/api/v1/hr-management/employee/get-user-event-calendar`,
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: [] } };
      }
      throw err;
    }
  });
};

export const fetchEmployeeProfileDashboardData = async (employeeId) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/get-today-dashboard-data/${employeeId}`,
    );
  });
};

export const fetchEmployeeProfileDashboardDataWithoutId = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(`/api/v1/hr-management/employee/my-summary`);
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: null } };
      }
      throw err;
    }
  });
};

// --- GET Operations ---
export const fetchEmployeeHierarchyByEmployeeId = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/get-employee-hierarchy-by-employee/${id}`,
    );
  });
};

// --- GET Operations ---
export const fetchEmployeeHierarchyByEmployee = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/get-all-employee-hierarchies-with-subordinates`,
    );
  });
};

// Update CheckOut Reconciliation Status - POST request with payload
export const updateCheckOutReconciliationStatus = async (payload, queryKey) => {
  return offlineHandler.post(
    async () => {
      const response = await RestApi.post(
        `/api/v1/hr-management/update-checkOut-reconciliation-status/${payload.id}`,
        payload.data, // Request body data
      );
      return response.data;
    },
    { queryKey },
  );
};

// Update CheckIn Reconciliation Status - POST request with payload
export const updateCheckInReconciliationStatus = async (payload, queryKey) => {
  return offlineHandler.post(
    async () => {
      const response = await RestApi.post(
        `/api/v1/hr-management/update-checkIn-reconciliation-status/${payload.id}`,
        payload.data, // Request body data
      );
      return response.data;
    },
    { queryKey },
  );
};

// --- GET - upcoming events ---

export const fetchGetEmployeeUpComingEvents = async (employeeId) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/attendance/upcoming-events/${employeeId}`,
    );
  });
};

export const fetchGetEmployeeUpComingEventsWithoutId = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(
        `/api/v1/hr-management/attendance/my-upcoming-events`,
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: [] } };
      }
      throw err;
    }
  });
};

export const fetchGetMyUpComingEvents = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/attendance/my-upcoming-events`,
    );
  });
};
export const fetchGetAllEvents = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/hr-management/attendance/get-all-events`);
  });
};

export const addOrUpdateEvent = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/hr-management/attendance/add-or-update-event`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

// calendar dashboard
export const fetchDashboardCalendar = async () => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/calendar/get-all-events`,
  );
  return data;
};

export const fetchSingleEvent = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/attendance/event-by-id/${id}`,
  );
  return data;
};

export const deleteEvent = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/hr-management/attendance/delete-event/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

// task workspace

export const fetchTaskWorkspaces = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(`/api/v1/task/get-all-workspaces?${queryParams}`);
  });
};

export const addOrUpdateTaskWorkspace = async (payload) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/task/add-or-update-workspace`, payload, {
      offlineMetadata: {
        queryKey: ["task-workspaces"],
      },
    }),
  );
};

export const deleteTaskWorkspace = async (id) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/task/delete-workspace/${id}`),
  );
};
export const changeTaskWorkspaceActiveStatus = async (id, isActive) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/task/workspaces/change-active-status/${id}`, {
      isActive,
    }),
  );
};

// task board
export const fetchTaskBoards = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(`/api/v1/task/get-all-boards?${queryParams}`);
  });
};
export const addOrUpdateTaskBoard = async (payload) => {
  return offlineHandler.post(async () =>
    RestApi.post(`/api/v1/task/task-board/add-or-update-task-board`, payload, {
      offlineMetadata: {
        queryKey: ["task-boards"],
      },
    }),
  );
};

export const deleteTaskBoard = async (id) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/task/delete-task-board/${id}`),
  );
};
export const changeTaskBoardActiveStatus = async (id, isActive) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/task/task-board/change-active-status/${id}`, {
      isActive,
    }),
  );
};

// visit application

export const fetchVisitApplications = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    // offlineHandler already unwraps axios `response.data` once
    return RestApi.get(
      `/api/v1/hr-management/employee/get-all-visitor-requests?${queryParams}`,
    );
  });
};

export const fetchApplyVisit = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    // offlineHandler already unwraps axios `response.data` once
    return RestApi.get(
      `/api/v1/hr-management/employee/get-all-apply-for-visit?${queryParams}`,
    );
  });
};

// visit application

export const fetchVisitEmployee = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    // offlineHandler already unwraps axios `response.data` once
    return RestApi.get(
      `/api/v1/hr-management/get-all-visit-applications-stats?${queryParams}`,
    );
  });
};

export const addOrUpdateVisitApplication = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/hr-management/employee/add-or-update-visit-application`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

// --- GET Operations ---
export const addOrUpdateEmployee = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/hr-management/employee/add-new-employee`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const fetchGeneratedEmployeeCode = async () => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/generate-code`,
  );
  const result = data?.data ?? data;
  return result?.employeeCode || result;
};

// ========================= Get job recruiment   ========================
export const fetchJobRecruitment = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-late-attendance-rules?${queryParams}`,
  );
  return data;
};

// ========================= Get Master Documents  ========================start.......
export const fetchMasterDocuments = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/master-documents/get-all?${queryParams}`,
  );
  return data;
};

export const fetchMasterDocumentsWithoutPagination = async () => {
  // const { page = 1, limit = 10, fields, ...otherParams } = params;

  // const queryParams = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   params: JSON.stringify(otherParams),
  //   sort: "",
  //   fields,
  // }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/master-documents/get-all-without-pagination`,
  );
  return data;
};

export const addUpdateMasterDocument = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/master-documents/add-or-update`,
    payload,
  ).then((res) => res.data);

export const toggleMasterDocumentStatus = async (id) => {
  await RestApi.patch(
    `/api/v1/hr-management/master-documents/change-active-status/${id}`,
  );
};

export const deleteMasterDocument = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/master-documents/delete-by-id/${id}`,
  ).then((res) => res.data);

// ========================= Get Company Documents  ========================start.......
export const fetchCompanyDocuments = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/company-documents/get-all?${queryParams}`,
  );
  return data;
};

export const fetchCompanyDocumentsWithoutPagination = async () => {
  // const { page = 1, limit = 10, fields, ...otherParams } = params;

  // const queryParams = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   params: JSON.stringify(otherParams),
  //   sort: "",
  //   fields,
  // }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/company-documents/get-all-without-pagination`,
  );
  return data;
};

export const addUpdateCompanyDocument = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/company-documents/add-or-update-company-document`,
    payload,
  ).then((res) => res.data);

export const toggleCompanyDocumentStatus = async (id) => {
  await RestApi.patch(
    `/api/v1/hr-management/company-documents/change-active-status/${id}`,
  );
};

export const deleteCompanyDocument = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/company-documents/delete-by-id/${id}`,
  ).then((res) => res.data);

export const documentFiles = async () => {
  // const { page = 1, limit = 10, fields, ...otherParams } = params;

  // const queryParams = new URLSearchParams({
  //   page: page.toString(),
  //   limit: limit.toString(),
  //   params: JSON.stringify(otherParams),
  //   sort: "",
  //   fields,
  // }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/company-document-records/get-all`,
  );
  return data;
};

export const employeeDocumentFiles = async (employeeId) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/company-document-records/get-all/${employeeId}`,
  );

  return data;
};

export const addOrUpdateDocumentFile = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/company-document-records/add-or-update`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  ).then((res) => res.data);

//Document add update...With EmployeeId
export const addOrUpdateDocumentFileWithEmployeeId = (payload, employee_id) =>
  RestApi.post(
    `/api/v1/hr-management/company-document-records/add-or-update/${employee_id}`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  ).then((res) => res.data);

export const deleteDocumentFile = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/company-document-records/delete-by-id/${id}`,
  ).then((res) => res.data);

// ========================= Get Individual Employee Certification and Skills files  ========================start.......

export const employeeCertifications = async (employeeId) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-employee-certifications/${employeeId}`,
  );

  return data;
};

//certification add update...With EmployeeId
export const addOrUpdateCertificationFileWithEmployeeId = (
  payload,
  employee_id,
) =>
  RestApi.post(
    `/api/v1/users/add-or-update-certification/${employee_id}`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  ).then((res) => res.data);

export const employeeSkills = async (employeeId) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-employee-skills/${employeeId}`,
  );

  return data;
};

//add and update.... Epmplyee Skills With Id
export const addOrUpdateSkillsWithEmployeeId = (payload, employee_id) =>
  RestApi.post(
    `/api/v1/users/add-or-update-skill/${employee_id}`,
    payload,
  ).then((res) => res.data);

export const employeeProjects = async (employeeId) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-employee-projects/${employeeId}`,
  );

  return data;
};

//add and update.... Epmplyee Project With Id

export const addOrUpdateProjectWithEmployeeId = (payload, employee_id) =>
  RestApi.post(
    `/api/v1/users/add-or-update-project/${employee_id}`,
    payload, // JSON object
  ).then((res) => res.data);

// ========================= .For Individual Employee Update Office And Shift end   ========================start.......

export const updateEmployeeOfficeAndShift = async (payload) => {
  const { empId } = payload;

  const { data } = await RestApi.post(
    `/api/v1/hr-management/update-employee-office-info/${empId}`,
    payload,
  );

  return data;
};

// ========================= Get Company Documents  ========================start.......
export const employeeHierarchyFiles = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/get-all-employee-hierarchies?${queryParams}`,
  );
  return data;
};

export const addOrUpdateemployeeHierarchyFile = (payload) =>
  RestApi.post(
    `/api/v1/hr-management/employee/add-or-update-employee-hierarchy`,
    payload,
  ).then((res) => res.data);

export const deleteEmployeeHierarchyFile = (id) =>
  RestApi.delete(
    `/api/v1/hr-management/employee/delete-employee-hierarchy-by-id/${id}`,
  ).then((res) => res.data);
// ========================= Get Profile Update  ========================start.......

export const addOrUpdateEmployeeProfilePicture = async (id, payload) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/hr-management/employee/update-employee-profile-picture/${id}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  });
};

// API call
export const toggleEmployeeActiveStatus = async (id) => {
  await RestApi.patch(
    `/api/v1/users/change-employee-profile-completed-status/${id}`,
  );
};

//get Asset api...........

export const fetchMyAssets = async (params = {}) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/hr-management/get-my-assets`, params);
  });
};

export const createAssetRefundRequest = async (payload) => {
  return await RestApi.post(
    `/api/v1/hr-management/employee-asset/create-refund-request`,
    payload,
  );
};

export const fetchMyAssetRefundRequests = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee-asset/get-my-refund-requests`,
    );
  });
};

export const fetchAllAssetRefundRequests = async (params = {}) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee-asset/get-all-refund-requests`,
      { params },
    );
  });
};

export const actionAssetRefundRequest = async (payload) => {
  return await RestApi.post(
    `/api/v1/hr-management/employee-asset/action-refund-request`,
    payload,
  );
};

//get paymet history

export const fetchEmployeePaymentHistory = async (employeeId, params = {}) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/payroll/get-employee-payment-history-list-with-pagination/${employeeId}`,
      params,
    );
  });
};

// //..............Get Salary History ..............////

export const fetchMySalaryHistory = async (params = {}) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/payroll/payment-history/get-my-salary-history?${queryParams}`,
    );
  });
};

// //..............Get Salary History by Employee ID ..............////
export const fetchSalaryHistoryByEmployeeId = async (
  employeeId,
  params = {},
) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/payroll/payment-history/get-salary-history-by-employee-id/${employeeId}?${queryParams}`,
    );
  });
};

// //..............Get SEmployee Birth Day ..............////

export const getActiveEmployeesBirthdayInfo = async () => {
  const { data } = await RestApi.get(
    "/api/v1/payroll/get-active-employees-birthday-info",
  );
  return data;
};

// //..............Get All Office Holiday Day ..............////
export const getAllHolidayListWithoutPagination = async () => {
  const { data } = await RestApi.get(
    "/api/v1/hr-management/get-all-holiday-list-without-pagination",
  );
  return data;
};

// --- GET Operations ---
export const fetchLeavereport = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/get-yearly-leave-summary-list?${queryParams}`,
    );
  });
};

export const getLeaveTypes = async () => {
  const { data } = await RestApi.get("/api/v1/hr-management/get-leave-types");
  return data;
};
// --- Leave Type APIs ---
export const fetchLeaveTypes = async (params = {}) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...otherParams,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/hr-management/get-all-emp-leave-types?${queryParams}`,
  );
  return data;
};

export const addOrUpdateLeaveType = async (payload) => {
  return RestApi.post(
    `/api/v1/hr-management/add-or-update-emp-leave-type`,
    payload,
  ).then((res) => res.data);
};

export const getLeaveTypeById = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/emp-leave-type-by-id/${id}`,
  );
  return data;
};

export const deleteLeaveType = async (id) => {
  return RestApi.delete(
    `/api/v1/hr-management/delete-emp-leave-type/${id}`,
  ).then((res) => res.data);
};

/// //..............Get Add Update Job Recuritment step ..............Start ////

export const fetchJobRecruitmentSteps = async (params) => {
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...otherParams,
  }).toString();

  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-all-job-recruitment-step-names?${queryParams}`,
  );

  return data;
};

export const addOrUpdateJobRecruitmentStep = (payload) =>
  RestApi.post(
    `/api/v1/recruitment/job-recruitment/add-or-update-job-recruitment-step-name`,
    payload,
  ).then((res) => res.data);

export const deleteJobRecruitmentStep = (id) =>
  RestApi.delete(
    `/api/v1/recruitment/job-recruitment/delete-job-recruitment-step-name-by-id/${id}`,
  ).then((res) => res.data);

export const fetchAllActiveJobRecruitmentStepNames = async () => {
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-all-active-job-recruitment-step-names`,
  );

  return data;
};

export const fetchJobRecruitmentStepById = async (id) => {
  const normalizedId = String(id ?? "").trim();

  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-job-recruitment-step-by-id/${normalizedId}`,
  );

  return data;
};

export const fetchJobRecruitmentStepIdsByJobVacancyId = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-job-recruitment-step-ids-by-job-vacancy-id/${id}`,
  );

  return data;
};

export const addOrUpdateJobRecruitmentSteps = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/recruitment/job-recruitment/add-or-update-job-recruitment-steps`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

// //..............Get Add Update Job job vacancy ..............start ////

export const fetchJobVacancy = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-all-job-vacancies?${queryParams}`,
  );
  return data;
};

export const addOrUpdateJobVacancy = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/recruitment/job-recruitment/add-or-update-job-vacancy`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const addOrUpdateJobInterviewers = async (payload) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/recruitment/job-recruitment/add-or-update-job-interviewers`,
      payload,
    );
  });
};

export const deleteJobVacancy = (id) =>
  RestApi.delete(
    `/api/v1/recruitment/job-recruitment/delete-job-vacancy-by-id/${id}`,
  ).then((res) => res.data);

export const fetchJobWeights = async (params) => {
  const { page = 1, limit = 10, fields, ...otherParams } = params;
  // console.log("params", params);
  // console.log("otherParams", otherParams);
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
    fields,
  }).toString();
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-all-job-weights?${queryParams}`,
  );
  return data;
};

export const addBulkJobWeights = async (payload) => {
  return RestApi.post(
    `/api/v1/recruitment/job-recruitment/add-bulk-job-weights`,
    payload,
  );
};

export const updateJobWeight = async (payload) => {
  return RestApi.patch(
    `/api/v1/recruitment/job-recruitment/update-job-weight`,
    payload,
  );
};

export const deleteJobWeight = (id) =>
  RestApi.delete(
    `/api/v1/recruitment/job-recruitment/delete-job-weight-by-id/${id}`,
  ).then((res) => res.data);

export const getJobRecruitmentStepsByVacancyId = async (vacancyId) => {
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-step-names?jobVacancyId=${vacancyId}`,
  );
  return data;
};
export const getJobTitleByJobVacancyId = async (vacancyId) => {
  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-job-vancancy-interview-overview-by-job-vacancy-id?jobVacancyId=${vacancyId}`,
  );
  return data;
};

export const fetchAllJobApplicants = async (params = {}) => {
  const { page = 1, limit = 10, ...otherParams } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify(otherParams),
    sort: "",
  }).toString();

  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-all-job-applicants?${queryParams}`,
  );
  return data;
};

export const addOrUpdateJobApplicant = async (formData) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/recruitment/job-recruitment/add-or-update-job-applicant`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  });
};

export const deleteJobApplicant = (id) =>
  RestApi.delete(
    `/api/v1/recruitment/job-recruitment/delete-job-applicant-by-id/${id}`,
  ).then((res) => res.data);

export const updateJobApplicantRecruitmentStatus = (payload) =>
  RestApi.post(
    `/api/v1/recruitment/job-recruitment/change-job-recruitment-step-status`,
    payload,
  ).then((res) => res.data);

/* ── Step Applicants ── */
export const fetchApplicantsByStep = async ({
  jobVacancyId,
  stepNameId,
  page = 1,
  limit = 10,
}) => {
  // const queryParams = new URLSearchParams({
  //   jobVacancyId,
  //   stepNameId,
  //   page: page.toString(),
  //   limit: limit.toString(),
  // }).toString();

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    params: JSON.stringify({ jobVacancyId, stepNameId, }),
    sort: "",
  }).toString();

  const { data } = await RestApi.get(
    `/api/v1/recruitment/job-recruitment/get-applicants-by-job-vacancy-and-step-names?${queryParams}`,
  );
  return data;
};

/* ── Interview Schedule ── */
export const addOrUpdateInterviewSchedule = async (payload) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/job-interview-schedules/add-or-update`,
      payload,
    );
  });
};

/* ── confirmRecruitment ── */
export const confirmRecruitment = async (payload) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/recruitment/job-recruitment/confirm-recruitment`,
      payload,
    );
  });
};

export const getInterviewScheduleById = async (id) => {
  const { data } = await RestApi.get(
    `/api/v1/job-interview-schedules/get-by-id/${id}`,
  );
  return data;
};

export const deleteInterviewSchedule = async (id) => {
  return RestApi.delete(`/api/v1/job-interview-schedules/delete-by-id/${id}`);
};

/* ── Interview Weights ── */
export const getWeightDistributionBySchedule = async (scheduleId) => {
  const { data } = await RestApi.get(
    `/api/v1/job-interview-weights/distribution/schedule/${scheduleId}`,
  );
  return data;
};

export const getTopApplicantsByVacancy = async (jobVacancyId) => {
  const { data } = await RestApi.get(
    `/api/v1/job-interview-weights/top-applicants/vacancy/${jobVacancyId}`,
  );
  return data;
};
export const submitInterviewMarks = async (payload) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/job-interview-weights/submit-marks`, payload);
  });
};

/* ── add Remark ── */
export const applicantRemark = async (payload) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/job-interview-weights/applicant/add-remarks`,
      payload,
    );
  });
};

export const fetchMyAttendance = async (params = {}) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/my-attendance`,
    { params },
  );
  return data?.data ?? data;
};

export const fetchMyAttendanceHistory = async (params = {}) => {
  const { data } = await RestApi.get(
    `/api/v1/hr-management/employee/my-attendance-history`,
    { params },
  );
  return data?.data ?? data;
};

export const fetchMyAttendanceReconciliation = fetchMyAttendance;

export const requestMyAttendanceReconciliation = async (payload) => {
  const { data } = await RestApi.post(
    `/api/v1/hr-management/employee/my-attendance-reconciliation`,
    payload,
  );
  return data?.data ?? data;
};
