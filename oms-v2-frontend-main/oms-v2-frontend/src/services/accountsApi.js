import RestApi, { offlineHandler } from "@/utils/RestApi";

// --- Income APIs ---
export const fetchIncomes = (params = {}) => {
  return offlineHandler.get(async () => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.status && params.status !== "all") queryParams.set("status", params.status);
    if (params.fromDate) queryParams.set("fromDate", params.fromDate);
    if (params.toDate) queryParams.set("toDate", params.toDate);
    const queryString = queryParams.toString();

    return RestApi.get(`/api/v1/accounts/incomes${queryString ? `?${queryString}` : ""}`);
  });
};

export const fetchIncomeById = (id) =>
  offlineHandler.get(() => RestApi.get(`/api/v1/accounts/incomes/${id}`));

export const createIncome = (payload) =>
  RestApi.post("/api/v1/accounts/incomes", payload).then((res) => res.data);

export const updateIncome = (id, payload) =>
  RestApi.patch(`/api/v1/accounts/incomes/${id}`, payload).then((res) => res.data);

export const deleteIncome = (id) =>
  RestApi.delete(`/api/v1/accounts/incomes/${id}`).then((res) => res.data);

// --- Income Category APIs ---
export const fetchIncomeCategories = (params = {}) => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get("/api/v1/accounts/categories/combined/income", { params });
    } catch (error) {
      console.warn("API fetchIncomeCategories failed, using fallback state:", error);
      return { data: [] };
    }
  });
};

export const createIncomeCategory = (payload) => {
  const isMaster = payload.source === "master";
  return offlineHandler.post(() =>
    RestApi.post(`/api/v1/accounts/categories/${isMaster ? "master" : "user"}/income`, payload)
  );
};

export const updateIncomeCategory = (id, payload) => {
  const isMaster = payload.source === "master";
  return offlineHandler.patch(() =>
    RestApi.patch(`/api/v1/accounts/categories/${isMaster ? "master" : "user"}/income/${id}`, payload)
  );
};

export const deleteIncomeCategory = (id, source = "user") => {
  const isMaster = source === "master";
  return offlineHandler.delete(() =>
    RestApi.delete(`/api/v1/accounts/categories/${isMaster ? "master" : "user"}/income/${id}`)
  );
};

// --- Master Categories Import API ---
export const importMasterCategories = (payload) =>
  RestApi.post("/api/v1/accounts/categories/master/import", payload).then((res) => res.data);

// --- Invoice APIs ---

export const fetchInvoices = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", params.page);
    if (params.limit) queryParams.set("limit", params.limit);
    if (params.search) {
      queryParams.set("params", JSON.stringify({ search: params.search }));
    }
    const queryString = queryParams.toString();
    const url = `/api/v1/subscription/get-all-invoices${queryString ? `?${queryString}` : ""}`;
    const response = await RestApi.get(url);
    return response.data;
  } catch (error) {
    console.warn("API fetchInvoices failed, using fallback/local storage:", error);
    return null;
  }
};

export const createOrUpdateInvoice = async (payload) => {
  try {
    const response = await RestApi.post("/api/v1/subscription/invoices/add-or-update", payload);
    return response.data;
  } catch (error) {
    console.error("API createOrUpdateInvoice failed:", error);
    throw error;
  }
};

export const deleteInvoiceApi = async (id) => {
  if (!id || String(id).startsWith("draft_") || Number(id) > 100000000000) {
    return { status: "success", message: "Draft removed" };
  }
  try {
    const response = await RestApi.delete(`/api/v1/subscription/invoices/${id}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404 || error?.status === 404) {
      return { status: "success", message: "Invoice already removed" };
    }
    // Fallback try legacy subscription invoice delete endpoint
    try {
      const legacyRes = await RestApi.delete(`/api/v1/subscription/delete-subscription-invoice/${id}`);
      return legacyRes.data;
    } catch (legacyErr) {
      if (legacyErr?.response?.status === 404 || legacyErr?.status === 404) {
        return { status: "success", message: "Invoice already removed" };
      }
      throw error;
    }
  }
};

export const downloadInvoicePdf = async (id) => {
  try {
    const response = await RestApi.get(`/api/v1/subscription/invoices/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("API downloadInvoicePdf failed:", error);
    throw error;
  }
};

// --- Expense APIs ---

// 1. Core Expense CRUD APIs
export const fetchExpenses = (params = {}) => {
  return offlineHandler.get(async () => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.status && params.status !== "all") queryParams.set("status", params.status);
    if (params.category && params.category !== "all") queryParams.set("category", params.category);
    if (params.fromDate) queryParams.set("fromDate", params.fromDate);
    if (params.toDate) queryParams.set("toDate", params.toDate);
    const queryString = queryParams.toString();

    try {
      return await RestApi.get(`/api/v1/accounts/expenses${queryString ? `?${queryString}` : ""}`);
    } catch (error) {
      console.warn("API fetchExpenses failed (500/network), using fallback state:", error);
      return { data: { data: [], pagination: { page: params.page || 1, limit: params.limit || 10, total: 0 } } };
    }
  });
};

export const fetchExpenseById = (id) => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get(`/api/v1/accounts/expenses/${id}`);
    } catch (error) {
      console.warn(`API fetchExpenseById(${id}) failed:`, error);
      return { data: null };
    }
  });
};

export const createExpense = (payload) =>
  offlineHandler.post(() => RestApi.post("/api/v1/accounts/expenses", payload));

export const updateExpense = (id, payload) =>
  offlineHandler.patch(() => RestApi.patch(`/api/v1/accounts/expenses/${id}`, payload));

export const deleteExpense = (id) =>
  offlineHandler.delete(() => RestApi.delete(`/api/v1/accounts/expenses/${id}`));

