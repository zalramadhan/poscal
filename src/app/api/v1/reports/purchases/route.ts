import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { reportService } from '@/lib/services/report.service'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const status = searchParams.get('status') || undefined

  const report = await reportService.purchaseReport(tenantId, { startDate, endDate, status })
  return successResponse(report)
})
