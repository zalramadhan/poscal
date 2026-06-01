import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/lib/errors'

export const opnameService = {
  async start(params: { tenantId: string; warehouseId: string; notes?: string; createdBy: string }) {
    const { tenantId, warehouseId, notes, createdBy } = params

    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, tenantId },
    })
    if (!warehouse) throw new NotFoundError('Warehouse')

    const balances = await prisma.inventoryBalance.findMany({
      where: { warehouseId, quantity: { not: { equals: 0 } } },
      include: { product: { select: { id: true, name: true, sku: true } } },
    })

    const opname = await prisma.stockOpname.create({
      data: {
        tenantId,
        warehouseId,
        status: 'DRAFT',
        notes,
        createdBy,
        items: {
          create: balances.map((b) => ({
            productId: b.productId,
            systemQty: b.quantity,
            actualQty: 0,
            differenceQty: 0,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        warehouse: true,
      },
    })

    return opname
  },

  async getById(opnameId: string, tenantId: string) {
    const opname = await prisma.stockOpname.findFirst({
      where: { id: opnameId, tenantId },
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        warehouse: true,
      },
    })
    if (!opname) throw new NotFoundError('Stock opname')
    return opname
  },

  async submitCounts(params: { opnameId: string; tenantId: string; items: Array<{ productId: string; countedQty: number }>; submittedBy: string }) {
    const { opnameId, tenantId, items, submittedBy } = params

    const opname = await this.getById(opnameId, tenantId)
    if (opname.status !== 'DRAFT') throw new Error('Can only submit counts for DRAFT opname')

    for (const item of items) {
      const stockOpnameItem = await prisma.stockOpnameItem.findFirst({
        where: { stockOpnameId: opnameId, productId: item.productId },
      })
      if (!stockOpnameItem) continue

      const systemQty = stockOpnameItem.systemQty.toNumber()
      await prisma.stockOpnameItem.update({
        where: { id: stockOpnameItem.id },
        data: {
          actualQty: item.countedQty,
          differenceQty: item.countedQty - systemQty,
        },
      })
    }

    const updated = await prisma.stockOpname.update({
      where: { id: opnameId },
      data: { status: 'SUBMITTED' },
      include: { items: { include: { product: true } } },
    })

    return updated
  },

  async approve(params: { opnameId: string; tenantId: string; userId: string }) {
    const { opnameId, tenantId, userId } = params

    const opname = await this.getById(opnameId, tenantId)
    if (opname.status !== 'SUBMITTED') throw new Error('Can only approve SUBMITTED opname')

    for (const item of opname.items) {
      const difference = item.differenceQty.toNumber()
      if (difference === 0) continue

      const balance = await prisma.inventoryBalance.findUnique({
        where: { warehouseId_productId: { warehouseId: opname.warehouseId, productId: item.productId } },
      })
      const previousStock = balance?.quantity.toNumber() ?? 0
      const newStock = previousStock + difference

      await prisma.$queryRawUnsafe<any>(
        `INSERT INTO "public"."InventoryMovement" 
          (id, "tenantId", "warehouseId", "productId", "movementType", "quantity", "previousStock", "currentStock", "referenceType", "referenceId", "createdBy", "createdAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        tenantId,
        opname.warehouseId,
        item.productId,
        'STOCK_OPNAME',
        difference,
        previousStock,
        newStock,
        'STOCK_OPNAME',
        opnameId,
        userId
      )

      await prisma.inventoryBalance.upsert({
        where: { warehouseId_productId: { warehouseId: opname.warehouseId, productId: item.productId } },
        update: { quantity: newStock },
        create: { tenantId, warehouseId: opname.warehouseId, productId: item.productId, quantity: newStock },
      })
    }

    const updated = await prisma.stockOpname.update({
      where: { id: opnameId },
      data: { status: 'APPROVED', approvedBy: userId },
    })

    return updated
  },

  async reject(params: { opnameId: string; tenantId: string; userId: string; reason: string }) {
    const { opnameId, tenantId, userId, reason } = params

    const opname = await this.getById(opnameId, tenantId)
    if (opname.status !== 'SUBMITTED') throw new Error('Can only reject SUBMITTED opname')

    await prisma.stockOpnameItem.updateMany({
      where: { stockOpnameId: opnameId },
      data: { actualQty: 0, differenceQty: 0 },
    })

    const updated = await prisma.stockOpname.update({
      where: { id: opnameId },
      data: { status: 'REJECTED' },
    })

    return updated
  },
}