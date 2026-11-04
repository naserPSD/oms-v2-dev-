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

// ---------------------------
// Axios Instance
// ---------------------------
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
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
      const sessionId = localStorage.getItem("sessionId");

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      if (sessionId) {
        config.headers["x-session-id"] = sessionId;
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
      const { setOffline } = useNetworkStore.getState();
      setOffline();
      // Return a rejected promise for the React Query mutation
      return Promise.reject(new Error("Network Error: Failed to fetch"));
    }

    // ... (Existing Token Refresh Logic) ...

    if (error.response?.status === 401 && !originalRequest._retry) {
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
          sessionId: localStorage.getItem("sessionId"),
        });

        const { accessToken, refreshToken, sessionId } = data.data;

        // ✅ Save tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("sessionId", sessionId);

        Cookies.set("accessToken", accessToken, { expires: 1, secure: true, sameSite: "lax" });
        Cookies.set("refreshToken", refreshToken, { expires: 7, secure: true, sameSite: "lax" });
        Cookies.set("sessionId", sessionId, { expires: 7, secure: true, sameSite: "lax" });

        // ✅ Update axios default headers immediately
        axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        axiosInstance.defaults.headers.common["x-session-id"] = sessionId;

        processQueue(null, accessToken, sessionId);

        // ✅ Retry original request with new headers
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        originalRequest.headers["x-session-id"] = sessionId;

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("sessionId");

          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          Cookies.remove("sessionId");
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
const errorHandler = (error) => {
  if (error.status === 401) {
    if (typeof window !== "undefined") localStorage.clear();
    toaster('Unauthorized access', 'error');
  } else if (error.status === 403) {
    toaster('Forbidden, The client does not have access rights to the content', 'error');
  } else if (error.status === 404) {
    toaster('Source Not Found', 'error');
  } else if (error.status === 500) {
    if (error.response && error.response.data) {
      toaster(error.response.data.message, 'error');
    }
  } else if (error.status === 503) {
    toaster('Service Unavailable', 'error');
  }
  console.error("Error:", error);
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

    await addToQueue({
      method,
      path,
      payload: data,
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
  const { cache, ...params } = options;

  if (typeof window === "undefined") {

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const token = cookies().get('token')?.value;
    const sessionId = cookies().get('sessionId')?.value;

    if (token) headers.Authorization = `Bearer ${token}`;
    if (sessionId) headers["x-session-id"] = sessionId;

    const url = new URL(`${baseURL}${path}`);
    Object.entries(params).forEach(([key, value]) => {
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

  const axiosConfig = { params };
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