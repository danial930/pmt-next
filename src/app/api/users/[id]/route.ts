// src/app/api/users/[id]/route.ts
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { requirePermissions } from "@/middleware/permission.middleware";
import { UserController } from "@/modules/user/user.controller";
import { PERMISSIONS } from "@/constants/permissions.constants";

export const GET = withErrorHandler(
  withRequestLogger(
    requirePermissions(PERMISSIONS.USER_READ)(UserController.getById),
  ),
);

export const PUT = withErrorHandler(
  withRequestLogger(
    requirePermissions(PERMISSIONS.USER_UPDATE)(UserController.update),
  ),
);

export const DELETE = withErrorHandler(
  withRequestLogger(
    requirePermissions(PERMISSIONS.USER_DELETE)(UserController.delete),
  ),
);
