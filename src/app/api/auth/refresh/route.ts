// src/app/api/auth/refresh/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { AuthService } from "@/modules/auth/auth.service";
import { env } from "@/config/env";
import { ApiResponse } from "@/core/response/api-response";
import { ApiError } from "@/core/response/api-error";

const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(async (req: NextRequest) => {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (!refreshToken)
      throw ApiError.unauthorized("Refresh token not provided");

    const tokens = await service.refresh(refreshToken);

    const response = ApiResponse.success(
      { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn },
      "Token refreshed successfully",
    );

    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return response;
  }),
);
