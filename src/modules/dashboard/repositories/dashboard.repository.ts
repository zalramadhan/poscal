// ──────────────────────────────────────────────────────
// POS AI - Dashboard Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'

export const dashboardRepository = {
  async getSummary(tenantId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      revenueToday,
      salesToday,
      totalProducts,
      lowStockCount,
      totalCustomers,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { tenantId, status: 'COMPLETED', createdAt: { gte: today, lt: tomorrow } },
        _sum: { total: true },
      }),
      prisma.sale.count({
        where: { tenantId, status: 'COMPLETED', createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.product.count({ where: { tenantId, deletedAt: null, isActive: true } }),
      prisma.inventoryBalance.count({
        where: { tenantId, quantity: { lt: 10 } },
      }),
      prisma.customer.count({ where: { tenantId, deletedAt: null } }),
    ])

    const recentSales = await prisma.sale.findMany({
      where: { tenantId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { id: true, name: true } },
        items: { take: 3, include: { product: { select: { id: true, name: true } } } },
      },
    })

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { tenantId, status: 'COMPLETED' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    // Get product names
    const productIds = topProducts.map((p) => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      select: { id: true, name: true },
    })
    const productMap = new Map(products.map((p) => [p.id, p.name]))

    return {
      revenueToday: revenueToday._sum.total?.toNumber() ?? 0,
      salesToday,
      totalProducts,
      lowStockCount,
      totalCustomers,
      recentSales,
      topProducts: topProducts.map((p) => ({
        id: p.productId,
        name: productMap.get(p.productId) ?? 'Unknown',
        totalSold: p._sum.quantity?.toNumber() ?? 0,
      })),
    }
  },
}
