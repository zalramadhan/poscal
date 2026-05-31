// ──────────────────────────────────────────────────────
// POS AI - Category Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '../../../../generated/prisma/client'

export const categoryRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.category.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { products: true } } },
    })
  },

  async findMany(tenantId: string, params: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 20, search } = params
    const where: Prisma.CategoryWhereInput = {
      tenantId,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    }

    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.count({ where }),
    ])

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data })
  },

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } })
  },

  async count(tenantId: string) {
    return prisma.category.count({ where: { tenantId } })
  },
}
