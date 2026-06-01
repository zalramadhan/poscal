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

    // Top products - use raw SQL to avoid enum issues with Prisma groupBy
    let topProducts: any[] = []
    try {
      const topProductsRaw = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          si."productId", 
          p.name, 
          p.sku,
          SUM(si.quantity::numeric)::integer as totalSold
        FROM "public"."SaleItem" si
        INNER JOIN "public"."Sale" s ON si."saleId" = s.id
        INNER JOIN "public"."Product" p ON si."productId" = p.id
        WHERE s."tenantId" = $1 AND s.status = 'COMPLETED'
        GROUP BY si."productId", p.name, p.sku
        ORDER BY totalSold DESC
        LIMIT 5
      `, tenantId)
      
      topProducts = topProductsRaw.map((p: any) => ({
        id: p.productId,
        productId: p.productId,
        name: p.name,
        sku: p.sku,
        totalSold: Number(p.totalSold) || 0
      }))
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
