import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { purchaseService } from '@/lib/services/purchase.service'
import { purchaseOrderSchema, purchaseOrderQuerySchema, receiveGoodsSchema } from '@/validators/purchase'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)
  const result = await purchaseService.list(tenantId, {
    page: Number(params.page) || 1, limit: Number(params.limit) || 10,
    search: params.search, status: params.status, supplierId: params.supplierId,
    startDate: params.startDate, endDate: params.endDate,
    sortBy: params.sortBy, sortOrder: params.sortOrder as 'asc' | 'desc' | undefined,
  })
  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(purchaseOrderSchema, body)
  const po = await purchaseService.create(tenantId, userId, input)
  return successResponse(po, 'Purchase order created', 201)
})
