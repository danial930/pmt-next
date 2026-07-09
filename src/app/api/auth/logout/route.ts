// src/app/api/auth/logout/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { AuthService } from "@/modules/auth/auth.service";
import { ApiResponse } from "@/core/response/api-response";
const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(async (req: NextRequest) => {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      await service.logout(refreshToken);
    }

    const response = ApiResponse.success(null, "Logout successful");
    response.cookies.delete("refreshToken");
    return response;
  }),
);
