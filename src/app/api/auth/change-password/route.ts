// src/app/api/auth/change-password/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { withAuth } from "@/middleware/auth.middleware";
import { validateBody } from "@/middleware/validation.middleware";
import { changePasswordSchema } from "@/modules/auth/auth.validator";
import { AuthService } from "@/modules/auth/auth.service";
import { ApiResponse } from "@/core/response/api-response";

const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(
    withAuth(async (req, user) => {
      const body = await validateBody(req, changePasswordSchema);
      await service.changePassword(
        user.sub,
        body.currentPassword,
        body.newPassword,
      );
      return ApiResponse.success(
        null,
        "Password changed successfully. Please log in again.",
      );
    }),
  ),
);
