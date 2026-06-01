import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { shiftService } from '@/lib/services/shift.service'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id')
  const params = await parseSearchParams(request)

  const url = new URL(request.url)
  const current = url.searchParams.get('current')

  if (current && userId) {
    const shift = await shiftService.getCurrentShift(tenantId, userId)
    return successResponse(shift)
  }

  const result = await shiftService.listShifts({
    tenantId,
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    status: params.status as any,
    userId: params.userId as string,
    branchId: params.branchId as string,
    startDate: params.startDate as string,
    endDate: params.endDate as string,
  })

  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const { branchId, openingCash } = body as { branchId?: string; openingCash?: number }

  if (!branchId || openingCash === undefined) {
    return errorResponse('branchId and openingCash are required', 400)
  }

  const shift = await shiftService.startShift({
    tenantId,
    userId,
    branchId,
    openingCash: Number(openingCash),
  })

  return successResponse(shift, 'Shift started successfully', 201)
})