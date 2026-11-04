// src/services/subscriptionApi.js
import RestApi, { offlineHandler } from "@/utils/RestApi";

// --- GET Operations ---
export const fetchSubscriptions = async (params) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryObj = {
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "sortOrder:ASC",
    };
    
    if (fields !== undefined) {
      queryObj.fields = fields;
    }

    const queryParams = new URLSearchParams(queryObj).toString();

    return await RestApi.get(
      `/api/v1/subscription/subscription-plans/get-all-list?${queryParams}`
    );
  });
};

// --- GET Operations ---
export const fetchActiveSubscriptions = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(
      `/api/v1/subscription/get-all-active-subscription-plans`
    );
  });
};

export async function fetchPublicActiveSubscriptionPlans() {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_PROD_BASE_URL
      : process.env.NEXT_PUBLIC_DEV_BASE_URL;

  try {
    const res = await fetch(
      `${baseUrl || "http://localhost:4000"}/api/v1/subscription/get-all-active-subscription-plans`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (error) {
    console.error("fetchPublicActiveSubscriptionPlans error:", error);
    return [];
  }
}

export const initiatePayment = async ({ subscriptionPlanId, billingCycle }) => {
  const result = await RestApi.post(`/api/v1/payment/initiate`, {
    subscriptionPlanId: Number(subscriptionPlanId),
    billingCycle: String(billingCycle).toLowerCase(),
  });

  return result.data;
};

export const verifyPaymentTransaction = async (tranId) => {
  return await RestApi.get(`/api/v1/payment/verify/${encodeURIComponent(tranId)}`);
};

export const getPaymentTransactionDetails = async (tranId) => {
  return await RestApi.get(`/api/v1/payment/details/${encodeURIComponent(tranId)}`);
};


// --- CUD Operations ---

export const addOrUpdateSubscription = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/subscription/subscription-plans/add-or-update`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const deleteSubscription = async (id, queryKey) => {
  return offlineHandler.delete(async () => {
    return RestApi.delete(`/api/v1/subscription/subscription-plans/delete-by-id/${id}`, {
      offlineMetadata: { queryKey },
    });
  });
};

export const toggleStatusSubscription = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/subscription/subscription-plans/change-active-status/${id}`, {
      offlineMetadata: { queryKey },
    })
  );
};
export const addUserSubscriptionRecord = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/subscription/add-or-update-subscription`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

// --- Coupon API Operations ---

export const fetchCoupons = async (params = {}) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, fields, ...otherParams } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      params: JSON.stringify(otherParams),
      sort: "id:DESC",
      ...(fields ? { fields } : {}),
    }).toString();

    return await RestApi.get(
      `/api/v1/subscription/get-all-coupons?${queryParams}`
    );
  });
};

export const fetchCouponById = async (id) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/subscription/get-coupon-by-id/${id}`);
  });
};

export const addOrUpdateCoupon = async (payload, queryKey) => {
  return offlineHandler.post(async () => {
    return RestApi.post(`/api/v1/subscription/add-or-update-coupon`, payload, {
      offlineMetadata: { queryKey },
    });
  });
};

export const deleteCoupon = async (id, queryKey) => {
  return offlineHandler.delete(async () => {
    return RestApi.delete(`/api/v1/subscription/delete-coupon/${id}`, {
      offlineMetadata: { queryKey },
    });
  });
};

export const toggleStatusCoupon = async (id, queryKey) => {
  return offlineHandler.patch(async () =>
    RestApi.patch(`/api/v1/subscription/change-coupon-status/${id}`, {
      offlineMetadata: { queryKey },
    })
  );
};

export const validateCouponApi = async (payload) => {
  return RestApi.post(`/api/v1/subscription/validate-coupon`, payload);
};

export const fetchCurrentCompanySubscription = async () => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/subscription/current-company-subscription`);
  });
};

export const fetchSubscriberCompanies = async (params = {}) => {
  return offlineHandler.get(async () => {
    const { page = 1, limit = 10, search = "", planType = "all", status = "all" } = params;
    const queryObj = {
      page: page.toString(),
      limit: limit.toString(),
      search: search ? search.trim() : "",
      planType,
      status,
    };
    const queryString = new URLSearchParams(queryObj).toString();
    return await RestApi.get(`/api/v1/subscription/subscriber-companies?${queryString}`);
  });
};

export const toggleSubscriberCompanyStatus = async ({ id, isActive }) => {
  return offlineHandler.patch(async () => {
    return await RestApi.patch(`/api/v1/subscription/subscriber-companies/${id}/toggle-status`, { isActive });
  });
};

export const fetchCompanyPurchaseHistory = async (companyId) => {
  return offlineHandler.get(async () => {
    return await RestApi.get(`/api/v1/subscription/subscriber-companies/${companyId}/purchase-history`);
  });
};

export const togglePopularSubscription = async (id) => {
  return offlineHandler.patch(async () => {
    return await RestApi.patch(`/api/v1/subscription/subscription-plans/change-popular-status/${id}`);
  });
};


