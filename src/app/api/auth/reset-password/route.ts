// src/app/api/auth/reset-password/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { validateBody } from "@/middleware/validation.middleware";
import { resetPasswordSchema } from "@/modules/auth/auth.validator";
import { AuthService } from "@/modules/auth/auth.service";
import { ApiResponse } from "@/core/response/api-response";

const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(async (req: NextRequest) => {
    const body = await validateBody(req, resetPasswordSchema);
    await service.resetPassword(body);
    return ApiResponse.success(null, "Password reset successfully");
  }),
);
