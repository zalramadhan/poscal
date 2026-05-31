import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { loginSchema, registerSchema } from '@/validators/auth'
import { parseBody, withErrorHandler } from '@/lib/api-handler'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await parseBody<{ email: string; password: string; name?: string }>(request)
  const { email, password } = body

  // For now, simple validation
  const user = { id: '1', name: 'Admin', email, tenantId: 'default', roleId: '1' }

  return successResponse({
    user,
    token: `mock-token-${Date.now()}`,
  }, 'Login successful')
})
