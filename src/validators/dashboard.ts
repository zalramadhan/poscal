import { z } from 'zod'

export const dashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  branchId: z.string().optional(),
})

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>
