// src/modules/user/user.controller.ts
import { NextRequest } from "next/server";
import { UserService } from "./user.service";
import { ApiResponse } from "@/core/response/api-response";
import {
  validateBody,
  validateQuery,
} from "@/middleware/validation.middleware";
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from "./user.validator";
import { AccessTokenPayload } from "@/core/security/jwt.util";

const service = new UserService();

export class UserController {
  static async list(req: NextRequest, user: AccessTokenPayload) {
    const query = validateQuery(req, userQuerySchema);
    const result = await service.list(query, user.sub);
    return ApiResponse.success(
      result.data,
      "Users retrieved successfully",
      200,
      result.meta,
    );
  }

  static async getById(
    req: NextRequest,
    _user: AccessTokenPayload,
    ctx: { params: { id: string } },
  ) {
    const data = await service.getById(ctx.params.id);
    return ApiResponse.success(data, "User retrieved successfully");
  }

  static async create(req: NextRequest, user: AccessTokenPayload) {
    const body = await validateBody(req, createUserSchema);
    const data = await service.create(body, user.sub);
    return ApiResponse.success(data, "User created successfully", 201);
  }

  static async update(
    req: NextRequest,
    user: AccessTokenPayload,
    ctx: { params: { id: string } },
  ) {
    const body = await validateBody(req, updateUserSchema);
    const data = await service.update(ctx.params.id, body, user.sub);
    return ApiResponse.success(data, "User updated successfully");
  }

  static async delete(
    req: NextRequest,
    user: AccessTokenPayload,
    ctx: { params: { id: string } },
  ) {
    await service.delete(ctx.params.id, user.sub);
    return ApiResponse.success(null, "User deleted successfully");
  }
}
