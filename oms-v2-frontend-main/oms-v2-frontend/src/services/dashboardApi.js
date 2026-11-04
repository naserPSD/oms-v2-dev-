// services/dashboardApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

export const fetchNotifications = async () => {
  const { data } = await RestApi.get(`/api/v1/users/notification/find-by-auth-user`, {
    // cache: { next: { revalidate: 3 } } // next.js caching
  });
  return data.data;
};

export const markAllReadNotification = () =>
  RestApi.patch(`/api/v1/users/notification/mark-all-read`).then((res) => res.data);

// --- GET Operations ---
export const getMyEmployeeInvitations = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/get-my-employee-invitation-list`
    );
  });
};

export const acceptMyEmployeeInvitation = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/hr-management/employee/invitation-accept/${id}`, {
      offlineMetadata: { queryKey },
    })
  );
};

// --- GET Operations ---
export const fetchMyAttendanceToday = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/attendance/my-attendance-today`
    );
  });
};
export const fetchAllEmployeeAttendanceToday = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/hr-management/employee/attendance/all-employee-attendance-today`
    );
  });
};

export const employeeCheckIn = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/hr-management/employee/attendance/check-in`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const employeeCheckOut = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/hr-management/employee/attendance/check-out`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const requestForRemovingLateAttendance = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/hr-management/employee/attendance/request-for-removing-late-count`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};


export const fetchDashboardAttendanceStatistics = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/hr-management/get-user-dashboard-data`);
  });
};

export const fetchCRMDashboardStats = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/crm/dashboard-stats`);
  });
};

export const fetchAccountsDashboardStats = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/accounts/dashboard-stats`);
  });
};
