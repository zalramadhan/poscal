import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { shiftService } from '@/lib/services/shift.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)

  const report = await shiftService.getShiftReport(id, tenantId)
  return successResponse(report)
})