// ──────────────────────────────────────────────────────
// POS AI - Finance Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { IncomeInput, ExpenseInput } from '@/validators/finance'
import { createAuditLog } from '@/lib/audit'
import { NotFoundError } from '@/lib/errors'

export const financeService = {
  async list(tenantId: string, params: {
    page?: number; limit?: number; type?: 'income' | 'expense'; category?: string
    startDate?: string; endDate?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, type, sortBy = 'date', sortOrder = 'desc' } = params
    const dateFilter: Record<string, unknown> = {}
    if (params.startDate) dateFilter.gte = new Date(params.startDate)
    if (params.endDate) dateFilter.lte = new Date(params.endDate)

    const whereIncome: Record<string, unknown> = { tenantId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) }
    const whereExpense: Record<string, unknown> = { tenantId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) }

    const [incomeData, expenseData, incomeAgg, expenseAgg] = await Promise.all([
      type !== 'expense' ? prisma.income.findMany({
        where: whereIncome, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { branch: { select: { id: true, name: true } } },
      }) : [],
      type !== 'income' ? prisma.expense.findMany({
        where: whereExpense, skip: (page - 1) * limit, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { branch: { select: { id: true, name: true } } },
      }) : [],
      type !== 'expense' ? prisma.income.aggregate({ where: whereIncome, _sum: { amount: true } }) : { _sum: { amount: null } },
      type !== 'income' ? prisma.expense.aggregate({ where: whereExpense, _sum: { amount: true } }) : { _sum: { amount: null } },
    ])

    return {
      income: incomeData,
      expenses: expenseData,
      totalIncome: incomeAgg._sum.amount?.toNumber() ?? 0,
      totalExpense: expenseAgg._sum.amount?.toNumber() ?? 0,
    }
  },

  async createIncome(tenantId: string, userId: string, input: IncomeInput) {
    let branchId = input.branchId
    if (!branchId) {
      const defaultBranch = await prisma.branch.findFirst({ where: { tenantId } })
      branchId = defaultBranch?.id || ''
    }
    const income = await prisma.income.create({
      data: {
        tenantId, branchId,
        amount: input.amount, category: input.category,
        description: input.description,
        date: input.date ? new Date(input.date) : new Date(),
      },
    })
    await createAuditLog({ tenantId, userId, entity: 'income', entityId: income.id, action: 'CREATE', newValue: { amount: income.amount } })
    return income
  },

  async createExpense(tenantId: string, userId: string, input: ExpenseInput) {
    let branchId = input.branchId
    if (!branchId) {
      const defaultBranch = await prisma.branch.findFirst({ where: { tenantId } })
      branchId = defaultBranch?.id || ''
    }
    const expense = await prisma.expense.create({
      data: {
        tenantId, branchId,
        amount: input.amount, category: input.category,
        description: input.description,
        date: input.date ? new Date(input.date) : new Date(),
      },
    })
    await createAuditLog({ tenantId, userId, entity: 'expense', entityId: expense.id, action: 'CREATE', newValue: { amount: expense.amount } })
    return expense
  },

  async getSummary(tenantId: string, startDate?: string, endDate?: string) {
    const dateFilter: Record<string, unknown> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const where = { tenantId, ...(startDate || endDate ? { date: dateFilter } : {}) }

    const [totalIncome, totalExpense] = await Promise.all([
      prisma.income.aggregate({ where, _sum: { amount: true } }),
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ])

    return {
      totalIncome: totalIncome._sum.amount?.toNumber() ?? 0,
      totalExpense: totalExpense._sum.amount?.toNumber() ?? 0,
      netProfit: (totalIncome._sum.amount?.toNumber() ?? 0) - (totalExpense._sum.amount?.toNumber() ?? 0),
    }
  },
}
