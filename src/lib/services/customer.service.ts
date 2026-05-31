// ──────────────────────────────────────────────────────
// POS AI - Customer Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { CustomerInput } from '@/validators/customer'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'

export const customerService = {
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
      prisma.customer.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.customer.count({ where }),
    ])
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getById(id: string, tenantId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { _count: { select: { sales: true } } },
    })
    if (!customer) throw new NotFoundError('Customer')
    return customer
  },

  async create(tenantId: string, userId: string, input: CustomerInput) {
    const customer = await prisma.customer.create({ data: { ...input, tenantId } })
    await createAuditLog({ tenantId, userId, entity: 'customer', entityId: customer.id, action: 'CREATE', newValue: { name: customer.name } })
    return customer
  },

  async update(id: string, tenantId: string, userId: string, input: Partial<CustomerInput>) {
    await this.getById(id, tenantId)
    const updated = await prisma.customer.update({ where: { id }, data: input })
    await createAuditLog({ tenantId, userId, entity: 'customer', entityId: id, action: 'UPDATE' })
    return updated
  },

  async delete(id: string, tenantId: string, userId: string) {
    await this.getById(id, tenantId)
    await prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } })
    await createAuditLog({ tenantId, userId, entity: 'customer', entityId: id, action: 'DELETE' })
  },
}
