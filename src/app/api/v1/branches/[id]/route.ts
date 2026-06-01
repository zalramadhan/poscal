import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { settingsService } from '@/lib/services/settings.service'
import { branchUpdateSchema } from '@/validators/settings'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return errorResponse('Branch ID is required', 400)
  }

  const branches = await settingsService.listBranches(tenantId)
  const branch = branches.find((b: any) => b.id === id)
  if (!branch) return errorResponse('Branch not found', 404)
  return successResponse(branch)
})

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return errorResponse('Branch ID is required', 400)
  }

  const body = await parseBody(request)
  const input = validateSchema(branchUpdateSchema, body)

  const branches = await settingsService.listBranches(tenantId)
  const existing = branches.find((b: any) => b.id === id)
  if (!existing) return errorResponse('Branch not found', 404)

  const updated = await settingsService.updateBranch(id, tenantId, userId, input)
  return successResponse(updated, 'Branch updated')
})

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ success: false, error: 'Branch ID is required' }, { status: 400 })
  }

  await settingsService.deleteBranch(id, tenantId, userId)
  return successResponse(null, 'Branch deleted')
})
