import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const tenantId = await getTenantId(request)
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!id) {
    return Response.json({ success: false, error: 'ID is required' }, { status: 400 })
  }

  if (type === 'income') {
    await prisma.income.deleteMany({ where: { id, tenantId } })
  } else if (type === 'expense') {
    await prisma.expense.deleteMany({ where: { id, tenantId } })
  }

  return successResponse(null, 'Transaction deleted')
})
