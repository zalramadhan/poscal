import { prisma } from '@/lib/prisma'

interface AuditLogParams {
  tenantId: string
  userId: string
  entity: string
  entityId: string
  action: string
  oldValue?: unknown
  newValue?: unknown
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        entity: params.entity,
        entityId: params.entityId,
        action: params.action,
        oldValue: params.oldValue ?? undefined,
        newValue: params.newValue ?? undefined,
      },
    })
  } catch (error) {
    console.error('[AuditLog Error]', error)
  }
}
