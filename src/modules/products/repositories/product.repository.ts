// ──────────────────────────────────────────────────────
// POS AI - Product Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const productInclude = {
  category: { select: { id: true, name: true } },
  brand: { select: { id: true, name: true } },
  unit: { select: { id: true, name: true, symbol: true } },
} as const

export const productRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: productInclude,
    })
  },

  async findBySku(sku: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { sku, tenantId, deletedAt: null },
    })
  },

  async findMany(
    tenantId: string,
    params: {
      page?: number
      limit?: number
      search?: string
      categoryId?: string
      brandId?: string
      status?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {},
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      brandId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params

    const skip = (page - 1) * limit
    const where: Prisma.ProductWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: productInclude,
      }),
      prisma.product.count({ where }),
    ])

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data, include: productInclude })
  },

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    })
  },

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },

  async count(tenantId: string) {
    return prisma.product.count({
      where: { tenantId, deletedAt: null },
    })
  },

  async countLowStock(tenantId: string, threshold = 10) {
    return prisma.inventoryBalance.count({
      where: {
        tenantId,
        quantity: { lt: threshold },
      },
    })
  },
}
