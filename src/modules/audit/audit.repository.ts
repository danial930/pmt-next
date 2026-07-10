// src/modules/audit/audit.repository.ts
import { prisma } from "@/lib/prisma";
import { InputJsonValue } from "../../../prisma/generated/internal/prismaNamespace";

interface CreateAuditLogParams {
  entityName: string;
  entityId: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValues?: InputJsonValue;
  newValues?: InputJsonValue;
  performedById?: number | null;
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

  async findByEntity(entityName: string, entityId: number) {
    return prisma.auditLog.findMany({
      where: { entityName, entityId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
