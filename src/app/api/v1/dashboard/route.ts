import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { dashboardService } from '@/lib/services/dashboard.service'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const branchId = searchParams.get('branchId') || undefined

  const summary = await dashboardService.getSummary(tenantId, branchId)
  return successResponse(summary)
})
