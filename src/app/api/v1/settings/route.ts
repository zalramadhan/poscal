import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { settingsService } from '@/lib/services/settings.service'
import { tenantSettingsSchema, roleSchema, branchSchema, userUpdateSchema } from '@/validators/settings'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const section = searchParams.get('section') || 'tenant'

  if (section === 'branches') {
    const branches = await settingsService.listBranches(tenantId)
    return successResponse(branches)
  }
  if (section === 'roles') {
    const roles = await settingsService.listRoles(tenantId)
    return successResponse(roles)
  }
  if (section === 'users') {
    const users = await settingsService.listUsers(tenantId)
    return successResponse(users)
  }

  const tenant = await settingsService.getTenant(tenantId)
  return successResponse(tenant)
})

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const section = url.searchParams.get('section') || 'tenant'

  if (section === 'tenant') {
    const input = validateSchema(tenantSettingsSchema, body)
    const result = await settingsService.updateTenant(tenantId, input)
    return successResponse(result, 'Settings updated')
  }

  return successResponse(null, 'Unknown section')
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const section = url.searchParams.get('section') || ''

  if (section === 'branches') {
    const input = validateSchema(branchSchema, body)
    const branch = await settingsService.createBranch(tenantId, userId, input)
    return successResponse(branch, 'Branch created', 201)
  }
  if (section === 'roles') {
    const input = validateSchema(roleSchema, body)
    const role = await settingsService.createRole(tenantId, userId, input)
    return successResponse(role, 'Role created', 201)
  }

  return successResponse(null, 'Unknown section')
})
