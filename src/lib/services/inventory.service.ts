// ──────────────────────────────────────────────────────
// POS AI - Inventory Service
// Source of Truth: inventory_movements
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import { inventoryRepository } from '@/modules/inventory/repositories/inventory.repository'
import { createAuditLog } from '@/lib/audit'
import { InsufficientStockError } from '@/lib/errors'

export const inventoryService = {
  async recalculateBalance(tenantId: string, warehouseId: string, productId: string) {
    const result = await prisma.inventoryMovement.aggregate({
      where: { tenantId, warehouseId, productId },
      _sum: { quantity: true },
    })

    const quantity = result._sum.quantity?.toNumber() ?? 0
    await inventoryRepository.upsertBalance(tenantId, warehouseId, productId, quantity)
    return quantity
  },

  async stockIn(params: {
    tenantId: string
    warehouseId: string
    productId: string
    quantity: number
    notes?: string
    referenceType?: string
    referenceId?: string
    createdBy: string
  }) {
    const previousStock = await this.getCurrentStock(params.warehouseId, params.productId)
    const newStock = previousStock + params.quantity

    const result = await prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO "public"."InventoryMovement" 
        ("tenantId", "warehouseId", "productId", "movementType", "quantity", "previousStock", "currentStock", "referenceType", "referenceId", "notes", "createdBy", "createdAt") 
       VALUES ($1, $2, $3, $4::inventory_movement_type, $5, $6, $7, $8, $9, $10, $11, NOW()) 
       RETURNING *`,
      params.tenantId,
      params.warehouseId,
      params.productId,
      'PURCHASE',
      params.quantity,
      previousStock,
      newStock,
      params.referenceType || null,
      params.referenceId || null,
      params.notes || null,
      params.createdBy
    )

    const movement = result[0]

    await prisma.inventoryBalance.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: params.warehouseId,
          productId: params.productId,
        },
      },
      update: { quantity: newStock },
      create: {
        tenantId: params.tenantId,
        warehouseId: params.warehouseId,
        productId: params.productId,
        quantity: newStock,
      },
    })

    await createAuditLog({
      tenantId: params.tenantId,
      userId: params.createdBy,
      entity: 'inventory',
      entityId: movement.id,
      action: 'STOCK_IN',
      newValue: { quantity: params.quantity, previousStock, newStock },
    })

    return movement
  },

  async stockOut(params: {
    tenantId: string
    warehouseId: string
    productId: string
    quantity: number
    notes?: string
    referenceType?: string
    referenceId?: string
    createdBy: string
  }) {
    const previousStock = await this.getCurrentStock(params.warehouseId, params.productId)

    if (previousStock < params.quantity) {
      const product = await prisma.product.findUnique({ where: { id: params.productId } })
      throw new InsufficientStockError(product?.name ?? 'Product')
    }

    const newStock = previousStock - params.quantity

    const movement = await inventoryRepository.createMovement({
      tenantId: params.tenantId,
      warehouseId: params.warehouseId,
      productId: params.productId,
      movementType: 'SALE',
      quantity: -params.quantity,
      previousStock,
      currentStock: newStock,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      notes: params.notes,
      createdBy: params.createdBy,
    })

    await inventoryRepository.upsertBalance(
      params.tenantId,
      params.warehouseId,
      params.productId,
      newStock,
    )

    await createAuditLog({
      tenantId: params.tenantId,
      userId: params.createdBy,
      entity: 'inventory',
      entityId: movement.id,
      action: 'STOCK_OUT',
      newValue: { quantity: -params.quantity, previousStock, newStock },
    })

    return movement
  },

  async adjust(params: {
    tenantId: string
    warehouseId: string
    productId: string
    newQuantity: number
    notes?: string
    createdBy: string
  }) {
    const previousStock = await this.getCurrentStock(params.warehouseId, params.productId)
    const difference = params.newQuantity - previousStock

    const movement = await inventoryRepository.createMovement({
      tenantId: params.tenantId,
      warehouseId: params.warehouseId,
      productId: params.productId,
      movementType: 'ADJUSTMENT',
      quantity: difference,
      previousStock,
      currentStock: params.newQuantity,
      notes: params.notes,
      createdBy: params.createdBy,
    })

    await inventoryRepository.upsertBalance(
      params.tenantId,
      params.warehouseId,
      params.productId,
      params.newQuantity,
    )

    await createAuditLog({
      tenantId: params.tenantId,
      userId: params.createdBy,
      entity: 'inventory',
      entityId: movement.id,
      action: 'ADJUSTMENT',
      newValue: { previousStock, newStock: params.newQuantity, difference },
    })

    return movement
  },

  async getCurrentStock(warehouseId: string, productId: string) {
    const balance = await inventoryRepository.getBalance(warehouseId, productId)
    return balance?.quantity?.toNumber() ?? 0
  },
}