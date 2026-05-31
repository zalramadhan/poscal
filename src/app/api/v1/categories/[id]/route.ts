import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { categoryService } from '@/lib/services/category.service'
import { categorySchema } from '@/validators/category'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const category = await categoryService.getById(id, tenantId)
  return successResponse(category)
})

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(categorySchema.partial(), body)
  const category = await categoryService.update(id, tenantId, userId, input)
  return successResponse(category, 'Category updated')
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  await categoryService.delete(id, tenantId, userId)
  return successResponse(null, 'Category deleted')
})
