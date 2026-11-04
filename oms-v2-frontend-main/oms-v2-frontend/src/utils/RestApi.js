// path: src/utils/RestApi.js
import axios from 'axios'
import { toaster } from './helpers.js';
import Cookies from 'js-cookie';
import { cookies } from 'next/headers.js';
import { useNetworkStore } from '@/utils/offline/networkStore.js';
// 🔑 NEW: Import queue functions
import { addToQueue } from './offline/offlineQueue.js';

// ---------------------------
// Base URL setup
// ---------------------------
export const FRONT_BASE_URL = 'https://erp.studypress.org'
export const baseURL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PROD_BASE_URL
    : process.env.NEXT_PUBLIC_DEV_BASE_URL;

console.log('baseURL', baseURL)

/** Optional endpoints: never clear session / toast Unauthorized on 401 */
const isSoftFailUnauthorizedUrl = (url = "") =>
  typeof url === "string" &&
  (url.includes("/employee/get-my-leave-policy") ||
    url.includes("/employee/my-leave-policy"));

/** Business errors (Google Calendar/Meet) must NOT trigger logout / token refresh */
const isBusinessUnauthorized = (error) => {
  const code = error?.response?.data?.code;
  if (typeof code === "string" && code.startsWith("GOOGLE_")) return true;
  const msg = String(error?.response?.data?.message || "");
  if (/Calendar API|Google Calendar|Meet link|Reconnect Google/i.test(msg)) {
    return true;
  }
  const url = String(
    error?.config?.url || error?.response?.config?.url || "",
  );
  // Meeting Google endpoints historically returned 401 for Calendar failures
  if (
    url.includes("/api/v1/meetings") &&
    (url.includes("/add-or-update") ||
      url.includes("/start") ||
      url.includes("/google/"))
  ) {
    return true;
  }
  return false;
};

/** localStorage.setItem(undefined) stores the string "undefined" */
const isValidSessionId = (sessionId) => {
  if (sessionId == null) return false;
  const value = String(sessionId).trim();
  return value.length > 0 && value !== "undefined" && value !== "null";
};

const getStoredSessionId = () => {
  if (typeof window === "undefined") return null;
  const sessionId = localStorage.getItem("sessionId");
  if (!isValidSessionId(sessionId)) {
    if (sessionId != null) localStorage.removeItem("sessionId");
    return null;
  }
  return sessionId;
};

const persistSessionId = (sessionId) => {
  if (typeof window === "undefined") return;
  if (!isValidSessionId(sessionId)) {
    localStorage.removeItem("sessionId");
    delete axiosInstance.defaults.headers.common["x-session-id"];
    return;
  }
  localStorage.setItem("sessionId", sessionId);
  axiosInstance.defaults.headers.common["x-session-id"] = sessionId;
};

// ---------------------------
// Axios Instance
// ---------------------------
const axiosInstance = axios.create({
  baseURL: baseURL,
  // Remote MySQL often exceeds 10s — leave-policy alone measured ~16s
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    // 'Content-Type': 'application/json',
  },
});

axiosInstance.defaults.withCredentials = true;

// ---------------------------
// Request Interceptor
// ---------------------------
if (typeof window !== "undefined") {
  axiosInstance.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem("accessToken");
      const sessionId = getStoredSessionId();

      if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      if (sessionId) {
        config.headers["x-session-id"] = sessionId;
      } else {
        delete config.headers["x-session-id"];
        delete axiosInstance.defaults.headers.common["x-session-id"];
      }

      config.headers.accessMenuName = window.location.href;
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// ---------------------------
// Refresh Token Logic
// ---------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null, sessionId = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // 🔑 Make sure retried request gets updated headers
      prom.resolve({ token, sessionId });
    }
  });
  failedQueue = [];
};

