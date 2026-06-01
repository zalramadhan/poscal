import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReceiptItem {
  sku: string
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface ReceiptData {
  invoiceNumber: string
  date: string
  time: string
  cashier: string
  branch: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  cashReceived: number
  change: number
  verifyUrl: string
}

interface InvoiceData extends ReceiptData {
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  address?: string
  paymentDetails: {
    method: string
    amount: number
    reference?: string
  }[]
  footerText: string
}

export const printService = {
  async getReceiptData(saleId: string, tenantId: string): Promise<ReceiptData> {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: {
        items: { include: { product: true } },
        payments: { include: { paymentMethod: true } },
        createdByUser: { select: { name: true } },
        branch: true,
        customer: true,
      },
    })

    if (!sale) throw new Error('Sale not found')

    const payment = sale.payments[0]
    const items: ReceiptItem[] = sale.items.map((item) => ({
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity.toNumber(),
      price: item.price.toNumber(),
      subtotal: item.subtotal.toNumber(),
    }))

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/app/verify/${sale.invoiceNumber}`

    return {
      invoiceNumber: sale.invoiceNumber,
      date: formatDate(sale.createdAt),
      time: new Date(sale.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      cashier: sale.createdByUser?.name || 'Unknown',
      branch: sale.branch.name,
      items,
      subtotal: sale.subtotal.toNumber(),
      discount: sale.discount.toNumber(),
      total: sale.total.toNumber(),
      paymentMethod: payment?.paymentMethod?.name || 'Unknown',
      cashReceived: payment?.amount.toNumber() || sale.total.toNumber(),
      change: payment ? payment.amount.toNumber() - sale.total.toNumber() : 0,
      verifyUrl,
    }
  },

  async getInvoiceData(saleId: string, tenantId: string): Promise<InvoiceData> {
    const receipt = await this.getReceiptData(saleId, tenantId)

    const sale = await prisma.sale.findFirst({
      where: { id: saleId, tenantId },
      include: { customer: true, payments: { include: { paymentMethod: true } } },
    })

    const paymentDetails = sale?.payments.map((p) => ({
      method: p.paymentMethod.name,
      amount: p.amount.toNumber(),
      reference: p.referenceNumber || undefined,
    })) || []

    return {
      ...receipt,
      customerName: sale?.customer?.name,
      customerPhone: sale?.customer?.phone,
      customerEmail: sale?.customer?.email,
      address: sale?.customer?.address,
      paymentDetails,
      footerText: 'This is a computer-generated invoice. No signature required.',
    }
  },
}