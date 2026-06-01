import { prisma } from '@/lib/prisma'
import { NotFoundError, ConflictError } from '@/lib/errors'

export const shiftService = {
  async startShift(params: {
    tenantId: string
    userId: string
    branchId: string
    openingCash: number
  }) {
    const { tenantId, userId, branchId, openingCash } = params

    const existingShift = await prisma.cashierShift.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
    })

    if (existingShift) {
      throw new ConflictError('You already have an open shift')
    }

    const shift = await prisma.cashierShift.create({
      data: {
        tenantId,
        userId,
        branchId,
        openingCash,
        status: 'OPEN',
      },
    })

    return shift
  },

  async getCurrentShift(tenantId: string, userId: string) {
    const shift = await prisma.cashierShift.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
      include: {
        _count: { select: { sales: true } },
      },
    })
    if (shift) {
      const [user, branch] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } }),
        prisma.branch.findUnique({ where: { id: shift.branchId }, select: { id: true, name: true } }),
      ])
      return { ...shift, user, branch }
    }
    return shift
  },

  async getShiftById(shiftId: string, tenantId: string) {
    const shift = await prisma.cashierShift.findFirst({
      where: { id: shiftId, tenantId },
      include: {
        sales: {
          include: {
            payments: { include: { paymentMethod: true } },
            items: { include: { product: true } },
          },
        },
      },
    })
    if (!shift) throw new NotFoundError('Cashier shift')

    const [user, branch] = await Promise.all([
      prisma.user.findUnique({ where: { id: shift.userId }, select: { id: true, name: true, email: true } }),
      prisma.branch.findUnique({ where: { id: shift.branchId }, select: { id: true, name: true } }),
    ])

    return { ...shift, user, branch }
  },

  async listShifts(params: {
    tenantId: string
    page?: number
    limit?: number
    status?: 'OPEN' | 'PENDING_APPROVAL' | 'CLOSED'
    userId?: string
    branchId?: string
    startDate?: string
    endDate?: string
  }) {
    const { tenantId, page = 1, limit = 20, status, userId, branchId, startDate, endDate } = params

    const where: any = { tenantId }
    if (status) where.status = status
    if (userId) where.userId = userId
    if (branchId) where.branchId = branchId
    if (startDate || endDate) {
      where.openedAt = {}
      if (startDate) where.openedAt.gte = new Date(startDate)
      if (endDate) where.openedAt.lte = new Date(endDate)
    }

    const [shifts, total] = await Promise.all([
      prisma.cashierShift.findMany({
        where,
        include: {
          _count: { select: { sales: true } },
        },
        orderBy: { openedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashierShift.count({ where }),
    ])

    const userIds = [...new Set(shifts.map(s => s.userId))]
    const branchIds = [...new Set(shifts.map(s => s.branchId))]
    const [users, branches] = await Promise.all([
      userIds.length ? prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } }) : [],
      branchIds.length ? prisma.branch.findMany({ where: { id: { in: branchIds } }, select: { id: true, name: true } }) : [],
    ])
    const userMap = new Map(users.map(u => [u.id, u]))
    const branchMap = new Map(branches.map(b => [b.id, b]))

    const data = shifts.map(shift => ({
      ...shift,
      user: userMap.get(shift.userId),
      branch: branchMap.get(shift.branchId),
    }))

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  },

  async closeShift(params: {
    shiftId: string
    tenantId: string
    closingCash: number
    notes?: string
  }) {
    const { shiftId, tenantId, closingCash, notes } = params

    const shift = await prisma.cashierShift.findFirst({
      where: { id: shiftId, tenantId, status: 'OPEN' },
      include: {
        sales: {
          where: { status: 'COMPLETED' },
          include: { payments: { include: { paymentMethod: true } } },
        },
      },
    })

    if (!shift) throw new NotFoundError('Open shift not found')

    const cashSalesTotal = shift.sales
      .filter((sale) => sale.payments.some((p) => p.paymentMethod.name.toLowerCase().includes('cash')))
      .reduce((sum, sale) => sum + sale.total.toNumber(), 0)

    const refundTotal = shift.sales
      .filter((sale) => sale.status === 'REFUNDED')
      .reduce((sum, sale) => sum + sale.total.toNumber(), 0)

    const expectedCash = shift.openingCash.toNumber() + cashSalesTotal - refundTotal
    const variance = closingCash - expectedCash

    const updateData: any = {
      closingCash,
      expectedCash,
      variance,
      notes,
    }

    if (variance === 0) {
      updateData.status = 'CLOSED'
      updateData.closedAt = new Date()
    } else {
      updateData.status = 'PENDING_APPROVAL'
    }

    const updated = await prisma.cashierShift.update({
      where: { id: shiftId },
      data: updateData,
    })

    return updated
  },

  async approveShift(params: {
    shiftId: string
    tenantId: string
    managerId: string
    notes?: string
  }) {
    const { shiftId, tenantId, managerId, notes } = params

    const shift = await prisma.cashierShift.findFirst({
      where: { id: shiftId, tenantId, status: 'PENDING_APPROVAL' },
    })

    if (!shift) throw new NotFoundError('Shift pending approval not found')

    const updated = await prisma.cashierShift.update({
      where: { id: shiftId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: managerId,
        notes: notes || shift.notes,
      },
    })

    return updated
  },

  async getShiftReport(shiftId: string, tenantId: string) {
    const shift = await this.getShiftById(shiftId, tenantId)

    const completedSales = shift.sales.filter((s) => s.status === 'COMPLETED')
    const refundedSales = shift.sales.filter((s) => s.status === 'REFUNDED')

    const byPaymentMethod: Record<string, { count: number; total: number }> = {}
    for (const sale of completedSales) {
      for (const payment of sale.payments) {
        const methodName = payment.paymentMethod.name.toLowerCase()
        if (!byPaymentMethod[methodName]) {
          byPaymentMethod[methodName] = { count: 0, total: 0 }
        }
        byPaymentMethod[methodName].count++
        byPaymentMethod[methodName].total += payment.amount.toNumber()
      }
    }

    const totalRevenue = completedSales.reduce((sum, s) => sum + s.total.toNumber(), 0)
    const totalRefunds = refundedSales.reduce((sum, s) => sum + s.total.toNumber(), 0)

    const durationMs = shift.closedAt
      ? new Date(shift.closedAt).getTime() - new Date(shift.openedAt).getTime()
      : Date.now() - new Date(shift.openedAt).getTime()
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    const duration = `${durationHours}h ${durationMinutes}m`

    return {
      shift: {
        id: shift.id,
        user: shift.user,
        branch: shift.branch,
        status: shift.status,
        openingCash: shift.openingCash.toNumber(),
        closingCash: shift.closingCash?.toNumber(),
        expectedCash: shift.expectedCash?.toNumber(),
        variance: shift.variance?.toNumber(),
        openedAt: shift.openedAt,
        closedAt: shift.closedAt,
      },
      sales: {
        totalCount: completedSales.length,
        totalRevenue,
        byPaymentMethod,
        refunds: { count: refundedSales.length, total: totalRefunds },
      },
      duration,
    }
  },
}
