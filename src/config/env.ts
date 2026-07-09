import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().url().optional(),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY_DAYS: z.coerce.number().default(30),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  SMTP_HOST: z.string().default("smtp.mailtrap.io"),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  EMAIL_FROM: z.string().default("noreply@ums.dev"),

  APP_URL: z.string().url().default("http://localhost:3000"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  // Guard: never run in browser bundle
  if (typeof window !== "undefined") return {} as Env;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    throw new Error("Invalid environment configuration. Check your .env file.");
  }

  return parsed.data;
}

export const env = loadEnv();