// ---------------------------
// Response Interceptor
// ---------------------------
axiosInstance.interceptors.response.use(
  (response) => {
    // 🔑 NEW: On successful response, set network state to online
    if (typeof window !== "undefined" && response.status >= 200 && response.status < 300) {
      const { setOnline } = useNetworkStore.getState();
      setOnline(); // Triggers sync via subscription in syncQueue.js
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 🔑 NEW: Explicit network error check
    if (!error.response || error.code === 'ERR_NETWORK') {
      const { setOffline, isSyncing } = useNetworkStore.getState();
      // Only mark offline when the browser is actually offline.
      // API/CORS/401 blips must NOT flip the whole app offline — that breaks
      // dashboard attendance queries (enabled: isOnline) and shows empty UI.
      if (
        !isSyncing &&
        typeof navigator !== "undefined" &&
        navigator.onLine === false
      ) {
        setOffline();
      }
      // Return a rejected promise for the React Query mutation
      return Promise.reject(new Error("Network Error: Failed to fetch"));
    }

    // Check if this is a 404 on lead-related endpoints before processing
    // These should be handled gracefully without showing error toasts
    const is404 = error.response?.status === 404;
    
    if (is404) {
      // Try multiple ways to get the URL - check both relative and absolute paths
      const url1 = originalRequest?.url || '';
      const url2 = error.config?.url || '';
      const url3 = error.request?.responseURL || '';
      const url4 = error.response?.config?.url || '';
      const baseUrl = originalRequest?.baseURL || error.config?.baseURL || baseURL || '';
      const fullUrl1 = baseUrl && url1 ? baseUrl + url1 : '';
      const fullUrl2 = baseUrl && url2 ? baseUrl + url2 : '';
      
      // Check all possible URL locations for lead endpoint pattern
      const allUrls = [url1, url2, url3, url4, fullUrl1, fullUrl2].filter(Boolean);
      const isLeadEndpoint = allUrls.some(url => {
        const urlStr = String(url);
        return urlStr.includes('/api/v1/crm/leads/') || 
               urlStr.includes('crm/leads/') ||
               urlStr.includes('/leads/') ||
               /\/leads\/[^\/]+(\/activities)?/.test(urlStr);
      });
      
      // Also check for user endpoints that might return 404 (for user mapping)
      const isUserEndpoint = allUrls.some(url => {
        const urlStr = String(url);
        return urlStr.includes('/api/v1/users/') || 
               urlStr.includes('/users/') ||
               urlStr.includes('users/get-all-users') ||
               urlStr.includes('users?');
      });

      // For 404s on lead endpoints or user endpoints, mark the error so the error handler knows to skip the toast
      if (isLeadEndpoint || isUserEndpoint) {
        error._isLeadEndpoint404 = true; // Reuse the same flag for both
        error._suppressConsoleError = true; // Flag to suppress console logging
        error._suppressReactQueryError = true; // Flag to suppress React Query error logging
        // Also store the flag on the response config for the error handler to check
        if (error.response?.config) {
          error.response.config._isLeadEndpoint404 = true;
          error.response.config._suppressConsoleError = true;
          error.response.config._suppressReactQueryError = true;
        }
        if (error.config) {
          error.config._isLeadEndpoint404 = true;
          error.config._suppressConsoleError = true;
          error.config._suppressReactQueryError = true;
        }
        if (originalRequest) {
          originalRequest._isLeadEndpoint404 = true;
          originalRequest._suppressConsoleError = true;
          originalRequest._suppressReactQueryError = true;
        }
        // Still reject so the catch block in API service can handle it
        return Promise.reject(error);
      }
    }

    // ... (Existing Token Refresh Logic) ...
    // Soft-fail endpoints (leave policy, etc.): still attempt token refresh,
    // but never wipe session / force logout if the call ultimately fails.

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Google Meet / Calendar business errors come back as 401 historically —
      // never treat them as expired OMS session.
      if (
        isBusinessUnauthorized(error) ||
        isSoftFailUnauthorizedUrl(originalRequest?.url) ||
        originalRequest?.skipUnauthorizedHandler ||
        originalRequest?._skipUnauthorizedHandler
      ) {
        return Promise.reject(errorHandler(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(({ token, sessionId }) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          if (sessionId) {
            originalRequest.headers["x-session-id"] = sessionId;
          }
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
          refreshToken: localStorage.getItem("refreshToken"),
          sessionId: getStoredSessionId(),
        });

        const { accessToken, refreshToken, sessionId } = data.data;

        // ✅ Save tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        persistSessionId(sessionId);

        Cookies.set("accessToken", accessToken, { expires: 1, secure: true, sameSite: "lax" });
        Cookies.set("refreshToken", refreshToken, { expires: 7, secure: true, sameSite: "lax" });
        if (isValidSessionId(sessionId)) {
          Cookies.set("sessionId", sessionId, { expires: 7, secure: true, sameSite: "lax" });
        }

        // ✅ Update axios default headers immediately
        axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + accessToken;

        processQueue(null, accessToken, isValidSessionId(sessionId) ? sessionId : null);

        // ✅ Retry original request with new headers
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        if (isValidSessionId(sessionId)) {
          originalRequest.headers["x-session-id"] = sessionId;
        } else {
          delete originalRequest.headers["x-session-id"];
        }

        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Error refreshing token:", err);
        processQueue(err, null, null);
        const softFail =
          originalRequest?.skipUnauthorizedHandler ||
          originalRequest?._skipUnauthorizedHandler ||
          isSoftFailUnauthorizedUrl(originalRequest?.url);
        if (softFail) {
          return Promise.reject(error);
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("sessionId");

          // Cookies.remove("accessToken");
          // Cookies.remove("refreshToken");
          // Cookies.remove("sessionId");
        }
        toaster('Session Expired', 'error');
        window.location.href = "/sign-in";
        return Promise.reject(errorHandler(err));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(errorHandler(error));
  }
);

// ---------------------------
// Error Handler
// ---------------------------
const isInitialSetupActive = () => {
  if (typeof window === "undefined") return false;
  if (window.__initialSetupModalOpen) return true;
  if (sessionStorage.getItem("triggerInitialSetup") === "true") return true;
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && !parsed.appUseCase) return true;
    }
  } catch (e) {}
  return false;
};

