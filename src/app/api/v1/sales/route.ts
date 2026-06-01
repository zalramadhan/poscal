import { NextRequest } from 'next/server'
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api-response'
import { getTenantId, parseSearchParams, parseBody, withErrorHandler } from '@/lib/api-handler'
import { saleService } from '@/lib/services/sale.service'
import { saleRepository } from '@/modules/pos/repositories/sale.repository'
import { printService } from '@/lib/services/print.service'
import { saleSchema, saleQuerySchema } from '@/validators/sale'
import { validateSchema } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'
import type { SaleStatus } from '@prisma/client'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const params = await parseSearchParams(request)
  const query = validateSchema(saleQuerySchema, { ...params, page: params.page || '1', limit: params.limit || '10' })

  const result = await saleRepository.findMany(tenantId, {
    page: query.page, limit: query.limit,
    search: query.search, status: query.status as SaleStatus,
    startDate: query.startDate, endDate: query.endDate,
  })
  return paginatedResponse(result.data, result.pagination)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const userId = request.headers.get('x-user-id') || 'system'
  const cashierShiftId = request.headers.get('x-cashier-shift-id')
  const body = await parseBody(request)
  const input = validateSchema(saleSchema, body)

  const sale = await saleService.create({
    ...input,
    tenantId,
    branchId: input.branchId,
    createdBy: userId,
    cashierShiftId: cashierShiftId || undefined,
  })

  const receiptData = await printService.getReceiptData(sale.id, tenantId)
  const invoiceData = await printService.getInvoiceData(sale.id, tenantId)

  return successResponse({ ...sale, receiptData, invoiceData }, 'Sale completed', 201)
})

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const tenantId = await getTenantId(request)
  const { searchParams } = new URL(request.url)
  const invoiceNumber = searchParams.get('invoice')

  if (!invoiceNumber) {
    return errorResponse('Invoice number required', 400)
  }

  const sale = await prisma.sale.findFirst({
    where: { invoiceNumber, tenantId },
    include: { items: true, payments: true }
  })

  if (!sale) {
    return errorResponse('Sale not found', 404)
  }

  await prisma.saleItem.deleteMany({ where: { saleId: sale.id } })
  await prisma.payment.deleteMany({ where: { saleId: sale.id } })
  await prisma.sale.delete({ where: { id: sale.id } })

  return successResponse({ deleted: invoiceNumber })
})