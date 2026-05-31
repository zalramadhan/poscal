// ──────────────────────────────────────────────────────
// POS AI - Settings Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'

export const settingsRepository = {
  async getTenant(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: { branches: true, users: { take: 5 } },
    })
  },

  async updateTenant(id: string, data: { name?: string; email?: string; phone?: string }) {
    return prisma.tenant.update({ where: { id }, data })
  },

  async getBranches(tenantId: string) {
    return prisma.branch.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    })
  },

  async createBranch(data: { tenantId: string; name: string; code: string; address?: string; phone?: string }) {
    return prisma.branch.create({ data })
  },

  async updateBranch(id: string, data: { name?: string; code?: string; address?: string; phone?: string; isActive?: boolean }) {
    return prisma.branch.update({ where: { id }, data })
  },

  async getSystemSettings(tenantId: string) {
    return prisma.systemSetting.findMany({ where: { tenantId } })
  },

  async upsertSetting(tenantId: string, key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { tenantId_key: { tenantId, key } },
      update: { value },
      create: { tenantId, key, value },
    })
  },

  async getPaymentMethods(tenantId: string) {
    return prisma.paymentMethod.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    })
  },
}
