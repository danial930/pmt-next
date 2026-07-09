// src/modules/user/user.validator.ts
import { z } from "zod";
import { paginationSchema } from "@/src/core/pagination/pagination.util";

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/);

export const createUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: passwordSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  roleIds: z.array(z.string().uuid()).optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional(),
});

export const userQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  roleId: z.string().uuid().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
