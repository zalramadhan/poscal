// ──────────────────────────────────────────────────────
// POS AI - Sale Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import { saleRepository } from '@/modules/pos/repositories/sale.repository'
import { inventoryService } from './inventory.service'
import { createAuditLog } from '@/lib/audit'
import { AppError } from '@/lib/errors'

function generateInvoiceNumber(): string {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')
  return `INV-${yy}${mm}${dd}-${random}`
}

export const saleService = {
  async create(params: {
    tenantId: string
    branchId: string
    customerId?: string
    items: { productId: string; quantity: number; price: number }[]
    payments: { paymentMethodId: string; amount: number }[]
    discount?: number
    notes?: string
    createdBy: string
  }) {
    const invoiceNumber = generateInvoiceNumber()
    const subtotal = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = params.discount ?? 0
    const total = subtotal - discountAmount

    // Validate warehouse (use first available for the branch)
    const warehouse = await prisma.warehouse.findFirst({
      where: { branchId: params.branchId, tenantId: params.tenantId, isActive: true },
    })
    if (!warehouse) throw new AppError('No warehouse found for this branch')

    // Check stock for each item
    for (const item of params.items) {
      const stock = await inventoryService.getCurrentStock(warehouse.id, item.productId)
      if (stock < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        throw new AppError(`Insufficient stock for ${product?.name ?? 'product'}`)
      }
    }

    const sale = await prisma.$transaction(async (tx) => {
      // Create sale with items
      const newSale = await tx.sale.create({
        data: {
          tenantId: params.tenantId,
          branchId: params.branchId,
          customerId: params.customerId,
          invoiceNumber,
          subtotal,
          discount: discountAmount,
          tax: 0,
          total,
          notes: params.notes,
          status: 'DRAFT',
          createdBy: params.createdBy,
          items: {
            create: params.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              discount: 0,
              subtotal: item.price * item.quantity,
            })),
          },
          payments: {
            create: params.payments.map((p) => ({
              paymentMethodId: p.paymentMethodId,
              amount: p.amount,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, sku: true } } } },
          payments: { include: { paymentMethod: { select: { id: true, name: true } } } },
          customer: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      })

      // Deduct stock
      for (const item of params.items) {
        const balance = await tx.inventoryBalance.findUnique({
          where: { warehouseId_productId: { warehouseId: warehouse.id, productId: item.productId } },
        })
        const previousStock = balance?.quantity?.toNumber() ?? 0
        const newStock = previousStock - item.quantity

        await tx.inventoryMovement.create({
          data: {
            tenantId: params.tenantId,
            warehouseId: warehouse.id,
            productId: item.productId,
            movementType: 'SALE',
            quantity: -item.quantity,
            previousStock,
            currentStock: newStock,
            referenceType: 'SALE',
            referenceId: newSale.id,
            createdBy: params.createdBy,
          },
        })

        await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId: warehouse.id, productId: item.productId } },
          update: { quantity: newStock },
          create: { tenantId: params.tenantId, warehouseId: warehouse.id, productId: item.productId, quantity: newStock },
        })
      }

      return newSale
    })

    // Mark as completed using raw SQL to avoid enum type issue
    await prisma.$executeRaw`UPDATE "public"."Sale" SET status = 'COMPLETED' WHERE id = ${sale.id}`

    await createAuditLog({
      tenantId: params.tenantId,
      userId: params.createdBy,
      entity: 'sale',
      entityId: sale.id,
      action: 'SALE_CREATED',
      newValue: { invoiceNumber, total, itemsCount: params.items.length },
    })

    return sale
  },

  async refund(saleId: string, tenantId: string, userId: string) {
    const sale = await saleRepository.findById(saleId, tenantId)
    if (!sale) throw new AppError('Sale not found', 404)
    if (sale.status !== 'COMPLETED') throw new AppError('Only completed sales can be refunded')

    const warehouse = await prisma.warehouse.findFirst({
      where: { branchId: sale.branchId, tenantId, isActive: true },
    })

    await prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        const balance = await tx.inventoryBalance.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: warehouse!.id,
              productId: item.productId,
            },
          },
        })
        const previousStock = balance?.quantity?.toNumber() ?? 0
        const newStock = previousStock + item.quantity.toNumber()

        await tx.inventoryMovement.create({
          data: {
            tenantId,
            warehouseId: warehouse!.id,
            productId: item.productId,
            movementType: 'RETURN',
            quantity: item.quantity,
            previousStock,
            currentStock: newStock,
            referenceType: 'SALE',
            referenceId: saleId,
            createdBy: userId,
          },
        })

        await tx.inventoryBalance.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: warehouse!.id,
              productId: item.productId,
            },
          },
          update: { quantity: newStock },
          create: {
            tenantId,
            warehouseId: warehouse!.id,
            productId: item.productId,
            quantity: newStock,
          },
        })
      }
    })

    await saleRepository.updateStatus(saleId, 'REFUNDED')

    await createAuditLog({
      tenantId,
      userId,
      entity: 'sale',
      entityId: saleId,
      action: 'SALE_REFUNDED',
      newValue: { invoiceNumber: sale.invoiceNumber },
    })

    return sale
  },
}
