import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { warehouseService } from '@/lib/services/warehouse.service'
import { warehouseSchema } from '@/validators/warehouse'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const warehouses = await warehouseService.list(tenantId)
  return successResponse(warehouses)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(warehouseSchema, body)
  const warehouse = await warehouseService.create(tenantId, userId, input)
  return successResponse(warehouse, 'Warehouse created', 201)
})
