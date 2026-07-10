// src/core/security/jwt.util.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "@/config/env";

export interface AccessTokenPayload extends JwtPayload {
  sub: string; // userId
  email: string;
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: number;
  sub: string;
  jti: string; // unique token id, maps to RefreshToken.id
}

export const signAccessToken = (
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as StringValue, // 15m
  });
};

export const signRefreshToken = (
  payload: Omit<RefreshTokenPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_EXPIRY_DAYS}d`, // 30d
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const verified = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  return {...verified, userId: Number(verified.sub)}; // Ensure sub is a number
};
