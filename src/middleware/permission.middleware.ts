// src/middleware/permission.middleware.ts
import { NextRequest } from "next/server";
import { AccessTokenPayload } from "@/src/core/security/jwt.util";
import { ApiError } from "@/core/response/ApiError";
import { authenticate } from "./auth.middleware";

type Handler = (
  req: NextRequest,
  user: AccessTokenPayload,
  ctx?: any,
) => Promise<Response>;

export const requirePermissions = (...permissions: string[]) => {
  return (handler: Handler) => {
    return async (req: NextRequest, ctx?: any) => {
      const user = await authenticate(req);

      const hasAll = permissions.every((p) => user.permissions.includes(p));
      if (!hasAll) {
        throw ApiError.forbidden(
          `Missing required permission(s): ${permissions.join(", ")}`,
        );
      }

      return handler(req, user, ctx);
    };
  };
};

// at least one of the given permissions
export const requireAnyPermission = (...permissions: string[]) => {
  return (handler: Handler) => {
    return async (req: NextRequest, ctx?: any) => {
      const user = await authenticate(req);

      const hasAny = permissions.some((p) => user.permissions.includes(p));
      if (!hasAny) {
        throw ApiError.forbidden(
          `Missing required permission(s): one of ${permissions.join(", ")}`,
        );
      }

      return handler(req, user, ctx);
    };
  };
};
