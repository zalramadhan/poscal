import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { opnameService } from '@/lib/services/opname.service'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const { warehouseId, notes } = body
  const opname = await opnameService.start({ tenantId, warehouseId, notes, createdBy: userId })
  return successResponse(opname, 'Stock opname started', 201)
})