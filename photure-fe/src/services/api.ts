import axios, { type AxiosResponse, type AxiosError, type AxiosInstance } from 'axios';
import { toastUtils, toastMessages } from '@/lib/toastUtils';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance without auth interceptor
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        toastUtils.error(toastMessages.auth.required);
      } else if (status === 403) {
        toastUtils.error(toastMessages.auth.accessDenied);
      } else if (status >= 500) {
        toastUtils.error(toastMessages.network.serverError);
      } else if (status === 400) {
        toastUtils.error(toastMessages.network.badRequest);
      }
    } else if (error.code === 'NETWORK_ERROR') {
      toastUtils.error(toastMessages.network.error);
    } else {
      toastUtils.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

// Helper function to create authenticated API instance with token
export const createAuthenticatedApi = (token: string | null) => {
  const authenticatedApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Response interceptor for error handling
  authenticatedApi.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toastUtils.error(toastMessages.auth.required);
        } else if (status === 403) {
          toastUtils.error(toastMessages.auth.accessDenied);
        } else if (status >= 500) {
          toastUtils.error(toastMessages.network.serverError);
        } else if (status === 400) {
          toastUtils.error(toastMessages.network.badRequest);
        }
      } else if (error.code === 'NETWORK_ERROR') {
        toastUtils.error(toastMessages.network.error);
      } else {
        toastUtils.error('An unexpected error occurred.');
      }
      return Promise.reject(error);
    }
  );

  return authenticatedApi;
};

// Helper function for making authenticated requests
export const makeAuthenticatedRequest = async <T = unknown>(
  getToken: () => Promise<string | null>,
  requestFn: (api: AxiosInstance) => Promise<AxiosResponse<T>>
): Promise<T> => {
  const token = await getToken();
  const authenticatedApi = createAuthenticatedApi(token);
  const response = await requestFn(authenticatedApi);
  return response.data;
};

export default api; 