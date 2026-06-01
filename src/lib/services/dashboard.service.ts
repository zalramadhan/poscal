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

    const whereBranch = branchId ? `AND "branchId" = '${branchId}'` : ''
    
    // Sales today and revenue using raw SQL
    const salesResult = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count, COALESCE(SUM("total"), 0) as revenue 
      FROM "public"."Sale" 
      WHERE "tenantId" = $1 ${whereBranch} 
        AND "status" = 'COMPLETED'
        AND "createdAt" >= $2 AND "createdAt" < $3
    `, tenantId, today, tomorrow)
    
    const salesToday = Number(salesResult[0]?.count) || 0
    const revenueToday = Number(salesResult[0]?.revenue) || 0

    // Total products using raw SQL
    const productsResult = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count FROM "public"."Product" 
      WHERE "tenantId" = $1 AND "deletedAt" IS NULL AND "isActive" = true
    `, tenantId)
    const totalProducts = Number(productsResult[0]?.count) || 0

    // Total customers using raw SQL
    const customersResult = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as count FROM "public"."Customer" 
      WHERE "tenantId" = $1 AND "deletedAt" IS NULL
    `, tenantId)
    const totalCustomers = Number(customersResult[0]?.count) || 0

    // Low stock products using raw SQL
    const lowStockProducts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT p.*, COALESCE(SUM(b.quantity), 0) as totalQty
      FROM "public"."Product" p
      LEFT JOIN "public"."InventoryBalance" b ON p.id = b."productId"
      WHERE p."tenantId" = $1 AND p."deletedAt" IS NULL AND p."isActive" = true AND p."minStock" IS NOT NULL
      GROUP BY p.id
      HAVING COALESCE(SUM(b.quantity), 0) <= p."minStock"
    `, tenantId)
    const lowStockCount = lowStockProducts.length

    // Recent sales using raw SQL
    const recentSales = await prisma.$queryRawUnsafe<any[]>(`
      SELECT s.*, c.name as "customerName"
      FROM "public"."Sale" s
      LEFT JOIN "public"."Customer" c ON s."customerId" = c.id
      WHERE s."tenantId" = $1 AND s.status = 'COMPLETED'
      ORDER BY s."createdAt" DESC
      LIMIT 5
    `, tenantId)

    // Top products - get all sale items and sum in JavaScript
    let topProducts: any[] = []
    try {
      // Get all sale items with their products for completed sales
      const saleItems = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          si."productId", 
          p.name, 
          p.sku,
          si.quantity
        FROM "public"."SaleItem" si
        INNER JOIN "public"."Sale" s ON si."saleId" = s.id
        INNER JOIN "public"."Product" p ON si."productId" = p.id
        WHERE s."tenantId" = $1 AND s.status = 'COMPLETED'
      `, tenantId)
      
      // Sum in JavaScript
      const productMap = new Map<string, { name: string, sku: string, totalSold: number }>()
      for (const item of saleItems) {
        const qty = Number(item.quantity) || 0
        const existing = productMap.get(item.productId)
        if (existing) {
          existing.totalSold += qty
        } else {
          productMap.set(item.productId, {
            name: item.name,
            sku: item.sku,
            totalSold: qty
          })
        }
      }
      
      topProducts = Array.from(productMap.entries()).map(([productId, data]) => ({
        id: productId,
        productId,
        name: data.name,
        sku: data.sku,
        totalSold: data.totalSold
      }))
      
      // Sort by totalSold descending and take top 5
      topProducts.sort((a, b) => b.totalSold - a.totalSold)
      topProducts = topProducts.slice(0, 5)
    } catch (err) {
      console.error('[Dashboard] Error getting top products:', err)
    }

    return {
      revenueToday,
      salesToday,
      totalProducts,
      lowStockCount,
      totalCustomers,
      recentSales,
      topProducts,
    }
  },
}
