import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { opnameService } from '@/lib/services/opname.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const opname = await opnameService.getById(id, tenantId)
  return successResponse(opname)
})

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'submit') {
    const { items } = body as { items?: { productId: string; countedQty: number }[] }
    if (!items) return errorResponse('items is required', 400)
    const opname = await opnameService.submitCounts({ opnameId: id, tenantId, items, submittedBy: userId })
    return successResponse(opname, 'Counts submitted')
  }

  if (action === 'approve') {
    const opname = await opnameService.approve({ opnameId: id, tenantId, userId })
    return successResponse(opname, 'Opname approved and inventory adjusted')
  }

  if (action === 'reject') {
    const { reason } = body as { reason?: string }
    if (!reason) return errorResponse('reason is required', 400)
    const opname = await opnameService.reject({ opnameId: id, tenantId, userId, reason })
    return successResponse(opname, 'Opname rejected, please recount')
  }

  return errorResponse('Invalid action. Use ?action=submit|approve|reject', 400)
})