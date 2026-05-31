// ──────────────────────────────────────────────────────
// POS AI - Dashboard Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'

export const dashboardService = {
  async getSummary(tenantId: string, branchId?: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const whereBranch = branchId ? { branchId } : {}
    const whereSale = { tenantId, ...whereBranch, createdAt: { gte: today, lt: tomorrow } }

    const [salesToday, revenueToday, totalProducts, totalCustomers, lowStockProducts, recentSales] = await Promise.all([
      prisma.sale.count({ where: { ...whereSale, status: 'COMPLETED' } }),
      prisma.sale.aggregate({ where: { ...whereSale, status: 'COMPLETED' }, _sum: { total: true } }),
      prisma.product.count({ where: { tenantId, deletedAt: null, isActive: true } }),
      prisma.customer.count({ where: { tenantId, deletedAt: null } }),
      prisma.product.findMany({
        where: { tenantId, deletedAt: null, isActive: true, minStock: { not: null } },
        include: { balances: { select: { quantity: true } } },
      }),
      prisma.sale.findMany({
        where: { tenantId, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { id: true, name: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
    ])

    const lowStockCount = lowStockProducts.filter((p) => {
      const totalQty = p.balances.reduce((sum, b) => sum + (b.quantity?.toNumber() ?? 0), 0)
      return p.minStock && totalQty <= p.minStock.toNumber()
    }).length

    // Top products by sales
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { tenantId, status: 'COMPLETED' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const topProductsWithNames = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { id: true, name: true, sku: true } })
        return { id: item.productId, name: product?.name ?? 'Unknown', sku: product?.sku ?? '', totalSold: item._sum.quantity?.toNumber() ?? 0 }
      })
    )

    return {
      revenueToday: revenueToday._sum.total?.toNumber() ?? 0,
      salesToday,
      totalProducts,
      lowStockCount,
      totalCustomers,
      recentSales,
      topProducts: topProductsWithNames,
    }
  },
}
