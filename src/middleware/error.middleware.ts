// src/middleware/error.middleware.ts
import { NextRequest } from "next/server";
import { ApiResponse } from "@/core/response/api-response";
import { ApiError } from "@/core/response/api-error";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

type Handler = (req: NextRequest, ctx?: any) => Promise<Response>;

export const withErrorHandler = (handler: Handler): Handler => {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return ApiResponse.error(
          err.code,
          err.message,
          err.statusCode,
          err.details,
        );
      }

      if (err instanceof ZodError) {
        return ApiResponse.error(
          "VALIDATION_ERROR",
          "Validation failed",
          400,
          err.flatten().fieldErrors,
        );
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          return ApiResponse.error("CONFLICT", "Resource already exists", 409, {
            fields: err.meta?.target,
          });
        }
        if (err.code === "P2025") {
          return ApiResponse.error("NOT_FOUND", "Resource not found", 404);
        }
      }

      logger.error({ err }, "Unhandled error");
      return ApiResponse.error("INTERNAL_ERROR", "Internal server error", 500);
    }
  };
};
