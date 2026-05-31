// ──────────────────────────────────────────────────────
// POS AI - Brand Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '../../../../generated/prisma/client'

export const brandRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.brand.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { products: true } } },
    })
  },

  async findMany(tenantId: string, params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 20, search } = params
    const where: Prisma.BrandWhereInput = {
      tenantId,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    }

    const [data, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.count({ where }),
    ])

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async create(data: Prisma.BrandCreateInput) {
    return prisma.brand.create({ data })
  },

  async update(id: string, data: Prisma.BrandUpdateInput) {
    return prisma.brand.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.brand.delete({ where: { id } })
  },

  async count(tenantId: string) {
    return prisma.brand.count({ where: { tenantId } })
  },
}
