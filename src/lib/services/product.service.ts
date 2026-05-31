// ──────────────────────────────────────────────────────
// POS AI - Product Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { ProductInput } from '@/validators/product'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'

export const productService = {
  async list(tenantId: string, params: {
    page?: number; limit?: number; search?: string; categoryId?: string
    brandId?: string; isActive?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, search, categoryId, brandId, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = params
    const where: Record<string, unknown> = { tenantId, deletedAt: null }

    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }]
    if (categoryId) where.categoryId = categoryId
    if (brandId) where.brandId = brandId
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { category: { select: { id: true, name: true } }, brand: { select: { id: true, name: true } }, unit: { select: { id: true, name: true, symbol: true } } },
      }),
      prisma.product.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getById(id: string, tenantId: string) {
    const product = await prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { category: true, brand: true, unit: true },
    })
    if (!product) throw new NotFoundError('Product')
    return product
  },

  async create(tenantId: string, userId: string, input: ProductInput) {
    const existing = await prisma.product.findFirst({ where: { tenantId, sku: input.sku } })
    if (existing) throw new AppError('Product with this SKU already exists', 409)

    const product = await prisma.product.create({
      data: { ...input, tenantId, costPrice: input.costPrice, sellingPrice: input.sellingPrice },
      include: { category: true, brand: true, unit: true },
    })

    await createAuditLog({ tenantId, userId, entity: 'product', entityId: product.id, action: 'CREATE', newValue: { name: product.name, sku: product.sku } })
    return product
  },

  async update(id: string, tenantId: string, userId: string, input: Partial<ProductInput>) {
    const product = await this.getById(id, tenantId)

    if (input.sku && input.sku !== product.sku) {
      const existing = await prisma.product.findFirst({ where: { tenantId, sku: input.sku, id: { not: id } } })
      if (existing) throw new AppError('Product with this SKU already exists', 409)
    }

    const updated = await prisma.product.update({ where: { id }, data: input, include: { category: true, brand: true, unit: true } })

    await createAuditLog({ tenantId, userId, entity: 'product', entityId: id, action: 'UPDATE', oldValue: { name: product.name }, newValue: { name: updated.name } })
    return updated
  },

  async delete(id: string, tenantId: string, userId: string) {
    const product = await this.getById(id, tenantId)
    await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } })
    await createAuditLog({ tenantId, userId, entity: 'product', entityId: id, action: 'DELETE', oldValue: { name: product.name } })
  },

  async getLowStock(tenantId: string) {
    return prisma.product.findMany({
      where: { tenantId, deletedAt: null, isActive: true, minStock: { not: null } },
      include: { category: { select: { name: true } }, unit: { select: { symbol: true } } },
    })
  },
}
