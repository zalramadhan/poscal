// ──────────────────────────────────────────────────────
// POS AI - Warehouse & Transfer Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { WarehouseInput, StockTransferInput } from '@/validators/warehouse'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'

function generateTransferNumber(): string {
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `ST-${Date.now().toString(36).toUpperCase()}-${random}`
}

export const warehouseService = {
  async list(tenantId: string) {
    return prisma.warehouse.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: { branch: { select: { id: true, name: true } } },
    })
  },

  async getById(id: string, tenantId: string) {
    const wh = await prisma.warehouse.findFirst({ where: { id, tenantId }, include: { branch: true } })
    if (!wh) throw new NotFoundError('Warehouse')
    return wh
  },

  async create(tenantId: string, userId: string, input: WarehouseInput) {
    const existing = await prisma.warehouse.findFirst({ where: { tenantId, code: input.code } })
    if (existing) throw new AppError('Warehouse code already exists', 409)

    const wh = await prisma.warehouse.create({ data: { ...input, tenantId }, include: { branch: true } })
    await createAuditLog({ tenantId, userId, entity: 'warehouse', entityId: wh.id, action: 'CREATE', newValue: { name: wh.name } })
    return wh
  },

  async update(id: string, tenantId: string, userId: string, input: Partial<WarehouseInput>) {
    await this.getById(id, tenantId)
    const updated = await prisma.warehouse.update({ where: { id }, data: input, include: { branch: true } })
    await createAuditLog({ tenantId, userId, entity: 'warehouse', entityId: id, action: 'UPDATE' })
    return updated
  },

  async delete(id: string, tenantId: string, userId: string) {
    await this.getById(id, tenantId)
    await prisma.warehouse.delete({ where: { id } })
    await createAuditLog({ tenantId, userId, entity: 'warehouse', entityId: id, action: 'DELETE' })
  },
}

export const transferService = {
  async list(tenantId: string, params: {
    page?: number; limit?: number; status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = params
    const where: Record<string, unknown> = { tenantId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          fromWarehouse: { select: { id: true, name: true } },
          toWarehouse: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.stockTransfer.count({ where }),
    ])
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async getById(id: string, tenantId: string) {
    const transfer = await prisma.stockTransfer.findFirst({
      where: { id, tenantId },
      include: {
        fromWarehouse: true, toWarehouse: true,
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    })
    if (!transfer) throw new NotFoundError('Stock Transfer')
    return transfer
  },

  async create(tenantId: string, userId: string, input: StockTransferInput) {
    if (input.fromWarehouseId === input.toWarehouseId) {
      throw new AppError('Source and destination warehouses must be different', 400)
    }

    const transferNumber = generateTransferNumber()

    const transfer = await prisma.stockTransfer.create({
      data: {
        tenantId, transferNumber,
        fromWarehouseId: input.fromWarehouseId,
        toWarehouseId: input.toWarehouseId,
        notes: input.notes,
        status: 'DRAFT',
        createdBy: userId,
        items: { create: input.items.map(i => ({ productId: i.productId, quantity: i.quantity })) },
      },
      include: { fromWarehouse: true, toWarehouse: true, items: { include: { product: { select: { name: true } } } } },
    })

    await createAuditLog({ tenantId, userId, entity: 'stock_transfer', entityId: transfer.id, action: 'CREATE', newValue: { transferNumber } })
    return transfer
  },

  async execute(id: string, tenantId: string, userId: string) {
    const transfer = await this.getById(id, tenantId)
    if (transfer.status !== 'DRAFT') throw new AppError('Only draft transfers can be executed', 400)

    await prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        // Deduct from source
        const sourceBalance = await tx.inventoryBalance.findUnique({
          where: { warehouseId_productId: { warehouseId: transfer.fromWarehouseId, productId: item.productId } },
        })
        const sourceQty = sourceBalance?.quantity?.toNumber() ?? 0
        if (sourceQty < item.quantity.toNumber()) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          throw new AppError(`Insufficient stock for ${product?.name} in source warehouse`, 400)
        }

        const newSourceQty = sourceQty - item.quantity.toNumber()
        await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId: transfer.fromWarehouseId, productId: item.productId } },
          update: { quantity: newSourceQty },
          create: { tenantId, warehouseId: transfer.fromWarehouseId, productId: item.productId, quantity: newSourceQty },
        })

        // Add to destination
        const destBalance = await tx.inventoryBalance.findUnique({
          where: { warehouseId_productId: { warehouseId: transfer.toWarehouseId, productId: item.productId } },
        })
        const destQty = destBalance?.quantity?.toNumber() ?? 0
        const newDestQty = destQty + item.quantity.toNumber()

        await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId: transfer.toWarehouseId, productId: item.productId } },
          update: { quantity: newDestQty },
          create: { tenantId, warehouseId: transfer.toWarehouseId, productId: item.productId, quantity: newDestQty },
        })

        // Record movements
        await tx.inventoryMovement.create({
          data: {
            tenantId, warehouseId: transfer.fromWarehouseId, productId: item.productId,
            movementType: 'TRANSFER_OUT', quantity: -item.quantity.toNumber(),
            previousStock: sourceQty, currentStock: newSourceQty,
            referenceType: 'STOCK_TRANSFER', referenceId: id, createdBy: userId,
          },
        })
        await tx.inventoryMovement.create({
          data: {
            tenantId, warehouseId: transfer.toWarehouseId, productId: item.productId,
            movementType: 'TRANSFER_IN', quantity: item.quantity.toNumber(),
            previousStock: destQty, currentStock: newDestQty,
            referenceType: 'STOCK_TRANSFER', referenceId: id, createdBy: userId,
          },
        })
      }

      await tx.stockTransfer.update({ where: { id }, data: { status: 'RECEIVED' } })
    })

    await createAuditLog({ tenantId, userId, entity: 'stock_transfer', entityId: id, action: 'EXECUTE' })
    return this.getById(id, tenantId)
  },
}
