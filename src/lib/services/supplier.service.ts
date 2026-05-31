// ──────────────────────────────────────────────────────
// POS AI - Supplier Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { SupplierInput } from '@/validators/supplier'
import { createAuditLog } from '@/lib/audit'
import { NotFoundError } from '@/lib/errors'

export const supplierService = {
  async list(tenantId: string, params: {
    page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = params
    const where: Record<string, unknown> = { tenantId, deletedAt: null }
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ]

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.supplier.count({ where }),
    ])
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getById(id: string, tenantId: string) {
    const supplier = await prisma.supplier.findFirst({ where: { id, tenantId, deletedAt: null } })
    if (!supplier) throw new NotFoundError('Supplier')
    return supplier
  },

  async create(tenantId: string, userId: string, input: SupplierInput) {
    const supplier = await prisma.supplier.create({ data: { ...input, tenantId } })
    await createAuditLog({ tenantId, userId, entity: 'supplier', entityId: supplier.id, action: 'CREATE', newValue: { name: supplier.name } })
    return supplier
  },

  async update(id: string, tenantId: string, userId: string, input: Partial<SupplierInput>) {
    await this.getById(id, tenantId)
    const updated = await prisma.supplier.update({ where: { id }, data: input })
    await createAuditLog({ tenantId, userId, entity: 'supplier', entityId: id, action: 'UPDATE' })
    return updated
  },

  async delete(id: string, tenantId: string, userId: string) {
    await this.getById(id, tenantId)
    await prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } })
    await createAuditLog({ tenantId, userId, entity: 'supplier', entityId: id, action: 'DELETE' })
  },
}
