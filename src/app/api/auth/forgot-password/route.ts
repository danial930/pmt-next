// src/app/api/auth/forgot-password/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";

import { validateBody } from "@/middleware/validation.middleware";
import { forgotPasswordSchema } from "@/modules/auth/auth.validator";
import { AuthService } from "@/modules/auth/auth.service";
import { withRateLimit } from "@/middleware/rate-limit.middleware";
import { ApiResponse } from "@/core/response/api-response";

const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(
    withRateLimit(
      async (req: NextRequest) => {
        const body = await validateBody(req, forgotPasswordSchema);
        await service.forgotPassword(body.email);
        return ApiResponse.success(
          null,
          "If the email exists, a reset link has been sent.",
        );
      },
      { max: 5, keyPrefix: "forgot-password" },
    ),
  ),
);
