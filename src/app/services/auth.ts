import apiClient, { ApiResponse, dedupedApi } from "./api";

export interface User {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "admin" | "vendor";
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
export interface CheckLoginResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const TOKEN_KEY = "authToken";
let currentUser: User | null = null;

/**
 * Store authentication token in localStorage and update API headers
 */
export const storeAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await dedupedApi.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        credentials
      );
      const token = response.data.token;
      const data = response.data.data;

      if (token) {
        storeAuthToken(token);
      }

      currentUser = data.user;
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  /**
   * Check login status
   */
  checkLogin: async (): Promise<CheckLoginResponse> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return Promise.reject(new Error("No authentication token found"));
    try {
      const response = await dedupedApi.post<ApiResponse<CheckLoginResponse>>(
        "/auth/check-login",
        { token }
      );
      const data = response.data.data;

      currentUser = data.user;
      return data;
    } catch (error) {
      console.error("Failed to check login status:", error);
      currentUser = null;
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await dedupedApi.post<ApiResponse<AuthResponse>>(
        "/auth/register",
        credentials
      );
      const data = response.data.data;

      storeAuthToken(data.token);
      currentUser = data.user;

      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  /**
   * Logout - clear stored credentials
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    currentUser = null;
    delete apiClient.defaults.headers.common["Authorization"];
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get current user from memory
   */
  getUser: (): User | null => {
    return currentUser;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Initialize auth on app load - restore token if available
   */
  initializeAuth: (): void => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },
};
