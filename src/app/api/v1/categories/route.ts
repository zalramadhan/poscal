import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { categoryService } from '@/lib/services/category.service'
import { categorySchema } from '@/validators/category'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const categories = await categoryService.list(tenantId)
  return successResponse(categories)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(categorySchema, body)
  const category = await categoryService.create(tenantId, userId, input)
  return successResponse(category, 'Category created', 201)
})
