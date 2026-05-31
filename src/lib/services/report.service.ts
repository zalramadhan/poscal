// ──────────────────────────────────────────────────────
// POS AI - Report Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'

export const reportService = {
  async salesReport(tenantId: string, params: {
    startDate?: string; endDate?: string; branchId?: string
  }) {
    const dateFilter: Record<string, unknown> = {}
    if (params.startDate) dateFilter.gte = new Date(params.startDate)
    if (params.endDate) dateFilter.lte = new Date(params.endDate)

    const where: Record<string, unknown> = {
      tenantId, status: 'COMPLETED',
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    }
    if (params.branchId) where.branchId = params.branchId

    const [sales, totalAgg] = await Promise.all([
      prisma.sale.findMany({
        where, orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          branch: { select: { name: true } },
          items: { include: { product: { select: { name: true, sku: true } } } },
        },
      }),
      prisma.sale.aggregate({ where, _sum: { total: true, subtotal: true, discount: true }, _count: { id: true } }),
    ])

    return {
      sales,
      summary: {
        totalSales: totalAgg._count.id,
        totalRevenue: totalAgg._sum.total?.toNumber() ?? 0,
        totalDiscount: totalAgg._sum.discount?.toNumber() ?? 0,
        averageOrderValue: totalAgg._count.id > 0
          ? (totalAgg._sum.total?.toNumber() ?? 0) / totalAgg._count.id
          : 0,
      },
    }
  },

  async inventoryReport(tenantId: string) {
    const [products, movements] = await Promise.all([
      prisma.product.findMany({
        where: { tenantId, deletedAt: null, isActive: true },
        include: {
          category: { select: { name: true } },
          unit: { select: { symbol: true } },
          balances: {
            include: { warehouse: { select: { name: true } } },
          },
        },
      }),
      prisma.inventoryMovement.groupBy({
        by: ['movementType'],
        where: { tenantId },
        _sum: { quantity: true },
        _count: { id: true },
      }),
    ])

    return {
      products: products.map(p => ({
        id: p.id, name: p.name, sku: p.sku,
        category: p.category?.name,
        unit: p.unit?.symbol,
        minStock: p.minStock?.toNumber(),
        totalStock: p.balances.reduce((s, b) => s + (b.quantity?.toNumber() ?? 0), 0),
        warehouseBalances: p.balances.map(b => ({
          warehouse: b.warehouse.name,
          quantity: b.quantity?.toNumber() ?? 0,
        })),
        isLowStock: p.minStock !== null && p.balances.reduce((s, b) => s + (b.quantity?.toNumber() ?? 0), 0) <= (p.minStock?.toNumber() ?? 0),
      })),
      movements: movements.map(m => ({
        type: m.movementType,
        totalQuantity: m._sum.quantity?.toNumber() ?? 0,
        count: m._count.id,
      })),
    }
  },

  async purchaseReport(tenantId: string, params: {
    startDate?: string; endDate?: string; status?: string
  }) {
    const where: Record<string, unknown> = { tenantId }
    if (params.status) where.status = params.status

    const dateFilter: Record<string, unknown> = {}
    if (params.startDate) dateFilter.gte = new Date(params.startDate)
    if (params.endDate) dateFilter.lte = new Date(params.endDate)
    if (Object.keys(dateFilter).length) where.createdAt = dateFilter

    const [orders, totals] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where, orderBy: { createdAt: 'desc' },
        include: { supplier: { select: { name: true } }, warehouse: { select: { name: true } } },
      }),
      prisma.purchaseOrder.aggregate({
        where: { ...where, status: 'RECEIVED' },
        _sum: { total: true },
        _count: { id: true },
      }),
    ])

    return { orders, summary: { totalOrders: totals._count.id, totalSpent: totals._sum.total?.toNumber() ?? 0 } }
  },
}
