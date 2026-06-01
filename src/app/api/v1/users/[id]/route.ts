import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { settingsService } from '@/lib/services/settings.service'

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
