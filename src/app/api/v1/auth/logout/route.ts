import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { withErrorHandler } from '@/lib/api-handler'

export const POST = withErrorHandler(async () => {
  return successResponse(null, 'Logged out successfully')
})

export const GET = withErrorHandler(async () => {
  return successResponse({ authenticated: false }, 'Session check')
})
