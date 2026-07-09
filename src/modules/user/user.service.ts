// src/modules/user/user.service.ts
import { UserRepository } from "./user.repository";
import { AuditService, sanitizeForAudit } from "@/modules/audit/audit.service";
import { hashPassword } from "@/core/security/hash.util";
import { ApiError } from "@/core/response/api-error";
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryInput,
} from "./user.validator";
import { UserListItemDto } from "./user.dto";
import { getPaginationMeta } from "@/core/pagination/pagination.util";

export class UserService {
  constructor(
    private repo: UserRepository = new UserRepository(),
    private audit: AuditService = new AuditService(),
  ) {}

  private toListItem(user: any): UserListItemDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      roles: user.userRoles?.map((ur: any) => ur.role.name) ?? [],
      createdAt: user.createdAt,
    };
  }

  async list(query: UserQueryInput, requestingUserId: string) {
    const { items, total } = await this.repo.findMany(query);
    return {
      data: items.map((u: any) => this.toListItem(u)),
      meta: getPaginationMeta(total, query.page, query.limit),
    };
  }

  async getById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    return this.toListItem(user);
  }

  async create(input: CreateUserInput, performedById: string) {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) throw ApiError.conflict("Email already in use");

    const passwordHash = await hashPassword(input.password);

    const user = await this.repo.create({
      email: input.email,
      password: passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      isEmailVerified: false,
      createdBy: performedById,
      ...(input.roleIds && {
        userRoles: {
          create: input.roleIds.map((roleId) => ({
            roleId,
            createdBy: performedById,
          })),
        },
      }),
    });

    await this.audit.logCreate(
      "User",
      user.id,
      sanitizeForAudit({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleIds: input.roleIds,
      }),
      performedById,
    );

    return this.toListItem(user);
  }

  async update(id: string, input: UpdateUserInput, performedById: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound("User not found");

    const oldValues = sanitizeForAudit({
      firstName: existing.firstName,
      lastName: existing.lastName,
      isActive: existing.isActive,
      roles: existing.userRoles.map((ur: any) => ur.roleId),
    });

    const { roleIds, ...rest } = input;

    const updated = await this.repo.update(id, {
      ...rest,
      updatedBy: performedById,
    });

    if (roleIds !== undefined) {
      await this.repo.setUserRoles(id, roleIds, performedById);
    }

    const finalUser = await this.repo.findById(id);

    await this.audit.logUpdate(
      "User",
      id,
      oldValues,
      sanitizeForAudit({ ...rest, roleIds }),
      performedById,
    );

    return this.toListItem(finalUser);
  }

  async delete(id: string, performedById: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound("User not found");

    if (existing.id === performedById) {
      throw ApiError.badRequest("You cannot delete your own account");
    }

    await this.repo.softDelete(id, performedById);

    await this.audit.logDelete(
      "User",
      id,
      sanitizeForAudit({
        email: existing.email,
        firstName: existing.firstName,
        lastName: existing.lastName,
      }),
      performedById,
    );
  }
}
