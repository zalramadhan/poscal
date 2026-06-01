import { z } from 'zod'

export const incomeSchema = z.object({
  branchId: z.string().optional(),
  amount: z.number().min(1, 'Amount must be >= 1'),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
})

export const expenseSchema = z.object({
  branchId: z.string().optional(),
  amount: z.number().min(1, 'Amount must be >= 1'),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
})

export const financeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type IncomeInput = z.infer<typeof incomeSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
