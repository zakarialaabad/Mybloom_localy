import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: import('@/types').User;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Sends HttpOnly cookies on cross-origin requests
  timeout: 15_000,
});

// ─── Request interceptor — attach Bearer token ────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get(process.env.NEXT_PUBLIC_TOKEN_COOKIE ?? 'parfum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — normalise errors ─────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiValidationError>) => {
    const status = error.response?.status;

    // Token expired — attempt a refresh, then retry once
    if (status === 401) {
      try {
        const { data } = await axios.post<AuthResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        Cookies.set(process.env.NEXT_PUBLIC_TOKEN_COOKIE ?? 'parfum_token', data.token, {
          secure: true,
          sameSite: 'strict',
        });

        // Retry original request with new token
        if (error.config) {
          error.config.headers.Authorization = `Bearer ${data.token}`;
          return apiClient.request(error.config);
        }
      } catch {
        // Refresh failed — clear session and redirect
        Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_COOKIE ?? 'parfum_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error.response?.data ?? error);
  },
);

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    Cookies.remove(process.env.NEXT_PUBLIC_TOKEN_COOKIE ?? 'parfum_token');
  },

  me: async (): Promise<import('@/types').User> => {
    const { data } = await apiClient.get<{ data: import('@/types').User }>('/auth/me');
    return data.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
    return data;
  },
};

// ─── Generic resource helpers ─────────────────────────────────────────────────

export const resourceService = {
  list: async <T>(resource: string, params?: Record<string, unknown>) => {
    const { data } = await apiClient.get<{ data: T[]; meta?: unknown }>(resource, { params });
    return data;
  },

  get: async <T>(resource: string, id: number | string) => {
    const { data } = await apiClient.get<{ data: T }>(`${resource}/${id}`);
    return data.data;
  },

  create: async <T>(resource: string, payload: unknown) => {
    const { data } = await apiClient.post<{ data: T }>(resource, payload);
    return data.data;
  },

  update: async <T>(resource: string, id: number | string, payload: unknown) => {
    const { data } = await apiClient.put<{ data: T }>(`${resource}/${id}`, payload);
    return data.data;
  },

  destroy: async (resource: string, id: number | string) => {
    await apiClient.delete(`${resource}/${id}`);
  },
};

export default apiClient;