const errorHandler = (error) => {
  // Get error status - can be in error.status or error.response.status
  const status = error.status || error.response?.status;
  
  const requestUrl = String(
    error.config?.url || 
    error.request?.responseURL || 
    error.response?.config?.url || 
    (error.config?.baseURL && error.config?.url ? error.config.baseURL + error.config.url : '') ||
    ''
  );

  const requestMethod = String(
    error.config?.method || error.response?.config?.method || "get",
  ).toLowerCase();

  const skipErrorToast =
    Boolean(error.config?.skipErrorToast) ||
    Boolean(error.config?.skipToast) ||
    Boolean(error.response?.config?.skipErrorToast) ||
    Boolean(error.response?.config?.skipToast) ||
    Boolean(error._skipErrorToast) ||
    requestMethod === "get" ||
    isInitialSetupActive() ||
    requestUrl.includes("/api/v1/initial-setup") ||
    requestUrl.includes("/api/v1/auth/verify-otp-for-email-verification");
  
  // Check if this is a lead endpoint 404 (handled gracefully in API service)
  // Check multiple locations for the flag
  const isLeadEndpoint404 = error._isLeadEndpoint404 || 
                            error.config?._isLeadEndpoint404 || 
                            error.response?.config?._isLeadEndpoint404;
  
  // Also check URL pattern as fallback (must check BEFORE showing toast)
  let urlCheckPassed = false;
  if (!isLeadEndpoint404 && status === 404) {
    const errorUrl = requestUrl;
    urlCheckPassed = errorUrl.includes('/api/v1/crm/leads/') || 
                     errorUrl.includes('crm/leads/') ||
                     errorUrl.includes('/api/v1/users/') ||
                     errorUrl.includes('/users/') ||
                     errorUrl.includes('users/get-all-users') ||
                     errorUrl.includes('users?') ||
                     errorUrl.includes('/api/v1/subscription/invoices/') ||
                     errorUrl.includes('/download') ||
                     !!errorUrl.match(/\/leads\/[^\/]+(\/activities)?$/);
    
    if (urlCheckPassed) {
      // Mark it so we don't show the toast
      error._isLeadEndpoint404 = true;
      // Return early without showing toast or logging
      return error;
    }
  }
  
  // Skip error handling if this is a lead endpoint 404 (handled gracefully in API service)
  if (isLeadEndpoint404 || urlCheckPassed) {
    return error;
  }
  
  if (status === 401) {
    const softFail =
      error.config?.skipUnauthorizedHandler ||
      error.config?._skipUnauthorizedHandler ||
      isSoftFailUnauthorizedUrl(
        error.config?.url || error.response?.config?.url || "",
      ) ||
      isBusinessUnauthorized(error);
    if (softFail) {
      return error;
    }
    if (typeof window !== "undefined") {
      try {
        const preserved = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("crm_") ||
              key.startsWith("crm-") ||
              key.includes("crm_tasks") ||
              key.includes("tasks_store"))
          ) {
            preserved[key] = localStorage.getItem(key);
          }
        }
        localStorage.clear();
        Object.entries(preserved).forEach(([k, v]) => {
          if (v !== null) localStorage.setItem(k, v);
        });
      } catch (e) {
        try { localStorage.clear(); } catch (err) {}
      }
    }
    if (!skipErrorToast) {
      toaster('Unauthorized access', 'error');
    }
  } else if (status === 403) {
    const softFail =
      error.config?.skipUnauthorizedHandler ||
      error.config?._skipUnauthorizedHandler ||
      isSoftFailUnauthorizedUrl(
        error.config?.url || error.response?.config?.url || "",
      ) ||
      isBusinessUnauthorized(error);
    if (softFail) {
      return error;
    }
    if (!skipErrorToast) {
      toaster('Forbidden, The client does not have access rights to the content', 'error');
    }
  } else if (status === 404) {
    if (error.response && error.response.data) {
      // toaster(error.response.data.message, 'error');
    }
    // Only show toast if it's NOT a lead endpoint
    // if (!isLeadEndpoint404 && !urlCheckPassed) {
    //   toaster('Source Not Found', 'error');
    // }
  } else if (status === 400 || status === 409) {
    if (error.response && error.response.data) {
      let responseMessage = error.response.data.message;
      if (Array.isArray(responseMessage)) {
        responseMessage = responseMessage.join(', ');
      } else if (typeof responseMessage === 'object' && responseMessage !== null) {
        responseMessage = Object.values(responseMessage).join(', ');
      }
      if (typeof responseMessage === 'string' && !skipErrorToast) {
        toaster(responseMessage, 'error');
      }
    }
  } else if (status === 500) {
    if (error.response && error.response.data) {
      let responseMessage = error.response.data.message;
      const isDuplicateCompanyRole =
        requestUrl.includes(
          "/api/v1/role-permission/roles/company/add-or-update",
        ) &&
        (error.response.data.code === "ER_DUP_ENTRY" ||
          (typeof responseMessage === "string" &&
            (responseMessage.includes("Duplicate entry") ||
              responseMessage.includes("idx_roles_app_id_name"))));

      // Intercept foreign key constraint errors to show user-friendly message
      if (typeof responseMessage === "string" && responseMessage.includes("a foreign key constraint fails")) {
        responseMessage = "Cannot delete this record because it is currently in use by other records.";
      }

      // Background data loads (GET) should never surface raw server errors
      // as toasts when a user simply opens a page. Only user-triggered
      // actions (POST/PUT/PATCH/DELETE) get a toast.
      if (requestMethod === "get") {
        console.error(`[API 500] GET ${requestUrl}:`, responseMessage);
      } else if (!isDuplicateCompanyRole && !skipErrorToast) {
        toaster(responseMessage, 'error');
      }
    }
  } else if (status === 503) {
    if (!skipErrorToast) {
      toaster('Service Unavailable', 'error');
    }
  }
  
  // Don't log 404 errors for lead endpoints to console (they're handled gracefully)
  // Also don't log if we've already determined it's a lead endpoint or if suppressed
  const isDepartmentDuplicateConflict =
    status === 409 &&
    requestUrl.includes("/api/v1/application/add-or-update-department") &&
    typeof error.response?.data?.message?.name === "string";
  const isBusinessOrClientError = status === 400 || status === 409;
  const shouldSuppressError = isLeadEndpoint404 || 
                              isDepartmentDuplicateConflict ||
                              isBusinessOrClientError ||
                              urlCheckPassed || 
                              error._suppressConsoleError ||
                              error.config?._suppressConsoleError ||
                              error.response?.config?._suppressConsoleError;
  
  if (!shouldSuppressError) {
    console.error("Error:", error);
  } else if (isBusinessOrClientError && process.env.NODE_ENV !== "production") {
    console.warn(`[API ${status}] ${requestMethod.toUpperCase()} ${requestUrl}:`, error.response?.data?.message || error.message);
  }
  
  return error;
};

