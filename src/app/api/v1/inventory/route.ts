import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { inventoryService } from '@/lib/services/inventory.service'
import { inventoryRepository } from '@/modules/inventory/repositories/inventory.repository'
import { stockInSchema, stockOutSchema, adjustmentSchema, inventoryQuerySchema } from '@/validators/inventory'
import { validateSchema } from '@/lib/api-handler'
import type { InventoryMovementType } from '../../../../../generated/prisma/client'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)

  const result = await inventoryRepository.getMovements(tenantId, {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    warehouseId: params.warehouseId,
    movementType: params.movementType as InventoryMovementType,
    startDate: params.startDate,
    endDate: params.endDate,
  })

  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'stock-in') {
    const input = validateSchema(stockInSchema, body)
    const movement = await inventoryService.stockIn({ ...input, tenantId, createdBy: userId })
    return successResponse(movement, 'Stock in recorded', 201)
  }

  if (action === 'stock-out') {
    const input = validateSchema(stockOutSchema, body)
    const movement = await inventoryService.stockOut({ ...input, tenantId, createdBy: userId })
    return successResponse(movement, 'Stock out recorded', 201)
  }

  if (action === 'adjust') {
    const input = validateSchema(adjustmentSchema, body)
    const movement = await inventoryService.adjust({ ...input, tenantId, createdBy: userId })
    return successResponse(movement, 'Adjustment recorded', 201)
  }

  return successResponse(null, 'Unknown action')
})
