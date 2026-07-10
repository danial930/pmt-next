// src/modules/audit/audit.service.ts
import { InputJsonValue } from "../../../prisma/generated/internal/prismaNamespace";
import { AuditRepository } from "./audit.repository";

export class AuditService {
  constructor(private repo: AuditRepository = new AuditRepository()) {}

  async logCreate(
    entityName: string,
    entityId: number,
    newValues:InputJsonValue,
    userId?: number,
  ) {
    return this.repo.create({
      entityName,
      entityId,
      action: "CREATE",
      newValues,
      performedById: userId,
    });
  }

  async logUpdate(
    entityName: string,
    entityId: number,
    oldValues: InputJsonValue,
    newValues: InputJsonValue,
    userId?: number,
  ) {
    return this.repo.create({
      entityName,
      entityId,
      action: "UPDATE",
      oldValues,
      newValues,
      performedById: userId,
    });
  }

  async logDelete(
    entityName: string,
    entityId: number,
    oldValues: InputJsonValue,
    userId?: number,
  ) {
    return this.repo.create({
      entityName,
      entityId,
      action: "DELETE",
      oldValues,
      performedById: userId,
    });
  }
}

// Sensitive fields excluded from audit storage
export const sanitizeForAudit = (
  obj: Record<string, unknown>,
): Record<string, unknown> => {
  const { password, resetToken, emailVerifyToken, ...rest } = obj;
  return rest;
};
