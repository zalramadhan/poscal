import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { opnameService } from '@/lib/services/opname.service'
import { inventoryRepository } from '@/modules/inventory/repositories/inventory.repository'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const result = await inventoryRepository.getOpnames(tenantId, { page, limit })
  return successResponse(result)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const { warehouseId, notes } = body as { warehouseId?: string; notes?: string }
  if (!warehouseId) return errorResponse('warehouseId is required', 400)
  const opname = await opnameService.start({ tenantId, warehouseId, notes, createdBy: userId })
  return successResponse(opname, 'Stock opname started', 201)
})