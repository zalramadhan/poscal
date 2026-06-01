import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'
import type { TransferStatus } from '@prisma/client'
import { transferService } from '@/lib/services/warehouse.service'

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const transfer = await transferService.getById(id, tenantId)
  return successResponse(transfer)
})

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'execute') {
    const result = await transferService.execute(id, tenantId, userId)
    return successResponse(result, 'Transfer executed')
  }

  return successResponse(null, 'Unknown action')
})

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  await prisma.stockTransfer.update({ where: { id }, data: { status: 'CANCELLED' as TransferStatus } })
  return successResponse(null, 'Transfer deleted')
})
