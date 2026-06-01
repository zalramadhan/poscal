import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)

  const lowStock = await prisma.$queryRawUnsafe<any[]>(
    `SELECT 
      ib."productId",
      p.name as "productName",
      p.sku,
      p."minStock",
      p."maxStock",
      ib.quantity as "currentStock",
      ib."warehouseId",
      w.name as "warehouseName",
      (p."minStock" - ib.quantity) as "deficit"
     FROM "InventoryBalance" ib
     JOIN "Product" p ON p.id = ib."productId"
     JOIN "Warehouse" w ON w.id = ib."warehouseId"
     WHERE ib."tenantId" = $1 
       AND ib.quantity <= COALESCE(p."minStock", 0)
       AND p.deletedAt IS NULL
     ORDER BY "deficit" DESC`,
    tenantId
  )

  const critical = lowStock.filter((i) => i.currentStock.toNumber() === 0)
  const warning = lowStock.filter((i) => i.currentStock.toNumber() > 0)

  return successResponse({ critical, warning, all: lowStock }, 'Low stock items retrieved')
})