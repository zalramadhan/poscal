// ──────────────────────────────────────────────────────
// POS AI - Settings Service
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { RoleInput, BranchInput, TenantSettingsInput } from '@/validators/settings'
import { createAuditLog } from '@/lib/audit'
import { AppError, NotFoundError } from '@/lib/errors'
import type { Prisma, UserStatus, User } from '../../../generated/prisma/client'

export const settingsService = {
  // ── Tenant ──
  async updateTenant(tenantId: string, input: TenantSettingsInput) {
    return prisma.tenant.update({ where: { id: tenantId }, data: input })
  },

  async getTenant(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw new NotFoundError('Tenant')
    return tenant
  },

  // ── Branches ──
  async listBranches(tenantId: string) {
    return prisma.branch.findMany({ where: { tenantId }, orderBy: { name: 'asc' } })
  },

  async createBranch(tenantId: string, userId: string, input: BranchInput) {
    const existing = await prisma.branch.findFirst({ where: { tenantId, code: input.code } })
    if (existing) throw new AppError('Branch code already exists', 409)

    const branch = await prisma.branch.create({ data: { ...input, tenantId } })
    await createAuditLog({ tenantId, userId, entity: 'branch', entityId: branch.id, action: 'CREATE', newValue: { name: branch.name } })
    return branch
  },

  async updateBranch(id: string, tenantId: string, userId: string, input: Partial<BranchInput>) {
    const branch = await prisma.branch.findFirst({ where: { id, tenantId } })
    if (!branch) throw new NotFoundError('Branch')

    const updated = await prisma.branch.update({ where: { id }, data: input })
    await createAuditLog({ tenantId, userId, entity: 'branch', entityId: id, action: 'UPDATE', newValue: { name: updated.name } })
    return updated
  },

  // ── Roles ──
  async listRoles(tenantId: string) {
    return prisma.role.findMany({ where: { tenantId }, orderBy: { name: 'asc' } })
  },

  async createRole(tenantId: string, userId: string, input: RoleInput) {
    const existing = await prisma.role.findFirst({ where: { tenantId, name: input.name } })
    if (existing) throw new AppError('Role already exists', 409)

    const { permissions, ...roleData } = input
    const role = await prisma.role.create({
      data: {
        ...roleData,
        tenantId,
        permissions: {
          create: permissions.map((permissionId) => ({
            permissionId,
          })),
        },
      },
    })
    await createAuditLog({ tenantId, userId, entity: 'role', entityId: role.id, action: 'CREATE', newValue: { name: role.name } })
    return role
  },

  async updateRole(id: string, tenantId: string, userId: string, input: Partial<RoleInput>) {
    const role = await prisma.role.findFirst({ where: { id, tenantId } })
    if (!role) throw new NotFoundError('Role')

    const { permissions, ...roleData } = input
    const updated = await prisma.role.update({ where: { id }, data: roleData })
    await createAuditLog({ tenantId, userId, entity: 'role', entityId: id, action: 'UPDATE' })
    return updated
  },

  async deleteRole(id: string, tenantId: string, userId: string) {
    const userCount = await prisma.user.count({ where: { roleId: id, deletedAt: null } })
    if (userCount > 0) throw new AppError(`Cannot delete role: ${userCount} users are assigned to it`, 400)

    await prisma.role.delete({ where: { id } })
    await createAuditLog({ tenantId, userId, entity: 'role', entityId: id, action: 'DELETE' })
  },

  async deleteBranch(id: string, tenantId: string, userId: string) {
    const branch = await prisma.branch.findFirst({ where: { id, tenantId } })
    if (!branch) throw new NotFoundError('Branch')

    await prisma.branch.delete({ where: { id } })
    await createAuditLog({ tenantId, userId, entity: 'branch', entityId: id, action: 'DELETE', newValue: { name: branch.name } })
  },

  // ── Users (Employees) ──
  async listUsers(tenantId: string) {
    return prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { role: { select: { id: true, name: true } }, branch: { select: { id: true, name: true } } },
    })
  },

  async updateUserStatus(id: string, tenantId: string, userId: string, data: { status?: string; roleId?: string; branchId?: string | null }) {
    const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } })
    if (!user) throw new NotFoundError('User')

    const updateData: Prisma.UserUncheckedUpdateInput = {}
    if (data.status !== undefined) updateData.status = data.status as UserStatus
    if (data.roleId !== undefined) updateData.roleId = data.roleId
    if (data.branchId !== undefined) updateData.branchId = data.branchId ?? null

    const updated = await prisma.user.update({ where: { id }, data: updateData })
    await createAuditLog({ tenantId, userId, entity: 'user', entityId: id, action: 'UPDATE_STATUS', newValue: data })
    return updated
  },

  async deleteUser(id: string, tenantId: string, userId: string) {
    const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } })
    if (!user) throw new NotFoundError('User')

    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
    await createAuditLog({ tenantId, userId, entity: 'user', entityId: id, action: 'DELETE', newValue: { name: user.name } })
  },
}
