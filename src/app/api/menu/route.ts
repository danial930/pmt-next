// src/app/api/menu/route.ts
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/middleware/error.middleware';
import { withRequestLogger } from '@/middleware/logger.middleware';
import { withAuth } from '@/middleware/auth.middleware';
import { MenuService } from '@/modules/menu/menu.service';
import { ApiResponse } from '@/core/response/api-response';

const service = new MenuService();

// GET /api/menu — returns full tree + quick links + preferences in one call
export const GET = withErrorHandler(
  withRequestLogger(
    withAuth(async (_req, user) => {
      const result = await service.getMenuTreeForUser(
        user.userId,
        user.roles,
        user.permissions,
      );
      return ApiResponse.success(result, 'Menu loaded');
    }),
  ),
);