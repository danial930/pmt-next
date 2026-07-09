// src/core/response/ApiResponse.ts
import { NextResponse } from "next/server";

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export class ApiResponse {
  static success<T>(data: T, message = "Success", status = 200, meta?: Meta) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        meta: meta ?? null,
        timestamp: new Date().toISOString(),
      },
      { status },
    );
  }

  static error(
    code: string,
    message: string,
    status: number,
    details?: unknown,
  ) {
    return NextResponse.json(
      {
        success: false,
        error: { code, message, details: details ?? null },
        timestamp: new Date().toISOString(),
      },
      { status },
    );
  }
}
