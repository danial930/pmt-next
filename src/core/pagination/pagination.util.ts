// src/core/pagination/pagination.util.ts
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number,
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const getSkipTake = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});
