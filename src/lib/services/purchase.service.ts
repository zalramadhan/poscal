// ──────────────────────────────────────────────────────
// POS AI - Purchase Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { PurchaseOrderInput, ReceiveGoodsInput } from '@/validators/purchase'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'

function generatePONumber(): string {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `PO-${yy}${mm}${dd}-${random}`
}

export const purchaseService = {
  async list(tenantId: string, params: {
    page?: number; limit?: number; search?: string; status?: string
    supplierId?: string; startDate?: string; endDate?: string
    sortBy?: string; sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, search, status, supplierId, sortBy = 'createdAt', sortOrder = 'desc' } = params
    const where: Record<string, unknown> = { tenantId }
    if (status) where.status = status
    if (supplierId) where.supplierId = supplierId

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          supplier: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ])
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getById(id: string, tenantId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true, warehouse: true,
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    })
    if (!po) throw new NotFoundError('Purchase Order')
    return po
  },

  async create(tenantId: string, userId: string, input: PurchaseOrderInput) {
    const poNumber = generatePONumber()
    const itemsTotal = input.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)

    const po = await prisma.purchaseOrder.create({
      data: {
        tenantId, poNumber,
        supplierId: input.supplierId,
        warehouseId: input.warehouseId,
        expectedDate: input.expectedDate ? new Date(input.expectedDate) : null,
        notes: input.notes,
        subtotal: itemsTotal,
        total: itemsTotal,
        status: 'DRAFT',
        createdBy: userId,
        items: { create: input.items.map(i => ({ productId: i.productId, quantity: i.quantity, costPrice: i.costPrice, subtotal: i.quantity * i.costPrice })) },
      },
      include: { supplier: true, warehouse: true, items: { include: { product: { select: { name: true } } } } },
    })

    await createAuditLog({ tenantId, userId, entity: 'purchase_order', entityId: po.id, action: 'CREATE', newValue: { poNumber, total: itemsTotal } })
    return po
  },

  async submit(id: string, tenantId: string, userId: string) {
    const po = await this.getById(id, tenantId)
    if (po.status !== 'DRAFT') throw new AppError('Only draft POs can be ordered', 400)

    const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status: 'ORDERED' } })
    await createAuditLog({ tenantId, userId, entity: 'purchase_order', entityId: id, action: 'SUBMIT' })
    return updated
  },

  async approve(id: string, tenantId: string, userId: string) {
    const po = await this.getById(id, tenantId)
    if (po.status !== 'ORDERED') throw new AppError('Only ordered POs can be approved', 400)

    const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status: 'APPROVED' } })
    await createAuditLog({ tenantId, userId, entity: 'purchase_order', entityId: id, action: 'APPROVE' })
    return updated
  },

  async receive(id: string, tenantId: string, userId: string, input: ReceiveGoodsInput) {
    const po = await this.getById(id, tenantId)
    if (po.status !== 'APPROVED') throw new AppError('Only approved POs can be received', 400)

    await prisma.$transaction(async (tx) => {
      for (const item of input.items) {
        const poItem = po.items.find(i => i.productId === item.productId)
        if (!poItem) throw new AppError(`Product ${item.productId} not in PO`, 400)

        const balance = await tx.inventoryBalance.findUnique({
          where: { warehouseId_productId: { warehouseId: po.warehouseId, productId: item.productId } },
        })
        const previousStock = balance?.quantity?.toNumber() ?? 0
        const newStock = previousStock + item.quantityReceived

        await tx.inventoryMovement.create({
          data: {
            tenantId, warehouseId: po.warehouseId, productId: item.productId,
            movementType: 'PURCHASE', quantity: item.quantityReceived,
            previousStock, currentStock: newStock,
            referenceType: 'PURCHASE_ORDER', referenceId: id,
            createdBy: userId,
          },
        })

        await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId: po.warehouseId, productId: item.productId } },
          update: { quantity: newStock },
          create: { tenantId, warehouseId: po.warehouseId, productId: item.productId, quantity: newStock },
        })
      }

      await tx.purchaseOrder.update({ where: { id }, data: { status: 'RECEIVED' } })
    })

    await createAuditLog({ tenantId, userId, entity: 'purchase_order', entityId: id, action: 'RECEIVE' })
    return this.getById(id, tenantId)
  },

  async delete(id: string, tenantId: string, userId: string) {
    const po = await this.getById(id, tenantId)
    if (po.status !== 'DRAFT') throw new AppError('Only draft POs can be deleted', 400)
    await prisma.purchaseOrder.delete({ where: { id } })
    await createAuditLog({ tenantId, userId, entity: 'purchase_order', entityId: id, action: 'DELETE' })
  },
}
