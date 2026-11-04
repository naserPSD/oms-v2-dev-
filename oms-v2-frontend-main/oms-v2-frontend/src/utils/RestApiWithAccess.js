// src/utils/RestApiWithAccess.js
import axios from 'axios'
import { toaster } from './helpers.js';
import { cookies } from 'next/headers.js';
// import { cookies } from 'next/headers'; // ✅ Next.js cookies for server-side requests

// export const baseURL = process.env.NODE_ENV === 'production'
//   ? process.env.VITE_PROD_BASE_URL
//   : process.env.VITE_DEV_BASE_URL;

export const FRONT_BASE_URL = 'https://erp.studypress.org'
// Next.js example
export const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_PROD_BASE_URL
  : process.env.NEXT_PUBLIC_DEV_BASE_URL;

// const baseURL = 'http://localhost:3000/'

console.log('baseURL', baseURL)

// Standard Axios instance
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10 seconds
  headers: {
    Accept: 'application/json',
    'Content-Type': `application/json`,
  }
});

// Only add browser-specific interceptors in the browser
if (typeof window !== "undefined") {
  axiosInstance.interceptors.request.use(function (config) {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers.accessMenuName = window.location.href;
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
}

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // console.log('Response:', response);
    return response
  },
  (error) => {
    console.log('Response error:', error.response);
    return Promise.reject(errorHandler(error));
  }
);

const errorHandler = (error) => {
  if (error.status === 401) {
    if (typeof window !== "undefined") localStorage.clear();
    toaster('Unauthorized access', 'error')
    window.location.href = "/sign-in"; // redirect to login
  } else if (error.status === 403) {
    toaster('Forbidden, The client does not have access rights to the content', 'error')
  } else if (error.status === 404) {
    toaster('Source Not Found', 'error')
  } else if (error.status === 500) {
    if (error.response && error.response.data) {
      toaster(error.response.data.message, 'error')
    }
  } else if (error.status === 503) {
    toaster('Service Unavailable', 'error')
  }
  console.error("Error:", error);
  return error
}

// Utility to get token automatically
// const getToken = () => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem('token');
//   } else {
//     const cookieStore = cookies();
//     return cookieStore.get('token')?.value;
//   }
// };

// --------------------------------------------------
// ✅ Wrapper with query params + Next.js cache support
// --------------------------------------------------

// ✅ RestApi wrapper with GET/POST/PUT/PATCH/DELETE
const RestApi = {
  get: async (path, options = {}) => request('GET', path, null, options),
  post: async (path, data = {}, options = {}) => request('POST', path, data, options),
  put: async (path, data = {}, options = {}) => request('PUT', path, data, options),
  patch: async (path, data = {}, options = {}) => request('PATCH', path, data, options),
  delete: async (path, options = {}) => request('DELETE', path, null, options),
};

// Core request function
async function request(method, path, data = null, options = {}) {
  const { cache, ...params } = options; // token passed explicitly

  if (typeof window === "undefined") {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    
    const token = cookies().get('token')?.value;

    // console.log('token from RestApi client =====>', token);

    if (token) headers.Authorization = `Bearer ${token}`;
    // Server-side: use fetch with Next.js cache
    const url = new URL(`${baseURL}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.append(key, value);
    });

    // console.log(`[SERVER FETCH] ${url.toString()} at ${new Date().toISOString()}`);

    // console.log('method', method)
    // console.log('path', path)
    // console.log('options', options)
    // console.log('headers', headers)
    // console.log('data', data)
    // console.log('url', url.toString())
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...cache
    });

    // console.log('res ====>', res)

    if (!res.ok) throw new Error(`${method} ${url} failed with status ${res.status}`);
    return res.json();
  }

  // Client-side: use Axios
  const axiosConfig = { params };
  if (method !== 'GET' && data) axiosConfig.data = data;
  return axiosInstance({ method, url: path, ...axiosConfig }).then(res => res);
}

export default RestApi;
// export default axiosInstance;