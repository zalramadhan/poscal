import { prisma } from '@/lib/prisma'
import { InsufficientStockError } from '@/lib/errors'

const RESERVATION_TIMEOUT_MINUTES = 15

export const reservationService = {
  async reserve(params: {
    tenantId: string
    warehouseId: string
    cartId: string
    userId?: string
    items: Array<{ productId: string; quantity: number }>
  }) {
    const { tenantId, warehouseId, cartId, userId, items } = params
    const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000)

    const results = []
    const errors = []

    for (const item of items) {
      const balance = await prisma.inventoryBalance.findUnique({
        where: { warehouseId_productId: { warehouseId, productId: item.productId } },
      })

      const currentQty = balance?.quantity.toNumber() ?? 0
      const reserved = balance?.reserved ?? 0
      const available = currentQty - reserved

      if (available < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        errors.push({
          productId: item.productId,
          productName: product?.name,
          requested: item.quantity,
          available,
        })
        continue
      }

      const reservation = await prisma.stockReservation.create({
        data: {
          tenantId,
          warehouseId,
          productId: item.productId,
          quantity: item.quantity,
          cartId,
          userId,
          expiresAt,
          status: 'ACTIVE',
        },
      })

      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId, productId: item.productId } },
        data: { reserved: { increment: item.quantity } },
      })

      results.push(reservation)
    }

    return {
      reservations: results,
      errors: errors.length > 0 ? errors : undefined,
      allSucceeded: errors.length === 0,
    }
  },

  async release(cartId: string) {
    const reservations = await prisma.stockReservation.findMany({
      where: { cartId, status: 'ACTIVE' },
    })

    for (const reservation of reservations) {
      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
        data: { reserved: { decrement: reservation.quantity } },
      })
    }

    await prisma.stockReservation.updateMany({
      where: { cartId, status: 'ACTIVE' },
      data: { status: 'RELEASED' },
    })

    return { released: reservations.length }
  },

  async confirm(params: { cartId: string; saleId: string; userId: string }) {
    const { cartId, saleId, userId } = params

    const reservations = await prisma.stockReservation.findMany({
      where: { cartId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    })

    if (reservations.length === 0) {
      throw new Error('No active reservations found for this cart')
    }

    const movements = []

    for (const reservation of reservations) {
      const balance = await prisma.inventoryBalance.findUnique({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
      })

      const previousStock = (balance?.quantity.toNumber() ?? 0) - (balance?.reserved ?? 0) + reservation.quantity
      const newStock = previousStock - reservation.quantity

      const movement = await prisma.$queryRawUnsafe<any>(
        `INSERT INTO "public"."InventoryMovement" 
          (id, "tenantId", "warehouseId", "productId", "movementType", "quantity", "previousStock", "currentStock", "referenceType", "referenceId", "createdBy", "createdAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
         RETURNING *`,
        reservation.tenantId,
        reservation.warehouseId,
        reservation.productId,
        'SALE',
        -reservation.quantity,
        previousStock,
        newStock,
        'SALE',
        saleId,
        userId
      )

      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
        data: {
          quantity: newStock,
          reserved: { decrement: reservation.quantity },
        },
      })

      await prisma.stockReservation.update({
        where: { id: reservation.id },
        data: { status: 'CONVERTED' },
      })

      movements.push(movement[0])
    }

    return { confirmed: reservations.length, movements }
  },

  async cleanupExpired() {
    const expired = await prisma.stockReservation.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: new Date() } },
    })

    let released = 0

    for (const reservation of expired) {
      await prisma.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId: reservation.warehouseId, productId: reservation.productId } },
        data: { reserved: { decrement: reservation.quantity } },
      })

      await prisma.stockReservation.update({
        where: { id: reservation.id },
        data: { status: 'RELEASED' },
      })

      released++
    }

    return { released }
  },
}