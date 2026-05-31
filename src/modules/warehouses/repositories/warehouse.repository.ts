// ──────────────────────────────────────────────────────
// POS AI - Warehouse Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '../../../../generated/prisma/client'

export const warehouseRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.warehouse.findFirst({
      where: { id, tenantId },
      include: {
        branch: { select: { id: true, name: true } },
        _count: { select: { balances: true } },
      },
    })
  },

  async findMany(tenantId: string, params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 20, search } = params
    const where: Prisma.WarehouseWhereInput = {
      tenantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { branch: { select: { id: true, name: true } } },
      }),
      prisma.warehouse.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async create(data: Prisma.WarehouseCreateInput) {
    return prisma.warehouse.create({ data })
  },

  async update(id: string, data: Prisma.WarehouseUpdateInput) {
    return prisma.warehouse.update({ where: { id }, data })
  },

  async findAll(tenantId: string) {
    return prisma.warehouse.findMany({
      where: { tenantId, isActive: true },
      include: { branch: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    })
  },
}