/**
 * Executes a network request or queues it if offline.
 */
const executeOrQueue = async (method, path, data, options = {}) => {
  // 🔑 Crucial: Check Zustand state for network availability
  const { isOnline } = useNetworkStore.getState();
  // 🔑 Extract offline metadata from options
  const { offlineMetadata = {} } = options;
  const { queryKey } = offlineMetadata; // This will be ["notice"]

  if (isOnline) {
    // console.log(`🟢 Online: Executing request for ${method} ${path}`);
    // Execute the request function directly
    return request(method, path, data, options);
  } else {
    // 🔴 Offline: Queue the request
    // console.log(`🔴 Offline: Queuing request for ${method} ${path}`);

    // Capture authentication tokens for later sync re-execution
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    // Validate and clean payload before queuing
    let cleanPayload = data;
    if (data && typeof data === 'object') {
      // Create a clean copy to avoid mutation issues
      cleanPayload = JSON.parse(JSON.stringify(data));
      
      // Remove undefined values
      Object.keys(cleanPayload).forEach(key => {
        if (cleanPayload[key] === undefined) {
          delete cleanPayload[key];
        }
      });
      
      // Ensure path doesn't have object IDs - extract to strings
      if (path && path.includes('/activities/')) {
        // Extract activityId from path if it's an object
        const pathParts = path.split('/');
        const activitiesIndex = pathParts.findIndex(p => p === 'activities');
        if (activitiesIndex >= 0 && activitiesIndex < pathParts.length - 1) {
          const idPart = pathParts[activitiesIndex + 1];
          if (idPart && typeof idPart === 'object') {
            // Extract ID from object
            const extractedId = idPart._id || idPart.id || idPart.toString();
            if (extractedId && extractedId !== '[object Object]') {
              pathParts[activitiesIndex + 1] = String(extractedId).trim();
              path = pathParts.join('/');
            }
          }
        }
      }
      
      // For lead updates, ensure contacts and remarks are arrays
      if (path && path.includes('/leads') && (path.includes('/activities') === false)) {
        if (cleanPayload.contacts !== undefined && !Array.isArray(cleanPayload.contacts)) {
          cleanPayload.contacts = [];
        }
        if (cleanPayload.remarks !== undefined && !Array.isArray(cleanPayload.remarks)) {
          cleanPayload.remarks = [];
        }
      }
    }
    
    await addToQueue({
      method,
      path,
      payload: cleanPayload,
      queryKey,
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        'x-session-id': sessionId,
      },
    });

    // Return a mock response object structure expected by React Query's onSuccess
    // This stops the React Query mutation from continually retrying on network error.
    return {
      data: {
        message: 'Request successfully queued, will sync when online.',
        offline: true
      },
      status: 202,
      offline: true
    };
  }
};

