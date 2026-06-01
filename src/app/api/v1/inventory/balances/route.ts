import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { inventoryRepository } from '@/modules/inventory/repositories/inventory.repository'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)

  const balances = await inventoryRepository.getBalances(tenantId, {
    warehouseId: searchParams.get('warehouseId') || undefined,
    lowStock: searchParams.get('lowStock') === 'true',
    lowStockThreshold: Number(searchParams.get('threshold')) || undefined,
  })

  return successResponse(balances)
})

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return errorResponse('Balance ID is required', 400)

  const balance = await inventoryRepository.getBalances(tenantId, {})
  const found = balance.find((b: any) => b.id === id)
  if (!found) return errorResponse('Balance not found', 404)

  await inventoryRepository.deleteBalance(id)
  return successResponse(null, 'Stock deleted')
})
