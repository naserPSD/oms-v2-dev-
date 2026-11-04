// path: src/services/payrollRelatedApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// Salary Grades Start ====================
export const fetchSalaryGrade = async (params) => {
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
      `/api/v1/payroll/salary-grades/get-all-list?${queryParams}`,
    );
  });
};

export const getActiveSalaryGradeList = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/payroll/salary-grades/get-all-active-salary-grade-list`,
    );
  });
};

export const getActiveSalaryGradeRuleList = async (params) => {
  return offlineHandler.get(async () => {
    const queryParams = new URLSearchParams({
      params: JSON.stringify(params),
    }).toString();

    return await RestApi.get(
      `/api/v1/payroll/salary-grade-rules/get-by-query-params?${queryParams}`,
    );
  });
};

export const addOrUpdateSalaryGrade = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/salary-grades/add-or-update`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const deleteSalaryGrade = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/payroll/salary-grades/delete-by-id/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleStatusSalaryGrade = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/payroll/salary-grades/change-active-status/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

// Pay Items Start ====================
export const fetchPayItems = async (params) => {
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
      `/api/v1/payroll/pay-item/get-all-list?${queryParams}`,
    );
  });
};

export const getActivePayItemsList = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/payroll/pay-item/get-all-active-pay-list`,
    );
  });
};

export const addOrUpdatePayItems = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/payroll/pay-item/add-or-update`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const deletePayItems = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/payroll/pay-item/delete-by-id/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleStatusPayItems = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/payroll/pay-item/change-active-status/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleTaxablePayItems = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/payroll/pay-item/change-taxable-status/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

// Salary Grade Rules Start ====================
export const fetchSalaryGradeRules = async (params) => {
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
      `/api/v1/payroll/salary-grade-rules/get-all-list?${queryParams}`,
    );
  });
};

export const addOrUpdateSalaryGradeRules = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/salary-grade-rules/add-or-update`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const deleteSalaryGradeRules = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/payroll/salary-grade-rules/delete-by-id/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleStatusSalaryGradeRules = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(
      `/api/v1/payroll/salary-grade-rules/change-active-status/${id}`,
      {
        offlineMetadata: { queryKey },
      },
    ),
  );
};

// ====================  Payroll Salary Structures start ====================

export const fetchSalaryStructures = async (params) => {
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
      `/api/v1/payroll/salary-structure/get-all-list?${queryParams}`,
    );
  });
};

export const addOrUpdateSalaryStructure = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/salary-structure/add-or-update`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const deleteSalaryStructure = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/payroll/salary-structure/delete-by-id/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

export const toggleStatusSalaryStructure = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(
      `/api/v1/payroll/salary-structure/change-active-status/${id}`,
      {
        offlineMetadata: { queryKey },
      },
    ),
  );
};

// ====================  Payroll Salary Structures End ====================

// ====================  Employee Promotions Start ====================

export const fetchEmployeePromotions = async (params) => {
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
      `/api/v1/payroll/promotion/get-all-list?${queryParams}`,
    );
  });
};

export const addOrUpdateEmployeePromotions = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/payroll/promotion/add-employee-promotion`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const deletePromotion = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(`/api/v1/payroll/promotion/delete-by-id/${id}`, {
      offlineMetadata: { queryKey },
    }),
  );
};

// Payroll Runs Start ====================
export const fetchPayrollRuns = async (params) => {
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
      `/api/v1/payroll/payroll-runs/get-all-list?${queryParams}`,
    );
  });
};

export const addOrUpdatePayrollRuns = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/payroll-runs/create-or-update`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const fetchEmpMonthlySalaryList = async (params) => {
  return offlineHandler.get(async () => {
    const {
      payrollRunId,
      page = 1,
      limit = 10,
      fields,
      ...otherParams
    } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "",
      fields,
    }).toString();

    return await RestApi.get(
      `/api/v1/payroll/employee-payroll-monthly-records/get-all-list-by-id/${payrollRunId}?${queryParams}`,
    );
  });
};

export const addOrUpdateEmpMonthlySalaryList = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/employee-payroll-monthly-records/add-or-update`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const payNowEmpMonthlySalary = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/employee-payroll-monthly-records/pay-now`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const deleteEmpMonthlyRecord = async (id, queryKey) => {
  return offlineHandler.delete(async () =>
    RestApi.delete(
      `/api/v1/payroll/employee-payroll-monthly-records/delete-by-id/${id}`,
      {
        offlineMetadata: { queryKey },
      },
    ),
  );
};

export const deleteBulkEmpMonthlyRecord = async (selectedIds, queryKey) => {
  const payload = {
    ids: selectedIds,
  };
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/employee-payroll-monthly-records/delete-bulk-by-ids`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const payNowBulkEmpMonthlyRecord = async (selectedIds, queryKey) => {
  const payload = {
    ids: selectedIds,
  };
  return offlineHandler.post(async () => {
    return RestApi.post(
      `/api/v1/payroll/employee-payroll-monthly-records/pay-now-bulk-by-ids`,
      payload,
      {
        offlineMetadata: { queryKey },
      },
    );
  });
};

export const fetchEmployeePenaltiesList = async (params) => {
  return offlineHandler.get(async () => {
    const queryParams = new URLSearchParams({
      params: JSON.stringify(params),
    }).toString();

    return await RestApi.get(
      `/api/v1/hr-management/get-all-employee-penalties-list?${queryParams}`,
    );
  });
};

export const fetchEmployeeSalarytList = async (employeeId) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/payroll/payment-history/get-basic-salary-by-employee-id/${employeeId}`,
    );
  });
};
