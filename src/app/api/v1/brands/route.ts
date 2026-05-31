import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { brandService } from '@/lib/services/brand.service'
import { brandSchema } from '@/validators/brand'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const brands = await brandService.list(tenantId)
  return successResponse(brands)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(brandSchema, body)
  const brand = await brandService.create(tenantId, userId, input)
  return successResponse(brand, 'Brand created', 201)
})
