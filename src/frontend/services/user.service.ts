// src/frontend/services/user.service.ts
import { UserListItemDto } from "@/modules/user/user.dto";
import { apiClient } from "./api-client";

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  roleId?: string;
}

export const userService = {
  list: async (params: UserQueryParams) => {
    const { data } = await apiClient.get<PaginatedResponse<UserListItemDto>>(
      "/users",
      { params },
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data as UserListItemDto;
  },

  create: async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleIds?: string[];
  }) => {
    const { data } = await apiClient.post("/users", payload);
    return data.data as UserListItemDto;
  },

  update: async (
    id: string,
    payload: Partial<{
      firstName: string;
      lastName: string;
      isActive: boolean;
      roleIds: string[];
    }>,
  ) => {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data.data as UserListItemDto;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },
};
