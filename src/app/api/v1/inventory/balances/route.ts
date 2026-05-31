import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
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
