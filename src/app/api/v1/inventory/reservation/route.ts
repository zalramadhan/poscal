import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { reservationService } from '@/lib/services/reservation.service'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'reserve') {
    const { warehouseId, cartId, items } = body
    const result = await reservationService.reserve({ tenantId, warehouseId, cartId, userId, items })
    if (!result.allSucceeded) {
      return successResponse(result, 'Partial reservation failed - some items unavailable', 200)
    }
    return successResponse(result, 'Stock reserved successfully', 201)
  }

  if (action === 'release') {
    const { cartId } = body
    const result = await reservationService.release(cartId)
    return successResponse(result, 'Reservation released', 200)
  }

  if (action === 'confirm') {
    const { cartId, saleId } = body
    const result = await reservationService.confirm({ cartId, saleId, userId })
    return successResponse(result, 'Reservation confirmed and stock deducted', 200)
  }

  return errorResponse('Invalid action. Use ?action=reserve|release|confirm', 400)
})
