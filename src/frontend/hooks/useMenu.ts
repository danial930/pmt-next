// src/frontend/hooks/useMenu.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/frontend/services/api-client';
import { MenuNode, QuickLink, UserPreferenceDto } from '@/types/menu.types';
import { useCallback } from 'react';

interface MenuData {
  tree: MenuNode[];
  quickLinks: QuickLink[];
  preferences: UserPreferenceDto;
}

const menuKeys = {
  all: ['menu'] as const,
  data: () => [...menuKeys.all, 'data'] as const,
};

async function fetchMenu(): Promise<MenuData> {
  const { data } = await apiClient.get('/menu');
  return data.data;
}

export function useMenu() {
  return useQuery({
    queryKey: menuKeys.data(),
    queryFn: fetchMenu,
    staleTime: 5 * 60 * 1000,    // 5 min — menus don't change often
    gcTime: 10 * 60 * 1000,
  });
}

export function usePreferences() {
  const queryClient = useQueryClient();

  // Optimistic update — UI responds instantly, syncs to server in background
  return useMutation({
    mutationFn: async (prefs: Partial<UserPreferenceDto>) => {
      const { data } = await apiClient.patch('/menu/preferences', prefs);
      return data.data;
    },
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.data() });
      const previous = queryClient.getQueryData<MenuData>(menuKeys.data());

      queryClient.setQueryData<MenuData>(menuKeys.data(), (old) => {
        if (!old) return old;
        return { ...old, preferences: { ...old.preferences, ...newPrefs } };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(menuKeys.data(), context.previous);
      }
    },
  });
}

export function useQuickLinks() {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: async (menuId: string) => {
      await apiClient.post('/menu/quick-links', { menuId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: menuKeys.data() }),
  });

  const remove = useMutation({
    mutationFn: async (menuId: string) => {
      await apiClient.delete(`/menu/quick-links/${menuId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: menuKeys.data() }),
  });

  const reorder = useMutation({
    mutationFn: async (menuIds: string[]) => {
      await apiClient.put('/menu/quick-links', { menuIds });
    },
    onMutate: async (menuIds) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.data() });
      const previous = queryClient.getQueryData<MenuData>(menuKeys.data());

      queryClient.setQueryData<MenuData>(menuKeys.data(), (old) => {
        if (!old) return old;
        const sorted = menuIds
          .map((id, i) => {
            const ql = old.quickLinks.find((q) => q.menuId === id);
            return ql ? { ...ql, sortOrder: i } : null;
          })
          .filter(Boolean) as QuickLink[];
        return { ...old, quickLinks: sorted };
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(menuKeys.data(), ctx.previous);
    },
  });

  return { add, remove, reorder };
}