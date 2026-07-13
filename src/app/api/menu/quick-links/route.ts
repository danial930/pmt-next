// src/app/api/menu/quick-links/route.ts
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/middleware/error.middleware';
import { withRequestLogger } from '@/middleware/logger.middleware';
import { withAuth } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validation.middleware';
import { MenuService } from '@/modules/menu/menu.service';
import { ApiResponse } from '@/core/response/api-response';
import { z } from 'zod';

const service = new MenuService();

const addSchema = z.object({ menuId: z.string().uuid() });
const reorderSchema = z.object({ menuIds: z.array(z.string().uuid()).min(1).max(10) });

export const POST = withErrorHandler(
  withRequestLogger(
    withAuth(async (req, user) => {
      const { menuId } = await validateBody(req, addSchema);
      await service.addQuickLink(user.sub, menuId);
      return ApiResponse.success(null, 'Quick link added');
    }),
  ),
);

export const PUT = withErrorHandler(
  withRequestLogger(
    withAuth(async (req, user) => {
      const { menuIds } = await validateBody(req, reorderSchema);
      await service.reorderQuickLinks(user.sub, menuIds);
      return ApiResponse.success(null, 'Quick links reordered');
    }),
  ),
);