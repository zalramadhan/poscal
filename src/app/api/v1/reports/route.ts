import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { reportService } from '@/lib/services/report.service'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const branchId = searchParams.get('branchId') || undefined
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined

  const [sales, inventory, purchases] = await Promise.all([
    reportService.salesReport(tenantId, { startDate, endDate, branchId }),
    reportService.inventoryReport(tenantId),
    reportService.purchaseReport(tenantId, { startDate, endDate }),
  ])

  return successResponse({ sales, inventory, purchases })
})
