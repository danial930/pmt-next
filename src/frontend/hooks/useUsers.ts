// src/frontend/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserQueryParams } from "../services/user.service";

export const userKeys = {
  all: ["users"] as const,
  list: (params: UserQueryParams) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export const useUsers = (params: UserQueryParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.list(params),
    placeholderData: (prev) => prev,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof userService.update>[1];
    }) => userService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
