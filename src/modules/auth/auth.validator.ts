// src/modules/auth/auth.validator.ts
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: passwordSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
