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
    
    // Build WHERE clause - always filter by tenantId using raw SQL
    let whereClause = `s."tenantId" = $1`
    const queryParams: any[] = [tenantId]
    let paramIndex = 2
    
    if (search) {
      whereClause += ` AND s."invoiceNumber" LIKE $${paramIndex}`
      queryParams.push(`%${search}%`)
      paramIndex++
    }
    
    if (status) {
      whereClause += ` AND s.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }
    
    if (startDate && endDate) {
      whereClause += ` AND s."createdAt" >= $${paramIndex} AND s."createdAt" <= $${paramIndex + 1}`
      queryParams.push(new Date(startDate), new Date(endDate))
      paramIndex += 2
    }

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as total FROM "public"."Sale" s WHERE ${whereClause}`,
      ...queryParams
    )
    const total = Number(countResult[0]?.total) || 0

    // Get sales
    const offset = (page - 1) * limit
    const sales = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        s.*,
        c.name as "customerName",
        c.id as "customerId"
      FROM "public"."Sale" s
      LEFT JOIN "public"."Customer" c ON s."customerId" = c.id
      WHERE ${whereClause}
      ORDER BY s."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `, ...queryParams)

    // Get items for all sales
    const saleIds = sales.map(s => s.id)
    let items: any[] = []
    let payments: any[] = []
    
    if (saleIds.length > 0) {
      const idsPlaceholder = saleIds.map((_, i) => `$${i + 1}`).join(',')
      items = await prisma.$queryRawUnsafe<any[]>(`
        SELECT si.*, p.name as "productName", p.sku as "productSku"
        FROM "public"."SaleItem" si
        INNER JOIN "public"."Product" p ON si."productId" = p.id
        WHERE si."saleId" IN (${idsPlaceholder})
      `, ...saleIds)
      
      payments = await prisma.$queryRawUnsafe<any[]>(`
        SELECT pm.*, pm.name as "paymentMethodName"
        FROM "public"."Payment" pm
        WHERE pm."saleId" IN (${idsPlaceholder})
      `, ...saleIds)
    }

    // Combine data
    const data = sales.map(sale => ({
      ...sale,
      customer: { id: sale.customerId, name: sale.customerName },
      items: items.filter(i => i.saleId === sale.id).map(i => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        product: { id: i.productId, name: i.productName, sku: i.productSku }
      })),
      payments: payments.filter(p => p.saleId === sale.id).map(p => ({
        id: p.id,
        paymentMethodId: p.paymentMethodId,
        amount: p.amount,
        paymentMethod: { id: p.paymentMethodId, name: p.paymentMethodName }
      }))
    }))

    return { 
      data, 
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } 
    }
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
