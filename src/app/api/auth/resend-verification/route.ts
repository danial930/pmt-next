// src/app/api/auth/resend-verification/route.ts
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/middleware/error.middleware';
import { withRequestLogger } from '@/middleware/logger.middleware';
import { withRateLimit } from '@/middleware/rate-limit.middleware';
import { validateBody } from '@/middleware/validation.middleware';
import { z } from 'zod';
import { AuthService } from '@/modules/auth/auth.service';
import { ApiResponse } from '@/core/response/api-response';

const service = new AuthService();

const schema = z.object({ email: z.string().email().toLowerCase() });

export const POST = withErrorHandler(
  withRequestLogger(
    withRateLimit(
      async (req: NextRequest) => {
        const { email } = await validateBody(req, schema);
        await service.resendVerificationEmail(email);
        return ApiResponse.success(
          null,
          'If your email is registered and unverified, a new link has been sent.',
        );
      },
      { max: 3, keyPrefix: 'resend-verification' },
    ),
  ),
);