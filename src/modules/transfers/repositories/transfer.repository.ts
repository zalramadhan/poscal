// ──────────────────────────────────────────────────────
// POS AI - Stock Transfer Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma, TransferStatus } from '@prisma/client'

export const transferRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.stockTransfer.findFirst({
      where: { id, tenantId },
      include: {
        fromWarehouse: { select: { id: true, name: true } },
        toWarehouse: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })
  },

  async findMany(tenantId: string, params: { page?: number; limit?: number;      status?: TransferStatus } = {}) {
    const { page = 1, limit = 10, status } = params
    const where: Prisma.StockTransferWhereInput = {
      tenantId,
      ...(status && { status }),
    }

    const [data, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          fromWarehouse: { select: { id: true, name: true } },
          toWarehouse: { select: { id: true, name: true } },
          items: {
            include: { product: { select: { id: true, name: true, sku: true } } },
          },
        },
      }),
      prisma.stockTransfer.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async create(data: Prisma.StockTransferCreateInput) {
    return prisma.stockTransfer.create({
      data,
      include: {
        fromWarehouse: { select: { id: true, name: true } },
        toWarehouse: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })
  },

  async updateStatus(id: string, status: TransferStatus) {
    return prisma.stockTransfer.update({
      where: { id },
      data: { status },
    })
  },
}
