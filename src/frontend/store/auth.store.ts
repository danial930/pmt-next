'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  expiresAt: number | null; // unix ms
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, accessToken: string, expiresIn: number) => void;
  setAccessToken: (token: string, expiresIn: number) => void;
  clearAuth: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, expiresIn) =>
        set({
          user,
          accessToken,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
        }),

      setAccessToken: (token, expiresIn) =>
        set({ accessToken: token, expiresAt: Date.now() + expiresIn * 1000 }),

      clearAuth: () =>
        set({ user: null, accessToken: null, expiresAt: null, isAuthenticated: false }),

      hasRole: (role) => get().user?.roles.includes(role) ?? false,
    }),
    {
      name: 'ums-auth',
      // Only persist user info, never the access token
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);