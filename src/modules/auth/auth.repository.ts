// src/modules/auth/auth.repository.ts
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";

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

  async findUserById(id: string) {
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

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash, updatedBy: userId },
    });
  }

  async setEmailVerifyToken(userId: string, token: string, expiry: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken: token, emailVerifyExpiry: expiry },
    });
  }

  async verifyEmail(userId: string) {
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

  async setResetToken(userId: string, token: string, expiry: Date) {
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

  async clearResetToken(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { resetToken: null, resetTokenExpiry: null },
    });
  }

  async incrementFailedLogin(userId: string, lockedUntil?: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: { increment: 1 },
        lockedUntil: lockedUntil ?? undefined,
      },
    });
  }

  async resetFailedLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockedUntil: null },
    });
  }

  // --- Refresh tokens ---
  async createRefreshToken(data: {
    userId: string;
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

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, isActive: true },
      data: { revokedAt: new Date(), isActive: false },
    });
  }
}
