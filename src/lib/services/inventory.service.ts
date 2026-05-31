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
    console.log('[stockIn] Step 1: start')
    const previousStock = await this.getCurrentStock(params.warehouseId, params.productId)
    console.log('[stockIn] Step 2: previousStock =', previousStock)
    const newStock = previousStock + params.quantity
    console.log('[stockIn] Step 3: newStock =', newStock)

    console.log('[stockIn] Step 4: createMovement with:', {
      tenantId: params.tenantId,
      warehouseId: params.warehouseId,
      productId: params.productId,
      movementType: 'PURCHASE',
      quantity: params.quantity,
      previousStock,
      currentStock: newStock,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      notes: params.notes,
      createdBy: params.createdBy,
    })

    let movement
    try {
      movement = await inventoryRepository.createMovement({
        tenantId: params.tenantId,
        warehouseId: params.warehouseId,
        productId: params.productId,
        movementType: 'PURCHASE',
        quantity: params.quantity,
        previousStock,
        currentStock: newStock,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        notes: params.notes,
        createdBy: params.createdBy,
      })
    } catch (err: any) {
      console.error('[stockIn] createMovement FAILED:', err)
      console.error('[stockIn] error message:', err?.message)
      console.error('[stockIn] error code:', err?.code)
      console.error('[stockIn] error meta:', err?.meta)
      throw err
    }
    console.log('[stockIn] Step 5: movement created, id =', movement.id)

    try {
      await inventoryRepository.upsertBalance(
        params.tenantId,
        params.warehouseId,
        params.productId,
        newStock,
      )
    } catch (err: any) {
      console.error('[stockIn] upsertBalance FAILED:', err)
      throw err
    }
    console.log('[stockIn] Step 6: done')

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
