// ──────────────────────────────────────────────────────
// POS AI - Finance Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export const financeRepository = {
  // ── Income ──
  async getIncomes(
    tenantId: string,
    params: { page?: number; limit?: number; startDate?: string; endDate?: string; branchId?: string } = {},
  ) {
    const { page = 1, limit = 10, startDate, endDate, branchId } = params
    const where: Prisma.IncomeWhereInput = {
      tenantId,
      ...(branchId && { branchId }),
      ...(startDate &&
        endDate && {
          date: { gte: new Date(startDate), lte: new Date(endDate) },
        }),
    }

    const [data, total] = await Promise.all([
      prisma.income.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: { branch: { select: { id: true, name: true } } },
      }),
      prisma.income.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async createIncome(data: Prisma.IncomeCreateInput) {
    return prisma.income.create({ data, include: { branch: { select: { id: true, name: true } } } })
  },

  // ── Expenses ──
  async getExpenses(
    tenantId: string,
    params: { page?: number; limit?: number; startDate?: string; endDate?: string; branchId?: string } = {},
  ) {
    const { page = 1, limit = 10, startDate, endDate, branchId } = params
    const where: Prisma.ExpenseWhereInput = {
      tenantId,
      ...(branchId && { branchId }),
      ...(startDate &&
        endDate && {
          date: { gte: new Date(startDate), lte: new Date(endDate) },
        }),
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: { branch: { select: { id: true, name: true } } },
      }),
      prisma.expense.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async createExpense(data: Prisma.ExpenseCreateInput) {
    return prisma.expense.create({ data, include: { branch: { select: { id: true, name: true } } } })
  },

  // ── Summary ──
  async getSummary(tenantId: string, startDate: Date, endDate: Date) {
    const [totalIncome, totalExpense] = await Promise.all([
      prisma.income.aggregate({
        where: { tenantId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { tenantId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
    ])

    return {
      totalIncome: totalIncome._sum.amount?.toNumber() ?? 0,
      totalExpense: totalExpense._sum.amount?.toNumber() ?? 0,
      netCashflow: (totalIncome._sum.amount?.toNumber() ?? 0) - (totalExpense._sum.amount?.toNumber() ?? 0),
    }
  },
}
