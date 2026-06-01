import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { saleService } from '@/lib/services/sale.service'
import { saleRepository } from '@/modules/pos/repositories/sale.repository'
import { saleSchema, saleQuerySchema } from '@/validators/sale'
import { validateSchema } from '@/lib/api-handler'
import type { SaleStatus } from '../../../../../generated/prisma/client'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)
  const query = validateSchema(saleQuerySchema, { ...params, page: params.page || '1', limit: params.limit || '10' })

  const result = await saleRepository.findMany(tenantId, {
    page: query.page, limit: query.limit,
    search: query.search, status: query.status as SaleStatus,
    startDate: query.startDate, endDate: query.endDate,
  })
  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  console.log('[Sales POST] body:', JSON.stringify(body))
  const input = validateSchema(saleSchema, body)
  console.log('[Sales POST] input:', JSON.stringify(input))

  const sale = await saleService.create({
    ...input,
    tenantId,
    branchId: input.branchId,
    createdBy: userId,
  })
  console.log('[Sales POST] sale created:', sale.id)
  return successResponse(sale, 'Sale completed', 201)
})
