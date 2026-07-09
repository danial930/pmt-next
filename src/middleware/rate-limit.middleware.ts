// src/middleware/rateLimit.middleware.ts
import { NextRequest } from "next/server";
import { ApiError } from "@/core/response/ApiError";
import { env } from "@/src/config/env";

// In-memory store (use Redis in multi-instance deployments)
const store = new Map<string, { count: number; resetAt: number }>();

type Handler = (req: NextRequest, ctx?: any) => Promise<Response>;

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
}

export const withRateLimit = (
  handler: Handler,
  options: RateLimitOptions = {},
): Handler => {
  const windowMs = options.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const max = options.max ?? env.RATE_LIMIT_MAX;
  const keyPrefix = options.keyPrefix ?? "global";

  return async (req, ctx) => {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count += 1;
      if (entry.count > max) {
        throw ApiError.tooManyRequests(
          "Too many requests, please try again later",
        );
      }
    }

    return handler(req, ctx);
  };
};
