// ──────────────────────────────────────────────────────
// POS AI - Supplier Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '../../../../generated/prisma/client'

export const supplierRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.supplier.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { _count: { select: { purchaseOrders: true } } },
    })
  },

  async findMany(
    tenantId: string,
    params: { page?: number; limit?: number; search?: string } = {},
  ) {
    const { page = 1, limit = 10, search } = params
    const where: Prisma.SupplierWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { purchaseOrders: true } } },
      }),
      prisma.supplier.count({ where }),
    ])

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async create(data: Prisma.SupplierCreateInput) {
    return prisma.supplier.create({ data })
  },

  async update(id: string, data: Prisma.SupplierUpdateInput) {
    return prisma.supplier.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },

  async count(tenantId: string) {
    return prisma.supplier.count({ where: { tenantId, deletedAt: null } })
  },
}
