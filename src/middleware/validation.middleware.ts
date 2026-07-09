// src/middleware/validation.middleware.ts
import { NextRequest } from "next/server";
import { ZodSchema } from "zod";
import { ApiError } from "@/core/response/ApiError";

export const validateBody = async <T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): Promise<T> => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw ApiError.badRequest("Invalid JSON body");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw ApiError.badRequest(
      "Validation failed",
      result.error.flatten().fieldErrors,
    );
  }
  return result.data;
};

export const validateQuery = <T>(req: NextRequest, schema: ZodSchema<T>): T => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = schema.safeParse(params);
  if (!result.success) {
    throw ApiError.badRequest(
      "Invalid query parameters",
      result.error.flatten().fieldErrors,
    );
  }
  return result.data;
};
