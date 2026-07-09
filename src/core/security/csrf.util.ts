// src/core/security/csrf.util.ts
import crypto from "crypto";

export const generateCsrfToken = (): string =>
  crypto.randomBytes(32).toString("hex");

export const verifyCsrfToken = (
  cookieToken: string | undefined,
  headerToken: string | null,
): boolean => {
  if (!cookieToken || !headerToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken),
  );
};
