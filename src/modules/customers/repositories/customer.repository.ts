// ──────────────────────────────────────────────────────
// POS AI - Customer Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export const customerRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { _count: { select: { sales: true } } },
    })
  },

  async findMany(
    tenantId: string,
    params: { page?: number; limit?: number; search?: string; tier?: string } = {},
  ) {
    const { page = 1, limit = 10, search, tier } = params
    const where: Prisma.CustomerWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(tier && { tier }),
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { sales: true } } },
      }),
      prisma.customer.count({ where }),
    ])

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data })
  },

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },

  async count(tenantId: string) {
    return prisma.customer.count({ where: { tenantId, deletedAt: null } })
  },
}
