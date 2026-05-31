// ──────────────────────────────────────────────────────
// POS AI - Brand Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { BrandInput } from '@/validators/brand'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'

export const brandService = {
  async list(tenantId: string) {
    return prisma.brand.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
  },

  async getById(id: string, tenantId: string) {
    const brand = await prisma.brand.findFirst({ where: { id, tenantId } })
    if (!brand) throw new NotFoundError('Brand')
    return brand
  },

  async create(tenantId: string, userId: string, input: BrandInput) {
    const existing = await prisma.brand.findFirst({ where: { tenantId, name: input.name } })
    if (existing) throw new AppError('Brand already exists', 409)
    const brand = await prisma.brand.create({ data: { ...input, tenantId } })
    await createAuditLog({ tenantId, userId, entity: 'brand', entityId: brand.id, action: 'CREATE', newValue: { name: brand.name } })
    return brand
  },

  async update(id: string, tenantId: string, userId: string, input: Partial<BrandInput>) {
    await this.getById(id, tenantId)
    const updated = await prisma.brand.update({ where: { id }, data: input })
    await createAuditLog({ tenantId, userId, entity: 'brand', entityId: id, action: 'UPDATE' })
    return updated
  },

  async delete(id: string, tenantId: string, userId: string) {
    await this.getById(id, tenantId)
    const productCount = await prisma.product.count({ where: { brandId: id, deletedAt: null } })
    if (productCount > 0) throw new AppError(`Cannot delete brand: ${productCount} products are using it`, 400)
    await prisma.brand.delete({ where: { id } })
    await createAuditLog({ tenantId, userId, entity: 'brand', entityId: id, action: 'DELETE' })
  },
}
