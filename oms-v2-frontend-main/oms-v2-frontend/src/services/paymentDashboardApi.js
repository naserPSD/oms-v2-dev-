import RestApi from "@/utils/RestApi";

const dashboardPath = "/api/v1/admin/payment-dashboard";
const dashboardQueryKeys = ["dateRange", "fromDate", "toDate", "page", "limit"];
const transactionQueryKeys = [
  ...dashboardQueryKeys,
  "search",
  "status",
  "plan",
  "billingCycle",
  "sort",
];

const queryString = (params = {}, allowedKeys = dashboardQueryKeys) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!allowedKeys.includes(key)) return;
    if (value === undefined || value === null || value === "") return;
    if (key === "dateRange" && value === "custom") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") query.append(key, String(item));
      });
      return;
    }
    query.set(key, String(value));
  });

  return query.toString();
};

const get = (endpoint, params, allowedKeys = dashboardQueryKeys) => {
  const query = queryString(params, allowedKeys);
  return RestApi.get(`${dashboardPath}/${endpoint}${query ? `?${query}` : ""}`).then((response) => response.data);
};

export const getOverview = (filters) => get("overview", filters);
export const getRevenueTrend = (filters) => get("revenue-trend", filters);
export const getSubscriptionSales = (filters) => get("subscription-sales", filters);
export const getPaymentStatistics = (filters) => get("payment-statistics", filters);
export const getSubscriptionStatistics = (filters) => get("subscription-statistics", filters);
export const getTransactions = (params) =>
  get("transactions", params, transactionQueryKeys);

export const exportPayments = async (filters) => {
  const query = queryString(filters, transactionQueryKeys);
  return RestApi.get(`${dashboardPath}/export${query ? `?${query}` : ""}`, {
    responseType: "blob",
  });
};

export const downloadInvoice = (invoiceId) =>
  RestApi.get(`/api/v1/subscription/invoices/${invoiceId}/download`, {
    responseType: "blob",
    timeout: 30000,
    headers: {
      Accept: "application/pdf,application/octet-stream,*/*",
    },
    _suppressConsoleError: true,
  });