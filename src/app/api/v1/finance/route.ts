import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-response'
import { getTenantId, parseBody, withErrorHandler } from '@/lib/api-handler'
import { financeService } from '@/lib/services/finance.service'
import { incomeSchema, expenseSchema } from '@/validators/finance'
import { validateSchema } from '@/lib/api-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined

  const summary = await financeService.getSummary(tenantId, startDate, endDate)
  return successResponse(summary)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const body = await parseBody(request)

  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'income'

  if (type === 'expense') {
    const input = validateSchema(expenseSchema, body)
    const expense = await financeService.createExpense(tenantId, userId, input)
    return successResponse(expense, 'Expense recorded', 201)
  }

  const input = validateSchema(incomeSchema, body)
  const income = await financeService.createIncome(tenantId, userId, input)
  return successResponse(income, 'Income recorded', 201)
})
