// ──────────────────────────────────────────────────────
// POS AI - Sale Repository
// ──────────────────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import type { Prisma, SaleStatus } from '../../../../generated/prisma/client'

const saleInclude = {
  items: {
    include: { product: { select: { id: true, name: true, sku: true } } },
  },
  payments: {
    include: { paymentMethod: { select: { id: true, name: true } } },
  },
  customer: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
} as const

export const saleRepository = {
  async findById(id: string, tenantId: string) {
    return prisma.sale.findFirst({
      where: { id, tenantId },
      include: saleInclude,
    })
  },

  async findByInvoice(invoiceNumber: string, tenantId: string) {
    return prisma.sale.findFirst({
      where: { invoiceNumber, tenantId },
      include: saleInclude,
    })
  },

  async findMany(
    tenantId: string,
    params: {
      page?: number
      limit?: number
      search?: string
      status?: SaleStatus
      startDate?: string
      endDate?: string
    } = {},
  ) {
    const { page = 1, limit = 10, search, status, startDate, endDate } = params
    const where: Prisma.SaleWhereInput = {
      tenantId,
      ...(search && { invoiceNumber: { contains: search, mode: 'insensitive' } }),
      ...(startDate &&
        endDate && {
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
        }),
    }

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, name: true, sku: true } } } },
          payments: { include: { paymentMethod: { select: { id: true, name: true } } } },
        },
      }),
      prisma.sale.count({ where }),
    ])

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  },

  async create(data: Prisma.SaleCreateInput) {
    return prisma.sale.create({ data, include: saleInclude })
  },

  async updateStatus(id: string, status: SaleStatus) {
    return prisma.sale.update({
      where: { id },
      data: { status },
    })
  },
}
