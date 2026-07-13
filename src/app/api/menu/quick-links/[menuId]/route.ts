// src/app/api/menu/quick-links/[menuId]/route.ts
import { withErrorHandler } from '@/middleware/error.middleware';
import { withRequestLogger } from '@/middleware/logger.middleware';
import { withAuth } from '@/middleware/auth.middleware';
import { MenuService } from '@/modules/menu/menu.service';
import { ApiResponse } from '@/core/response/api-response';

const service = new MenuService();

export const DELETE = withErrorHandler(
  withRequestLogger(
    withAuth(async (_req, user, ctx) => {
      await service.removeQuickLink(user.sub, ctx.params.menuId);
      return ApiResponse.success(null, 'Quick link removed');
    }),
  ),
);