// 2. Expense Category APIs
export const fetchExpenseCategories = (params = {}) => {
  return offlineHandler.get(async () => {
    try {
      return await RestApi.get("/api/v1/accounts/categories/combined/expense", { params });
    } catch (error) {
      console.warn("API fetchExpenseCategories failed (500/network), using fallback state:", error);
      return { data: [] };
    }
  });
};

export const createExpenseCategory = (payload) => {
  const isMaster = payload.source === "master";
  return offlineHandler.post(() =>
    RestApi.post(`/api/v1/accounts/categories/${isMaster ? "master" : "user"}/expense`, payload)
  );
};

export const updateExpenseCategory = (id, payload) => {
  const isMaster = payload.source === "master";
  return offlineHandler.patch(() =>
    RestApi.patch(`/api/v1/accounts/categories/${isMaster ? "master" : "user"}/expense/${id}`, payload)
  );
};

export const deleteExpenseCategory = (id, source = "user") => {
  const isMaster = source === "master";
  return offlineHandler.delete(() =>
    RestApi.delete(`/api/v1/accounts/categories/${isMaster ? "master" : "user"}/expense/${id}`)
  );
};

// 3. Analytics & Summary API
export const fetchExpenseSummary = (params = {}) => {
  return offlineHandler.get(async () => {
    const queryParams = new URLSearchParams();
    if (params.fromDate) queryParams.set("fromDate", params.fromDate);
    if (params.toDate) queryParams.set("toDate", params.toDate);
    if (params.category && params.category !== "all") queryParams.set("category", params.category);
    const queryString = queryParams.toString();

    try {
      return await RestApi.get(
        `/api/v1/accounts/expenses/summary${queryString ? `?${queryString}` : ""}`
      );
    } catch (error) {
      console.warn("API fetchExpenseSummary failed (500/network), using fallback state:", error);
      return {
        data: {
          totalExpenses: 0,
          paidAmount: 0,
          pendingAmount: 0,
          totalCount: 0,
          categoryBreakdown: [],
        },
      };
    }
  });
};

// 4. Receipts & Attachments APIs
export const uploadExpenseAttachment = (id, formData) =>
  RestApi.post(`/api/v1/accounts/expenses/${id}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data);

export const downloadExpenseAttachment = async (id, fileId) => {
  const response = await RestApi.get(
    `/api/v1/accounts/expenses/${id}/attachments/${fileId}`,
    { responseType: "blob" }
  );
  return response.data;
};

export const deleteExpenseAttachment = (id, fileId) =>
  RestApi.delete(`/api/v1/accounts/expenses/${id}/attachments/${fileId}`).then(
    (res) => res.data
  );

export const exportIncomesCsv = async (params = {}) => {
  const queryParams = new URLSearchParams({ format: "csv" });
  if (params.search) queryParams.set("search", params.search);
  if (params.status && params.status !== "all") queryParams.set("status", params.status);
  if (params.category && params.category !== "all") queryParams.set("category", params.category);
  if (params.fromDate) queryParams.set("fromDate", params.fromDate);
  if (params.toDate) queryParams.set("toDate", params.toDate);

  const response = await RestApi.get(
    `/api/v1/accounts/incomes/export?${queryParams.toString()}`,
    { responseType: "blob", _suppressConsoleError: true }
  );
  return response.data;
};

export const exportExpensesFormat = async (params = {}, format = "csv") => {
  const queryParams = new URLSearchParams({ format });
  if (params.search) queryParams.set("search", params.search);
  if (params.status && params.status !== "all") queryParams.set("status", params.status);
  if (params.category && params.category !== "all") queryParams.set("category", params.category);
  if (params.fromDate) queryParams.set("fromDate", params.fromDate);
  if (params.toDate) queryParams.set("toDate", params.toDate);

  const response = await RestApi.get(
    `/api/v1/accounts/expenses/export?${queryParams.toString()}`,
    { responseType: "blob", _suppressConsoleError: true }
  );
  return response.data;
};

export const downloadPaymentVoucherPdf = async (id) => {
  const response = await RestApi.get(`/api/v1/accounts/expenses/${id}/voucher-pdf`, {
    responseType: "blob",
  });
  return response.data;
};

// 6. Bulk Operations APIs
export const bulkDeleteExpenses = (ids) =>
  offlineHandler.post(() => RestApi.post("/api/v1/accounts/expenses/bulk-delete", { ids }));

export const bulkUpdateExpenseStatus = (ids, status) =>
  offlineHandler.patch(() => RestApi.patch("/api/v1/accounts/expenses/bulk-status-update", { ids, status }));
export const exportIncomesFormat = async (params = {}, format = "csv") => {
  const queryParams = new URLSearchParams({ format });
  if (params.search) queryParams.set("search", params.search);
  if (params.status && params.status !== "all") queryParams.set("status", params.status);
  if (params.category && params.category !== "all") queryParams.set("category", params.category);
  if (params.fromDate) queryParams.set("fromDate", params.fromDate);
  if (params.toDate) queryParams.set("toDate", params.toDate);

  const response = await RestApi.get(
    `/api/v1/accounts/incomes/export?${queryParams.toString()}`,
    { responseType: "blob", _suppressConsoleError: true }
  );
  return response.data;
};

export const fetchAccountsDashboard = async (params = {}) => {
  return offlineHandler.get(async () => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.set("startDate", params.startDate);
    if (params.endDate) queryParams.set("endDate", params.endDate);
    if (params.category && params.category !== "All Categories") {
      queryParams.set("category", params.category);
    }
    const queryString = queryParams.toString();

    const response = await RestApi.get(`/api/v1/accounts/reports/dashboard${queryString ? `?${queryString}` : ""}`);
    return response.data; 
  });
};
