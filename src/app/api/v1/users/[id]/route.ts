import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { settingsService } from '@/lib/services/settings.service'
import { userUpdateSchema } from '@/validators/settings'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return errorResponse('User ID is required', 400)
  }

  const users = await settingsService.listUsers(tenantId)
  const user = users.find((u: any) => u.id === id)
  if (!user) return errorResponse('User not found', 404)
  return successResponse(user)
})

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return errorResponse('User ID is required', 400)
  }

  const body = await parseBody(request)
  const input = validateSchema(userUpdateSchema, body)

  const users = await settingsService.listUsers(tenantId)
  const existingUser = users.find((u: any) => u.id === id)
  if (!existingUser) return errorResponse('User not found', 404)

  const updated = await settingsService.updateUserStatus(id, tenantId, userId, input)
  return successResponse(updated, 'Employee updated')
})

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ success: false, error: 'User ID is required' }, { status: 400 })
  }

  await settingsService.deleteUser(id, tenantId, userId)
  return successResponse(null, 'User deleted')
})
