import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { transferService } from '@/lib/services/warehouse.service'
import { stockTransferSchema } from '@/validators/warehouse'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)
  const result = await transferService.list(tenantId, {
    page: Number(params.page) || 1, limit: Number(params.limit) || 10,
    status: params.status, sortBy: params.sortBy, sortOrder: params.sortOrder as 'asc' | 'desc' | undefined,
  })
  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(stockTransferSchema, body)
  const transfer = await transferService.create(tenantId, userId, input)
  return successResponse(transfer, 'Stock transfer created', 201)
})
