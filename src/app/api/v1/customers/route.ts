import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { customerService } from '@/lib/services/customer.service'
import { customerSchema } from '@/validators/customer'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)
  const result = await customerService.list(tenantId, {
    page: Number(params.page) || 1, limit: Number(params.limit) || 10,
    search: params.search, sortBy: params.sortBy, sortOrder: params.sortOrder as 'asc' | 'desc' | undefined,
  })
  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(customerSchema, body)
  const customer = await customerService.create(tenantId, userId, input)
  return successResponse(customer, 'Customer created', 201)
})
