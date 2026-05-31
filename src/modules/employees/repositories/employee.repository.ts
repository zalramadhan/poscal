// ──────────────────────────────────────────────────────
// POS AI - Employee Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma } from '../../../../generated/prisma/client'

export const employeeRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        role: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    })
  },

  async findMany(tenantId: string, params: { page?: number; limit?: number; search?: string; roleId?: string } = {}) {
    const { page = 1, limit = 10, search, roleId } = params
    const where: Prisma.UserWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(roleId && { roleId }),
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          role: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data })
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
  },

  async getRoles(tenantId: string) {
    return prisma.role.findMany({
      where: { tenantId },
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    })
  },

  async getPermissions() {
    return prisma.permission.findMany({ orderBy: { module: 'asc' } })
  },

  async getBranches(tenantId: string) {
    return prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    })
  },
}
