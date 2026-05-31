// ──────────────────────────────────────────────────────
// POS AI - Unit Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '../../../../generated/prisma/client'

export const unitRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.unit.findFirst({ where: { id, tenantId } })
  },

  async findMany(tenantId: string, params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 20, search } = params
    const where: Prisma.UnitWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { symbol: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.unit.count({ where }),
    ])

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async create(data: Prisma.UnitCreateInput) {
    return prisma.unit.create({ data })
  },

  async update(id: string, data: Prisma.UnitUpdateInput) {
    return prisma.unit.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.unit.delete({ where: { id } })
  },

  async count(tenantId: string) {
    return prisma.unit.count({ where: { tenantId } })
  },
}
