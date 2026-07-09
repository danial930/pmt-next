// src/modules/auth/auth.service.ts
import { randomBytes } from "crypto";
import { AuthRepository } from "./auth.repository";
import {
  hashPassword,
  comparePassword,
  hashToken,
} from "@/src/core/security/hash.util";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/src/core/security/jwt.util";
import { ApiError } from "@/core/response/ApiError";
import { env } from "@/src/config/env";
import { AuditService } from "@/src/modules/audit/audit.service";
import {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
} from "./auth.validator";
import { AuthTokensDto, UserResponseDto } from "./auth.dto";

const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MINUTES = 15;

export class AuthService {
  constructor(
    private repo: AuthRepository = new AuthRepository(),
    private audit: AuditService = new AuditService(),
  ) {}

  private toUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      roles: user.userRoles?.map((ur: any) => ur.role.name) ?? [],
      createdAt: user.createdAt,
    };
  }

  private extractRolesAndPermissions(user: any) {
    const roles: string[] = [];
    const permissionSet = new Set<string>();

    for (const ur of user.userRoles ?? []) {
      if (!ur.role.isActive) continue;
      roles.push(ur.role.name);
      for (const rp of ur.role.rolePermissions ?? []) {
        if (rp.isActive && rp.permission.isActive) {
          permissionSet.add(rp.permission.name);
        }
      }
    }

    return { roles, permissions: Array.from(permissionSet) };
  }

  async register(input: RegisterInput): Promise<UserResponseDto> {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    const passwordHash = await hashPassword(input.password);
    const verifyToken = randomBytes(32).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await this.repo.createUser({
      email: input.email,
      password: passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: verifyExpiry,
    });

    await this.audit.logCreate("User", user.id, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // TODO: send verification email with `verifyToken`
    return this.toUserResponse({ ...user, userRoles: [] });
  }

  async login(
    input: LoginInput,
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<{ user: UserResponseDto; tokens: AuthTokensDto }> {
    const user = await this.repo.findUserByEmail(input.email);

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiError(
        403,
        "ACCOUNT_LOCKED",
        "Account temporarily locked due to failed login attempts",
      );
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) {
      const failedCount = user.failedLoginCount + 1;
      const lockedUntil =
        failedCount >= MAX_FAILED_LOGINS
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : undefined;

      await this.repo.incrementFailedLogin(user.id, lockedUntil);
      throw ApiError.unauthorized("Invalid email or password");
    }

    await this.repo.resetFailedLogin(user.id);

    const { roles, permissions } = this.extractRolesAndPermissions(user);

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    });

    const refreshJti = randomBytes(16).toString("hex");
    const refreshToken = signRefreshToken({ sub: user.id, jti: refreshJti });
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return {
      user: this.toUserResponse(user),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "TOKEN_INVALID", "Invalid refresh token");
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await this.repo.findRefreshToken(tokenHash);

    if (
      !stored ||
      !stored.isActive ||
      stored.revokedAt ||
      stored.expiresAt < new Date()
    ) {
      throw new ApiError(
        401,
        "TOKEN_INVALID",
        "Refresh token expired or revoked",
      );
    }

    const user = await this.repo.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User not found or inactive");
    }

    // Rotate refresh token
    await this.repo.revokeRefreshToken(tokenHash);

    const { roles, permissions } = this.extractRolesAndPermissions(user);

    const newAccessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    });

    const newJti = randomBytes(16).toString("hex");
    const newRefreshToken = signRefreshToken({ sub: user.id, jti: newJti });
    const newRefreshHash = hashToken(newRefreshToken);
    const expiresAt = new Date(
      Date.now() + env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.repo.createRefreshToken({
      userId: user.id,
      tokenHash: newRefreshHash,
      expiresAt,
      userAgent: stored.userAgent ?? undefined,
      ipAddress: stored.ipAddress ?? undefined,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.repo.findRefreshToken(tokenHash);
    if (stored && stored.isActive) {
      await this.repo.revokeRefreshToken(tokenHash);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repo.revokeAllUserRefreshTokens(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw ApiError.notFound("User not found");

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw ApiError.badRequest("Current password is incorrect");

    const newHash = await hashPassword(newPassword);
    await this.repo.updatePassword(userId, newHash);
    await this.repo.revokeAllUserRefreshTokens(userId); // force re-login on all devices

    await this.audit.logUpdate(
      "User",
      userId,
      { password: "[REDACTED]" },
      { password: "[REDACTED]" },
      userId,
    );
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.repo.findUserByEmail(email);
    if (!user) return; // do not reveal user existence

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.repo.setResetToken(user.id, token, expiry);

    // TODO: send email with reset link containing `token`
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await this.repo.findByResetToken(input.token);
    if (!user) throw ApiError.badRequest("Invalid or expired reset token");

    const newHash = await hashPassword(input.newPassword);
    await this.repo.updatePassword(user.id, newHash);
    await this.repo.clearResetToken(user.id);
    await this.repo.revokeAllUserRefreshTokens(user.id);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.repo.findByEmailVerifyToken(token);
    if (!user)
      throw ApiError.badRequest("Invalid or expired verification token");

    await this.repo.verifyEmail(user.id);
  }
}
