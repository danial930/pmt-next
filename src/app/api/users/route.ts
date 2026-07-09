// src/app/api/users/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/error.middleware";
import { withRequestLogger } from "@/middleware/logger.middleware";
import { requirePermissions } from "@/middleware/permission.middleware";
import { UserController } from "@/modules/user/user.controller";
import { PERMISSIONS } from "@/constants/permissions.constants";

export const GET = withErrorHandler(
  withRequestLogger(
    requirePermissions(PERMISSIONS.USER_LIST)(UserController.list),
  ),
);

export const POST = withErrorHandler(
  withRequestLogger(
    requirePermissions(PERMISSIONS.USER_CREATE)(UserController.create),
  ),
);
