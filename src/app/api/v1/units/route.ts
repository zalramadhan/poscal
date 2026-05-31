import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { unitService } from '@/lib/services/unit.service'
import { unitSchema } from '@/validators/unit'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const units = await unitService.list(tenantId)
  return successResponse(units)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)
  const input = validateSchema(unitSchema, body)
  const unit = await unitService.create(tenantId, userId, input)
  return successResponse(unit, 'Unit created', 201)
})
