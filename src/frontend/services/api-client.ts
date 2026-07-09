// src/frontend/services/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  withCredentials: true, // sends refreshToken cookie
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const code = (error.response.data as any)?.error?.code;

      if (code === "TOKEN_EXPIRED") {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = apiClient
            .post("/auth/refresh")
            .then((res) => {
              const newToken = res.data.data.accessToken;
              setAccessToken(newToken);
              return newToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        originalRequest.headers!.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
