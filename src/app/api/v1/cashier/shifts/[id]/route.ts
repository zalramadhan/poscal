import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { shiftService } from '@/lib/services/shift.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)

  const shift = await shiftService.getShiftById(id, tenantId)
  return successResponse(shift)
})

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'close') {
    const { closingCash, notes } = body
    const shift = await shiftService.closeShift({
      shiftId: id,
      tenantId,
      closingCash: Number(closingCash),
      notes,
    })
    const message = shift.status === 'PENDING_APPROVAL'
      ? 'Variance detected, manager approval required'
      : 'Shift closed successfully'
    return successResponse(shift, message)
  }

  if (action === 'approve') {
    const { managerId, notes } = body
    const shift = await shiftService.approveShift({
      shiftId: id,
      tenantId,
      managerId: managerId || userId,
      notes,
    })
    return successResponse(shift, 'Shift approved and closed')
  }

  return errorResponse('Invalid action. Use ?action=close|approve', 400)
})