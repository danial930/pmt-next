// src/core/security/sanitize.util.ts
import sanitizeHtml from "sanitize-html";

export const sanitizeInput = (value: string): string => {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
};

export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
): T => {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = typeof val === "string" ? sanitizeInput(val) : val;
  }
  return result as T;
};
