// src/middleware/auth.middleware.ts
import { NextRequest } from "next/server";
import {
  verifyAccessToken,
  AccessTokenPayload,
} from "@/core/security/jwt.util";
import { ApiError } from "@/core/response/api-error";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest extends NextRequest {
  user: AccessTokenPayload;
}

export const authenticate = async (
  req: NextRequest,
): Promise<AccessTokenPayload> => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "TOKEN_EXPIRED", "Access token expired");
    }
    throw new ApiError(401, "TOKEN_INVALID", "Invalid access token");
  }

  // Ensure user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User account is inactive");
  }

  return payload;
};

type Handler = (
  req: NextRequest,
  user: AccessTokenPayload,
  ctx?: any,
) => Promise<Response>;

export const withAuth = (handler: Handler) => {
  return async (req: NextRequest, ctx?: any) => {
    const user = await authenticate(req);
    return handler(req, user, ctx);
  };
};
