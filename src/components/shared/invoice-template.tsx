'use client'

import { QRCode } from './qr-code'
import { formatCurrency, formatDate } from '@/lib/utils'

interface InvoiceTemplateProps {
  data: {
    invoiceNumber: string
    date: string
    time: string
    cashier: string
    branch: string
    items: { sku: string; name: string; quantity: number; price: number; subtotal: number }[]
    subtotal: number
    discount: number
    total: number
    paymentMethod: string
    cashReceived: number
    change: number
    verifyUrl: string
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    address?: string
    paymentDetails: { method: string; amount: number; reference?: string }[]
    footerText?: string
  }
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
}

export function InvoiceTemplate({
  data,
  businessName = 'TOKO AMAN',
  businessAddress = '',
  businessPhone = '',
  businessEmail = ''
}: InvoiceTemplateProps) {
  return (
    <div style={{ width: '210mm', fontFamily: 'Arial, sans-serif', fontSize: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{businessName}</div>
          {businessAddress && <div>{businessAddress}</div>}
          {businessPhone && <div>Telp: {businessPhone}</div>}
          {businessEmail && <div>Email: {businessEmail}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>INVOICE</div>
          <div>Invoice #: {data.invoiceNumber}</div>
          <div>Date: {data.date}</div>
          <div>Time: {data.time}</div>
          <div>Cashier: {data.cashier}</div>
          <div>Branch: {data.branch}</div>
        </div>
      </div>

      {data.customerName && (
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <strong>CUSTOMER INFORMATION</strong>
          <div style={{ display: 'flex', gap: '20px' }}>
            {data.customerName && <span>Name: {data.customerName}</span>}
            {data.customerPhone && <span>Phone: {data.customerPhone}</span>}
            {data.customerEmail && <span>Email: {data.customerEmail}</span>}
          </div>
          {data.address && <div>Address: {data.address}</div>}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>NO</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>ITEM</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>SKU</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>QTY</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>UNIT PRICE</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{i + 1}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{item.name}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{item.sku}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          {data.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Discount:</span>
              <span>-{formatCurrency(data.discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold', fontSize: '14px', borderTop: '2px solid #000' }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #000', paddingBottom: '10px' }}>
        <strong>PAYMENT DETAILS</strong>
        {data.paymentDetails.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', padding: '2px 0' }}>
            <span>{p.method}:</span>
            <span>{formatCurrency(p.amount)}</span>
            {p.reference && <span>Ref: {p.reference}</span>}
          </div>
        ))}
        <div style={{ display: 'flex', gap: '20px', padding: '4px 0', fontWeight: 'bold' }}>
          <span>Change:</span>
          <span>{formatCurrency(data.change)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>{data.verifyUrl}</div>
          <QRCode value={data.verifyUrl} size={100} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '10px' }}>
          {data.footerText || 'Thank you for your purchase!'}
        </div>
      </div>
    </div>
  )
}