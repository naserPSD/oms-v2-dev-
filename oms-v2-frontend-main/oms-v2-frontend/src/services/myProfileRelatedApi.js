// path: src/services/myProfileRelatedApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// --- GET Operations ---
export const fetchAttendanceAndLeaveSummeryForAuthUser = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(
        `/api/v1/hr-management/employee/attendance-and-leave-summary-log-in-user`,
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: null } };
      }
      throw err;
    }
  });
};

export const fetchTotalExperienceAndPromotionForAuthUser = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(
        `/api/v1/hr-management/employee/total-experience-and-promotion`,
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: null } };
      }
      throw err;
    }
  });
};

// Attendance summery
export const fetchAttendanceSummeryForAuthUser = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(
        `/api/v1/hr-management/employee/attendance-and-leave-summary-log-in-user`,
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: null } };
      }
      throw err;
    }
  });
};

export const fetchAttendanceSummeryForEmployee = async (params) => {
  const queryParams = new URLSearchParams({
    params: JSON.stringify(params),
  }).toString();

  return offlineHandler.get(async () => {
    return await RestApi.get(
      // `/api/v1/hr-management/attendance/get-monthly-attendance-summary/${employeeId}`,
      `/api/v1/hr-management/attendance/get-monthly-attendance-summary?${queryParams}`,
    );
  });
};

// Update password API
export const updatePasswordForAuthUser = async (payload, queryKey) => {
  console.log("confirm pass 22", payload);
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/auth/change-password`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const fetchMyTodayDashboardData = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(
        `/api/v1/hr-management/employee/get-my-today-dashboard-data`,
      );
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: null } };
      }
      throw err;
    }
  });
};

export const startBreakForAuthUser = async (id) => {
  return offlineHandler.post(async () => {
    return await RestApi.post(
      `/api/v1/hr-management/employee/attendance/break-start/${id}`,
    );
  });
};

export const endBreakForAuthUser = async (id) => {
  return offlineHandler.post(async () => {
    return await RestApi.post(
      `/api/v1/hr-management/employee/attendance/break-end/${id}`,
    );
  });
};

export const fetchMySalaryGrade = async () => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(`/api/v1/payroll/employee/my-salary-grade-info`);
    } catch (err) {
      if (err?.response?.status === 404) {
        return { data: { status: "success", data: null } };
      }
      throw err;
    }
  });
};

export const fetchRecentActivities = async (params = {}) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/audit-log/get-recent-audit-logs`, params);
  });
};

export const fetchEmployeeRecentActivities = async (
  employeeId,
  params = {},
) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/audit-log/get-recent-audit-logs-by-employee/${employeeId}`,
      params,
    );
  });
};

export const fetchMyPaymentHistory = async (params = {}) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/payroll/get-my-payment-history-list-with-pagination`,
      params,
    );
  });
};


export const fetchAuthUserInfo = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/auth/auth-user-info`);
  });
};
