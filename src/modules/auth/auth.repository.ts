// src/modules/auth/auth.repository.ts
import { prisma } from "@/lib/prisma";
import { UserCreateInput } from "../../../prisma/generated/models";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });
  }

  async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });
  }

  async createUser(data: UserCreateInput) {
    return prisma.user.create({ data });
  }

  async updatePassword(userId: number, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash, updatedBy: userId },
    });
  }

  async setEmailVerifyToken(userId: number, token: string, expiry: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken: token, emailVerifyExpiry: expiry },
    });
  }

  async verifyEmail(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });
  }

  async findByEmailVerifyToken(token: string) {
    return prisma.user.findFirst({
      where: { emailVerifyToken: token, emailVerifyExpiry: { gt: new Date() } },
    });
  }

  async setResetToken(userId: number, token: string, expiry: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
  }

  async findByResetToken(token: string) {
    return prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
  }

  async clearResetToken(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { resetToken: null, resetTokenExpiry: null },
    });
  }

  async incrementFailedLogin(userId: number, lockedUntil?: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: { increment: 1 },
        lockedUntil: lockedUntil ?? undefined,
      },
    });
  }

  async resetFailedLogin(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  // --- Refresh tokens ---
  async createRefreshToken(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date(), isActive: false },
    });
  }

  async revokeAllUserRefreshTokens(userId: number) {
    return prisma.refreshToken.updateMany({
      where: { userId, isActive: true },
      data: { revokedAt: new Date(), isActive: false },
    });
  }
}
