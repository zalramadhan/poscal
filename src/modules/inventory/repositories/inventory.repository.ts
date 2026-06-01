// ──────────────────────────────────────────────────────
// POS AI - Inventory Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma, InventoryMovementType, StockOpnameStatus } from '@prisma/client'

export const inventoryRepository = {
  // ── Balance ──
  async getBalance(warehouseId: string, productId: string) {
    return prisma.inventoryBalance.findUnique({
      where: { warehouseId_productId: { warehouseId, productId } },
    })
  },

  async getBalances(
    tenantId: string,
    params: { warehouseId?: string; lowStock?: boolean; lowStockThreshold?: number } = {},
  ) {
    const where: Prisma.InventoryBalanceWhereInput = {
      tenantId,
      ...(params.warehouseId && { warehouseId: params.warehouseId }),
      ...(params.lowStock && {
        quantity: { lt: params.lowStockThreshold ?? 10 },
      }),
    }

    return prisma.inventoryBalance.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, sellingPrice: true } },
        warehouse: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  },

  async upsertBalance(tenantId: string, warehouseId: string, productId: string, quantity: number) {
    return prisma.inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      update: { quantity },
      create: { tenantId, warehouseId, productId, quantity },
    })
  },

  // ── Movements ──
  async getMovements(
    tenantId: string,
    params: {
      page?: number
      limit?: number
      warehouseId?: string
      productId?: string
      movementType?: InventoryMovementType
      startDate?: string
      endDate?: string
    } = {},
  ) {
    const { page = 1, limit = 20, warehouseId, productId, movementType, startDate, endDate } = params
    const where: Prisma.InventoryMovementWhereInput = {
      tenantId,
      ...(warehouseId && { warehouseId }),
      ...(productId && { productId }),
      ...(movementType && { movementType }),
      ...(startDate &&
        endDate && {
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        }),
    }

    const [data, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          warehouse: { select: { id: true, name: true } },
        },
      }),
      prisma.inventoryMovement.count({ where }),
    ])

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async createMovement(data: Prisma.InventoryMovementUncheckedCreateInput) {
    return prisma.inventoryMovement.create({ data })
  },

  // ── Stock Opname ──
  async getOpnames(tenantId: string, params: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 10 } = params
    const where = { tenantId }

    const [data, total] = await Promise.all([
      prisma.stockOpname.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          warehouse: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      }),
      prisma.stockOpname.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async createOpname(data: Prisma.StockOpnameCreateInput) {
    return prisma.stockOpname.create({
      data,
      include: {
        warehouse: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    })
  },

  async updateOpnameStatus(id: string, status: StockOpnameStatus, approvedBy?: string) {
    return prisma.stockOpname.update({
      where: { id },
      data: {
        status,
        ...(approvedBy && { approvedBy }),
      },
    })
  },

  async getProductsWithStock(tenantId: string, warehouseId: string) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        sellingPrice: true,
        image: true,
        minStock: true,
        maxStock: true,
      },
    })

    const balances = await prisma.inventoryBalance.findMany({
      where: { warehouseId },
      select: { productId: true, quantity: true, reserved: true },
    })

    const balanceMap = new Map(balances.map((b) => [b.productId, b]))

    return products.map((p) => {
      const balance = balanceMap.get(p.id)
      const qty = balance?.quantity?.toNumber() ?? 0
      const reserved = balance?.reserved ?? 0
      const available = qty - reserved
      return {
        ...p,
        stock: { balance: qty, reserved, available },
      }
    })
  },
}
