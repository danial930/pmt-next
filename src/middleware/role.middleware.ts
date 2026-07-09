// src/middleware/role.middleware.ts
import { NextRequest } from "next/server";
import { AccessTokenPayload } from "@/core/security/jwt.util";
import { ApiError } from "@/core/response/api-error";
import { authenticate } from "./auth.middleware";

type Handler = (
  req: NextRequest,
  user: AccessTokenPayload,
  ctx?: any,
) => Promise<Response>;

export const requireRoles = (...roles: string[]) => {
  return (handler: Handler) => {
    return async (req: NextRequest, ctx?: any) => {
      const user = await authenticate(req);

      const hasRole = roles.some((r) => user.roles.includes(r));
      if (!hasRole) {
        throw ApiError.forbidden(`Requires one of roles: ${roles.join(", ")}`);
      }

      return handler(req, user, ctx);
    };
  };
};
