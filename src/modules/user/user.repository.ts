// src/modules/user/user.repository.ts
import { prisma } from "@/lib/prisma";
import { getSkipTake } from "@/core/pagination/pagination.util";
import { UserCreateInput, UserUpdateInput, UserWhereInput } from "../../../prisma/generated/models";

export class UserRepository {
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { where: { isActive: true }, include: { role: true } },
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: UserCreateInput) {
    return prisma.user.create({
      data,
      include: { userRoles: { include: { role: true } } },
    });
  }

  async update(id: number, data: UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        userRoles: { where: { isActive: true }, include: { role: true } },
      },
    });
  }

  async softDelete(id: number, updatedBy: number) {
    return prisma.user.update({
      where: { id },
      data: { isActive: false, updatedBy },
    });
  }

  async findMany(params: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search?: string;
    isActive?: boolean;
    roleId?: number;
  }) {
    const { skip, take } = getSkipTake(params.page, params.limit);

    const where: UserWhereInput = {
      ...(params.isActive !== undefined && { isActive: params.isActive }),
      ...(params.search && {
        OR: [
          { email: { contains: params.search, mode: "insensitive" } },
          { firstName: { contains: params.search, mode: "insensitive" } },
          { lastName: { contains: params.search, mode: "insensitive" } },
        ],
      }),
      ...(params.roleId && {
        userRoles: { some: { roleId: params.roleId, isActive: true } },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [params.sortBy]: params.sortOrder },
        include: {
          userRoles: { where: { isActive: true }, include: { role: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async setUserRoles(userId: string, roleIds: string[], updatedBy: string) {
    return prisma.$transaction(async (tx: any) => {
      await tx.userRole.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false, updatedBy },
      });

      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId,
            roleId,
            createdBy: updatedBy,
          })),
          skipDuplicates: true,
        });

        // Reactivate any previously soft-deleted mappings that match
        await tx.userRole.updateMany({
          where: { userId, roleId: { in: roleIds } },
          data: { isActive: true, updatedBy },
        });
      }
    });
  }
}
