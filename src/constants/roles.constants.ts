// src/constants/roles.constant.ts
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER",
} as const;

export type RoleName = keyof typeof ROLES;
