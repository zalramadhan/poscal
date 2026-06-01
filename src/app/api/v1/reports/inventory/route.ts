import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, withErrorHandler } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)
  const type = params.type as string

  if (type === 'shrinkage') {
    const startDate = params.startDate ? new Date(params.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = params.endDate ? new Date(params.endDate as string) : new Date()

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        tenantId,
        movementType: { in: ['WASTAGE', 'BREAKAGE', 'THEFT', 'SHRINKAGE'] },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const summary = {
      totalWastage: movements.filter((m) => m.movementType === 'WASTAGE').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
      totalBreakage: movements.filter((m) => m.movementType === 'BREAKAGE').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
      totalTheft: movements.filter((m) => m.movementType === 'THEFT').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
      totalShrinkage: movements.filter((m) => m.movementType === 'SHRINKAGE').reduce((sum, m) => sum + Math.abs(m.quantity.toNumber()), 0),
    }
    summary.totalLoss = summary.totalWastage + summary.totalBreakage + summary.totalTheft + summary.totalShrinkage

    return successResponse({ data: movements, summary }, 'Shrinkage report retrieved')
  }

  return successResponse(null, 'Invalid report type')
})
