import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { withErrorHandler } from '@/lib/api-handler'
import { reservationService } from '@/lib/services/reservation.service'

export const GET = withErrorHandler(async (_request: NextRequest) => {
  const result = await reservationService.cleanupExpired()
  return successResponse(result, `Cleaned up ${result.released} expired reservations`)
})
