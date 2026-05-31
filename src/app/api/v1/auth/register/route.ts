import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { parseBody, withErrorHandler } from '@/lib/api-handler'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await parseBody<{ name: string; email: string; password: string }>(request)

  return successResponse({
    user: { id: '1', name: body.name, email: body.email },
    token: `mock-token-${Date.now()}`,
  }, 'Registration successful')
})
