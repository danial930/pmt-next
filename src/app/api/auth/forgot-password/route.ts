// src/app/api/auth/change-password/route.ts
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/middleware/error.middleware';
import { withRequestLogger } from '@/middleware/logger.middleware';
import { withAuth } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validation.middleware';
import { changePasswordSchema } from '@/modules/auth/auth.validator';
import { AuthService } from '@/modules/auth/auth.service';
import { ApiResponse } from '@/core/response/api-response';

const service = new AuthService();

export const POST = withErrorHandler(
  withRequestLogger(
    withAuth(async (req, user) => {
      const body = await validateBody(req, changePasswordSchema);
      await service.changePassword(
        user.userId,
        body.currentPassword,
        body.newPassword,
        {
          ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
          userAgent: req.headers.get('user-agent') ?? undefined,
        },
      );
      return ApiResponse.success(null, 'Password changed. All sessions have been signed out.');
    }),
  ),
);