// src/app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { validateBody } from "@/middleware/validation.middleware";
import { loginSchema } from "@/modules/auth/auth.validator";
import { AuthService } from "@/modules/auth/auth.service";

import { env } from "@/config/env";
import { withRateLimit } from "@/middleware/rate-limit.middleware";
import { ApiResponse } from "@/core/response/api-response";

const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(
    withRateLimit(
      async (req: NextRequest) => {
        const body = await validateBody(req, loginSchema);

        const result = await service.login(body, {
          userAgent: req.headers.get("user-agent") ?? undefined,
          ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        });

        const response = ApiResponse.success(
          {
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn,
          },
          "Login successful",
        );

        // Store refresh token in httpOnly cookie
        response.cookies.set("refreshToken", result.tokens.refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/auth",
          maxAge: env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60,
        });

        return response;
      },
      { max: 5, keyPrefix: "login" },
    ),
  ),
);
