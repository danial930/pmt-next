// src/app/api/menu/preferences/route.ts
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/middleware/error.middleware';
import { withRequestLogger } from '@/middleware/logger.middleware';
import { withAuth } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validation.middleware';
import { MenuService } from '@/modules/menu/menu.service';
import { ApiResponse } from '@/core/response/api-response';
import { z } from 'zod';

const service = new MenuService();

const prefsSchema = z.object({
  navMode: z.enum(['sidebar', 'topbar']).optional(),
  sidebarCollapsed: z.boolean().optional(),
  sidebarWidth: z.number().min(200).max(400).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  accentColor: z.string().optional(),
  expandedMenuKeys: z.array(z.string()).optional(),
});

export const PATCH = withErrorHandler(
  withRequestLogger(
    withAuth(async (req, user) => {
      const body = await validateBody(req, prefsSchema);
      const result = await service.updatePreferences(user.sub, body);
      return ApiResponse.success(result, 'Preferences updated');
    }),
  ),
);