// ---------------------------
// Wrapper Functions (Updated to use executeOrQueue for CUD operations)
// ---------------------------
const RestApi = {
  get: async (path, options = {}) => request('GET', path, null, options),
  post: async (path, data = {}, options = {}) => executeOrQueue('POST', path, data, options),
  put: async (path, data = {}, options = {}) => executeOrQueue('PUT', path, data, options),
  patch: async (path, data = {}, options = {}) => executeOrQueue('PATCH', path, data, options),
  delete: async (path, options = {}) => executeOrQueue('DELETE', path, null, options),
  request: request,
};

async function request(method, path, data = null, options = {}) {
  const {
    cache,
    headers: requestHeaders,
    timeout,
    params: queryParams,
    responseType,
    onUploadProgress,
    offlineMetadata: _offlineMetadata,
    skipUnauthorizedHandler,
    _skipUnauthorizedHandler: _skipUnauthorizedHandlerOpt,
    _suppressConsoleError,
    _suppressReactQueryError,
    skipErrorToast,
    skipToast,
    ...legacyParams
  } = options;

  // Never serialize frontend-only flags into the API query string
  const axiosQueryParams =
    queryParams ??
    (Object.keys(legacyParams).length > 0 ? legacyParams : undefined);
  const softUnauthorized =
    Boolean(skipUnauthorizedHandler) ||
    Boolean(_skipUnauthorizedHandlerOpt) ||
    isSoftFailUnauthorizedUrl(path);

  if (typeof window === "undefined") {

    const headers = {
      Accept: "application/json",
      // "Content-Type": "application/json",
      // "Content-Type": "multipart/form-data",
      ...requestHeaders,
    };

    const token = cookies().get('token')?.value;
    const sessionId = cookies().get('sessionId')?.value;

    if (token) headers.Authorization = `Bearer ${token}`;
    if (sessionId) headers["x-session-id"] = sessionId;

    const url = new URL(`${baseURL}${path}`);
    Object.entries(axiosQueryParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.append(key, value);
    });

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...cache,
    });

    if (!res.ok) throw new Error(`${method} ${url} failed with status ${res.status}`);
    return res.json();
  }

  const axiosConfig = {
    params: axiosQueryParams,
    headers: requestHeaders,
    timeout,
    responseType,
    onUploadProgress,
    skipUnauthorizedHandler: softUnauthorized,
    _skipUnauthorizedHandler: softUnauthorized,
    skipErrorToast: Boolean(skipErrorToast || skipToast),
    skipToast: Boolean(skipErrorToast || skipToast),
    _suppressConsoleError: Boolean(_suppressConsoleError),
    _suppressReactQueryError: Boolean(_suppressReactQueryError),
  };
  if (method !== 'GET' && data) axiosConfig.data = data;
  return axiosInstance({ method, url: path, ...axiosConfig }).then((res) => res);
}

