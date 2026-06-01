import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'

interface VerifyPageProps {
  params: Promise<{ invoiceNumber: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { invoiceNumber } = await params

  const sale = await prisma.sale.findFirst({
    where: { invoiceNumber },
    include: {
      items: {
        include: { product: { select: { name: true, sku: true } } },
      },
      branch: { select: { name: true } },
      tenant: { select: { name: true } },
    },
  })

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invoice</h1>
          <p className="text-gray-600">
            The invoice number <strong>{invoiceNumber}</strong> could not be found in our system.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white p-6 text-center">
            <div className="text-5xl mb-2">✓</div>
            <h1 className="text-2xl font-bold">Verified Transaction</h1>
            <p className="text-green-100 mt-1">This receipt is authentic</p>
          </div>

          <div className="p-6">
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Invoice Number</span>
                <span className="font-bold text-lg">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Date</span>
                <span>{formatDate(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Time</span>
                <span>{new Date(sale.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Branch</span>
                <span>{sale.branch?.name || '-'}</span>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h2 className="font-semibold mb-3">Items Purchased</h2>
              <div className="space-y-2">
                {sale.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{Number(item.quantity)}x {item.product?.name || 'Unknown'}</span>
                    <span className="font-medium">{formatCurrency(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(Number(sale.subtotal))}</span>
              </div>
              {sale.discount && Number(sale.discount) > 0 && (
                <div className="flex justify-between items-center mb-2 text-red-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(sale.discount))}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(Number(sale.total))}</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Verified by {sale.tenant?.name || 'POS System'}</p>
              <p className="mt-1">This is an official receipt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}