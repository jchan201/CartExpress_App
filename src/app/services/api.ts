import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = "https://cartexpress-backend.onrender.com/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - you can add token here when auth is implemented
apiClient.interceptors.request.use(
  (config) => {
    // Add token to headers if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally and store tokens
apiClient.interceptors.response.use(
  (response) => {
    // Store token if present in response
    const data = response.data as ApiResponse<any>;
    if (data?.token) {
      const token = data.token;
      localStorage.setItem("authToken", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
}

export default apiClient;
