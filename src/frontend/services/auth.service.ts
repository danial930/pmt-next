// src/frontend/services/auth.service.ts
import { apiClient, setAccessToken } from "./api-client";

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    setAccessToken(data.data.accessToken);
    return data.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
    setAccessToken(null);
  },

  refresh: async () => {
    const { data } = await apiClient.post("/auth/refresh");
    setAccessToken(data.data.accessToken);
    return data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  },
};