// 🔑 NEW: Helper to check if the response is the mock success object
const isMockSuccess = (response) => response && response.offline === true;

// 🔑 NEW: Helper to return empty paginated data for offline queries
const emptyPaginatedResponse = () => ({
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    lastPage: 1,
    resultRows: 0,
  },
});

/**
 * Core logic to execute a service action and apply offline-first rules.
 * @param {function} onlineAction - Function that returns a RestApi call.
 * @param {string} method - The HTTP method ('GET', 'POST', etc.).
 */
async function executeCoreHandler(onlineAction, method) {
  const type = method === 'GET' ? 'GET' : 'CUD';

  try {
    const result = await onlineAction();

    // 🔑 CUD QUEUE CHECK: If it was a mutation and RestApi queued the request
    if (type === 'CUD' && isMockSuccess(result)) {
      return result.data; // Return mock success data
    }

    // Return actual API data for online success
    return result.data;

  } catch (error) {
    // 🔑 CUD ERROR: Re-throw to trigger TanStack Query's onError/rollback
    if (type === 'CUD') {
      throw error;
    }

    // 🔑 GET OFFLINE: If GET fails due to network error, return empty state
    const { isOnline } = useNetworkStore.getState();
    if (!isOnline) {
      return emptyPaginatedResponse();
    }

    // For other online GET errors (e.g., 500), re-throw
    throw error;
  }
}

// ---------------------------
// 🔑 EXPORT: The new offlineHandler object
// ---------------------------
export const offlineHandler = {
  get: (onlineAction) => executeCoreHandler(onlineAction, 'GET'),
  post: (onlineAction) => executeCoreHandler(onlineAction, 'POST'),
  put: (onlineAction) => executeCoreHandler(onlineAction, 'PUT'),
  patch: (onlineAction) => executeCoreHandler(onlineAction, 'PATCH'),
  delete: (onlineAction) => executeCoreHandler(onlineAction, 'DELETE'),
};

export default RestApi;