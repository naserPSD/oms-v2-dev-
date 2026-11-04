// src/utils/RestApiWithRefresh.js
import axios from 'axios'
import { toaster } from './helpers.js';
import Cookies from 'js-cookie';
import { cookies } from 'next/headers.js';

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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

// ---------------------------
// Wrapper Functions
// ---------------------------
const RestApi = {
  get: async (path, options = {}) => request('GET', path, null, options),
  post: async (path, data = {}, options = {}) => request('POST', path, data, options),
  put: async (path, data = {}, options = {}) => request('PUT', path, data, options),
  patch: async (path, data = {}, options = {}) => request('PATCH', path, data, options),
  delete: async (path, options = {}) => request('DELETE', path, null, options),
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

export default RestApi;
