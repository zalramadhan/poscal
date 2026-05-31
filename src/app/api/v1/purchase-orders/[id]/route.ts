import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { purchaseService } from '@/lib/services/purchase.service'
import { receiveGoodsSchema } from '@/validators/purchase'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const po = await purchaseService.getById(id, tenantId)
  return successResponse(po)
})

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'submit') {
    const result = await purchaseService.submit(id, tenantId, userId)
    return successResponse(result, 'Purchase order submitted')
  }
  if (action === 'approve') {
    const result = await purchaseService.approve(id, tenantId, userId)
    return successResponse(result, 'Purchase order approved')
  }
  if (action === 'receive') {
    const input = validateSchema(receiveGoodsSchema, body)
    const result = await purchaseService.receive(id, tenantId, userId, input)
    return successResponse(result, 'Goods received')
  }

  return successResponse(null, 'Unknown action')
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  await purchaseService.delete(id, tenantId, userId)
  return successResponse(null, 'Purchase order deleted')
})
