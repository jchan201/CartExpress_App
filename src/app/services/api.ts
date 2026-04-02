import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = "https://cartexpress-backend.onrender.com/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add token and session ID to headers
apiClient.interceptors.request.use(
  (config) => {
    // Add token to headers if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add session ID to headers if available
    const sessionId = localStorage.getItem("cartexpress_sessionId");
    if (sessionId) {
      config.headers["x-session-id"] = sessionId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally and store tokens/session ID
apiClient.interceptors.response.use(
  (response) => {
    // Store token if present in response
    const data = response.data as ApiResponse<any>;
    if (data?.token) {
      const token = data.token;
      localStorage.setItem("authToken", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Store session ID if returned from backend
    if (response.data?.sessionId) {
      localStorage.setItem("cartexpress_sessionId", response.data.sessionId);
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login if needed
      localStorage.removeItem("authToken");
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error("Access forbidden:", error.message);
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = undefined> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
  sessionId?: string;
}

let inFlightRequestCount = 0;
let busyListener: ((count: number) => void) | null = null;

const notifyBusy = () => {
  if (busyListener) {
    busyListener(inFlightRequestCount);
  }
};

export const registerApiBusyListener = (callback: (count: number) => void) => {
  busyListener = callback;
  callback(inFlightRequestCount);
  return () => {
    if (busyListener === callback) {
      busyListener = null;
    }
  };
};

const pendingRequests = new Map<string, Promise<any>>();

const getRequestKey = (config: import("axios").AxiosRequestConfig) => {
  const { method, url, params, data } = config;
  const normalizedData = typeof data === "string" ? data : JSON.stringify(data || {});
  const normalizedParams = JSON.stringify(params || {});
  return `${method ?? "get"}:${url}:${normalizedParams}:${normalizedData}`;
};

const requestWithDedup = async <T>(config: import("axios").AxiosRequestConfig) => {
  const key = getRequestKey(config);

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<import("axios").AxiosResponse<T>>;
  }

  inFlightRequestCount += 1;
  notifyBusy();

  const promise = apiClient.request<T>(config).finally(() => {
    pendingRequests.delete(key);
    inFlightRequestCount = Math.max(0, inFlightRequestCount - 1);
    notifyBusy();
  });

  pendingRequests.set(key, promise);
  return promise;
};

export const dedupedApi = {
  get: <T = any>(url: string, config?: import("axios").AxiosRequestConfig) =>
    requestWithDedup<T>({ ...config, url, method: "get" }),
  post: <T = any>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) =>
    requestWithDedup<T>({ ...config, url, data, method: "post" }),
  put: <T = any>(url: string, data?: any, config?: import("axios").AxiosRequestConfig) =>
    requestWithDedup<T>({ ...config, url, data, method: "put" }),
  delete: <T = any>(url: string, config?: import("axios").AxiosRequestConfig) =>
    requestWithDedup<T>({ ...config, url, method: "delete" }),
};

export default apiClient;
