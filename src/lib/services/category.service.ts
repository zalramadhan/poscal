// ──────────────────────────────────────────────────────
// POS AI - Category Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { CategoryInput } from '@/validators/category'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'

export const categoryService = {
  async list(tenantId: string) {
    return prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
  },

  async getById(id: string, tenantId: string) {
    const category = await prisma.category.findFirst({ where: { id, tenantId } })
    if (!category) throw new NotFoundError('Category')
    return category
  },

  async create(tenantId: string, userId: string, input: CategoryInput) {
    const existing = await prisma.category.findFirst({ where: { tenantId, name: input.name } })
    if (existing) throw new AppError('Category already exists', 409)

    const category = await prisma.category.create({ data: { ...input, tenantId } })
    await createAuditLog({ tenantId, userId, entity: 'category', entityId: category.id, action: 'CREATE', newValue: { name: category.name } })
    return category
  },

  async update(id: string, tenantId: string, userId: string, input: Partial<CategoryInput>) {
    await this.getById(id, tenantId)
    const updated = await prisma.category.update({ where: { id }, data: input })
    await createAuditLog({ tenantId, userId, entity: 'category', entityId: id, action: 'UPDATE', newValue: { name: updated.name } })
    return updated
  },

  async delete(id: string, tenantId: string, userId: string) {
    await this.getById(id, tenantId)
    const productCount = await prisma.product.count({ where: { categoryId: id, deletedAt: null } })
    if (productCount > 0) throw new AppError(`Cannot delete category: ${productCount} products are using it`, 400)

    await prisma.category.delete({ where: { id } })
    await createAuditLog({ tenantId, userId, entity: 'category', entityId: id, action: 'DELETE' })
  },
}
