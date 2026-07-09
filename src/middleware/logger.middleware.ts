// src/middleware/logger.middleware.ts
import { NextRequest } from "next/server";
import { logger } from "@/src/lib/logger";

type Handler = (req: NextRequest, ctx?: any) => Promise<Response>;

export const withRequestLogger = (handler: Handler): Handler => {
  return async (req, ctx) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    logger.info(
      {
        requestId,
        method: req.method,
        url: req.nextUrl.pathname,
        ip: req.headers.get("x-forwarded-for") ?? "unknown",
      },
      "Incoming request",
    );

    const response = await handler(req, ctx);

    logger.info(
      {
        requestId,
        method: req.method,
        url: req.nextUrl.pathname,
        status: response.status,
        durationMs: Date.now() - start,
      },
      "Request completed",
    );

    response.headers.set("x-request-id", requestId);
    return response;
  };
};
