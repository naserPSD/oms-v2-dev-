import RestApi, { offlineHandler } from "@/utils/RestApi";

const mapPaymentHistoryItem = (item = {}) => ({
  ...item,
  id: item.id,
  invoiceId: item.invoiceId || item.invoice_id || item.invoice?.id || item.id,
  invoiceNumber: item.invoiceNumber || item.invoice_number,
  subscriptionPlanId:
    item.subscriptionPlanId ||
    item.subscription_plan_id ||
    item.plan?.id ||
    item.subscriptionPlan?.id,
  subscriptionPlan: item.subscriptionPlan || item.plan,
  plan: item.plan || item.subscriptionPlan,
  planName: item.planName || item.plan?.name || item.subscriptionPlan?.name,
  billingCycle:
    item.billingCycle ||
    item.billing_cycle ||
    item.subscriptionBillingCycle ||
    item.plan?.billingCycle ||
    item.subscriptionPlan?.billingCycle,
  transactionId:
    item.transactionId ||
    item.tranId ||
    item.stripePaymentIntentId ||
    item.stripe_payment_intent_id,
  tranId:
    item.tranId ||
    item.transactionId ||
    item.stripePaymentIntentId ||
    item.stripe_payment_intent_id,
  amount: item.totalAmount ?? item.amount,
  currency: item.currency,
  status: item.status,
  paymentStatus: item.paymentStatus,
  activeFrom: item.activeFrom || item.subscriptionStartDate,
  activeTo: item.activeTo || item.subscriptionEndDate,
  paidAt: item.paidAt,
});

const mapPaymentHistoryResponse = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return { ...response, data: payload.map(mapPaymentHistoryItem) };
  }

  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    return {
      ...response,
      data: {
        ...payload,
        data: payload.data.map(mapPaymentHistoryItem),
      },
    };
  }

  return response;
};

export const getPaymentHistory = async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "paidAt:desc",
  invoiceNo = "",
  transactionId = "",
  paymentStatus = "",
  paymentDate = [],
  fields,
} = {}) => {
  const startDate = Array.isArray(paymentDate) && paymentDate[0] ? paymentDate[0] : "";
  const endDate = Array.isArray(paymentDate) && paymentDate[1] ? paymentDate[1] : "";

  const paramsObj = {
    ...(search ? { search } : {}),
    ...(invoiceNo ? { invoiceNo } : {}),
    ...(transactionId ? { transactionId } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    params: JSON.stringify(paramsObj),
    sort,
  });

  if (fields) query.set("fields", fields);

  return offlineHandler.get(async () => {
    try {
      const response = await RestApi.get(
        `/api/v1/subscription/payments/payment-history?${query.toString()}`,
      );
      return mapPaymentHistoryResponse(response);
    } catch (error) {
      console.error("Failed to fetch payment history from API:", error);
      return {
        data: [],
        pagination: {
          page: Number(page) || 1,
          limit: Number(limit) || 10,
          total: 0,
          lastPage: 1,
          resultRows: 0,
        },
      };
    }
  });
};