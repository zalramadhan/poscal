// ──────────────────────────────────────────────────────
// POS AI - Purchase Order Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma, PurchaseOrderStatus } from '@prisma/client'

export const purchaseRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })
  },

  async findMany(
    tenantId: string,
    params: { page?: number; limit?: number; status?: PurchaseOrderStatus; supplierId?: string } = {},
  ) {
    const { page = 1, limit = 10, status, supplierId } = params
    const where: Prisma.PurchaseOrderWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(supplierId && { supplierId }),
    }

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          items: {
            include: { product: { select: { id: true, name: true, sku: true } } },
          },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async create(data: Prisma.PurchaseOrderCreateInput) {
    return prisma.purchaseOrder.create({
      data,
      include: {
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })
  },

  async updateStatus(id: string, status: PurchaseOrderStatus) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: { status },
    })
  },
}
