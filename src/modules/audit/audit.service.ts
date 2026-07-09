// src/modules/audit/audit.service.ts
import { AuditRepository } from "./audit.repository";

export class AuditService {
  constructor(private repo: AuditRepository = new AuditRepository()) {}

  async logCreate(
    entityName: string,
    entityId: string,
    newValues: Record<string, unknown>,
    userId?: string,
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
    entityId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
    userId?: string,
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
    entityId: string,
    oldValues: Record<string, unknown>,
    userId?: string,
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
