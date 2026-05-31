import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, withErrorHandler } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 20
  const entity = searchParams.get('entity') || undefined

  const where: Record<string, unknown> = { tenantId }
  if (entity) where.entity = entity

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { },
    }),
    prisma.auditLog.count({ where }),
  ])

  return paginatedResponse(data, { page, limit, total, totalPages: Math.ceil(total / limit) })
})
