// src/modules/audit/audit.repository.ts
import { prisma } from "@/src/lib/prisma";

interface CreateAuditLogParams {
  entityName: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  performedById?: string | null;
}

export class AuditRepository {
  async create(params: CreateAuditLogParams) {
    return prisma.auditLog.create({
      data: {
        entityName: params.entityName,
        entityId: params.entityId,
        action: params.action,
        oldValues: params.oldValues ?? undefined,
        newValues: params.newValues ?? undefined,
        performedById: params.performedById ?? undefined,
        createdBy: params.performedById ?? undefined,
      },
    });
  }

  async findByEntity(entityName: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entityName, entityId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
