// src/app/api/auth/verify-email/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { validateQuery } from "@/middleware/validation.middleware";
import { verifyEmailSchema } from "@/modules/auth/auth.validator";
import { AuthService } from "@/modules/auth/auth.service";
import { ApiResponse } from "@/core/response/api-response";

const service = new AuthService();

export const GET = withErrorHandler(
  withRequestLogger(async (req: NextRequest) => {
    const { token } = validateQuery(req, verifyEmailSchema);
    await service.verifyEmail(token);
    return ApiResponse.success(null, "Email verified successfully");
  }),
);
