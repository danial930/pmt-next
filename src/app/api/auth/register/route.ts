// src/app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { validateBody } from "@/middleware/validation.middleware";
import { registerSchema } from "@/modules/auth/auth.validator";
import { AuthService } from "@/modules/auth/auth.service";
import { withRateLimit } from "@/middleware/rate-limit.middleware";
import { ApiResponse } from "@/core/response/api-response";

const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(
    withRateLimit(
      async (req: NextRequest) => {
        const body = await validateBody(req, registerSchema);
        const result = await service.register(body);
        return ApiResponse.success(
          result,
          "Registration successful. Please verify your email.",
          201,
        );
      },
      { max: 10, keyPrefix: "register" },
    ),
  ),
);
