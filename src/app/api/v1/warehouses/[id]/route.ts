import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler, validateSchema } from '@/lib/api-handler'
import { warehouseSchema } from '@/validators/warehouse'
import { warehouseService } from '@/lib/services/warehouse.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const warehouse = await warehouseService.getById(id, tenantId)
  return successResponse(warehouse)
})

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const input = validateSchema(warehouseSchema.partial(), body)
  const warehouse = await warehouseService.update(id, tenantId, userId, input)
  return successResponse(warehouse, 'Warehouse updated')
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  await warehouseService.delete(id, tenantId, userId)
  return successResponse(null, 'Warehouse deleted')
})
