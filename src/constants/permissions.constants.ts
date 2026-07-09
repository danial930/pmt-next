// src/constants/permissions.constant.ts
export const PERMISSIONS = {
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_LIST: "user:list",

  ROLE_CREATE: "role:create",
  ROLE_READ: "role:read",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  ROLE_ASSIGN: "role:assign",

  PERMISSION_READ: "permission:read",
  PERMISSION_ASSIGN: "permission:assign",

  AUDIT_READ: "audit:read",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
