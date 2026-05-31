import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { saleRepository } from '@/modules/pos/repositories/sale.repository'
import { saleService } from '@/lib/services/sale.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const sale = await saleRepository.findById(id, tenantId)
  return successResponse(sale)
})

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const sale = await saleService.refund(id, tenantId, userId)
  return successResponse(sale, 'Sale refunded')
})
