// src/core/security/hash.util.ts
import bcrypt from "bcryptjs";
import { env } from "@/config/env";

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (
  plain: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

export const hashToken = (token: string): string => {
  return require("crypto").createHash("sha256").update(token).digest("hex");
};
