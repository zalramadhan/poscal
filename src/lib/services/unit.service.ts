// ──────────────────────────────────────────────────────
// POS AI - Unit Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { UnitInput } from '@/validators/unit'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'

export const unitService = {
  async list(tenantId: string) {
    return prisma.unit.findMany({ where: { tenantId }, orderBy: { name: 'asc' } })
  },

  async getById(id: string, tenantId: string) {
    const unit = await prisma.unit.findFirst({ where: { id, tenantId } })
    if (!unit) throw new NotFoundError('Unit')
    return unit
  },

  async create(tenantId: string, userId: string, input: UnitInput) {
    const existing = await prisma.unit.findFirst({ where: { tenantId, name: input.name } })
    if (existing) throw new AppError('Unit already exists', 409)
    const unit = await prisma.unit.create({ data: { ...input, tenantId } })
    await createAuditLog({ tenantId, userId, entity: 'unit', entityId: unit.id, action: 'CREATE', newValue: { name: unit.name } })
    return unit
  },

  async update(id: string, tenantId: string, userId: string, input: Partial<UnitInput>) {
    await this.getById(id, tenantId)
    const updated = await prisma.unit.update({ where: { id }, data: input })
    await createAuditLog({ tenantId, userId, entity: 'unit', entityId: id, action: 'UPDATE' })
    return updated
  },

  async delete(id: string, tenantId: string, userId: string) {
    await this.getById(id, tenantId)
    await prisma.unit.delete({ where: { id } })
    await createAuditLog({ tenantId, userId, entity: 'unit', entityId: id, action: 'DELETE' })
  },
}
