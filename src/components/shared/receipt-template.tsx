'use client'

import { QRCode } from './qr-code'
import { formatCurrency } from '@/lib/utils'

interface ReceiptTemplateProps {
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
  }
  businessName?: string
  businessAddress?: string
  businessPhone?: string
}

export function ReceiptTemplate({ data, businessName = 'TOKO AMAN', businessAddress = '', businessPhone = '' }: ReceiptTemplateProps) {
  return (
    <div style={{ width: '280px', fontFamily: 'monospace', fontSize: '12px', padding: '8px' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{businessName}</div>
        {businessAddress && <div>{businessAddress}</div>}
        {businessPhone && <div>Telp: {businessPhone}</div>}
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Invoice #:</span>
          <span>{data.invoiceNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{data.date}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Time:</span>
          <span>{data.time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cashier:</span>
          <span>{data.cashier}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Branch:</span>
          <span>{data.branch}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', fontWeight: 'bold' }}>
          <span>SKU</span>
          <span>Item</span>
          <span style={{ textAlign: 'center' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Price</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
        {data.items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '2px' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sku}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
            <span style={{ textAlign: 'center' }}>{item.quantity}</span>
            <span style={{ textAlign: 'right' }}>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        {data.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d00' }}>
            <span>Discount:</span>
            <span>-{formatCurrency(data.discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>CASH:</span>
          <span>{formatCurrency(data.cashReceived)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>CHANGE:</span>
          <span>{formatCurrency(data.change)}</span>
        </div>
      </div>

      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px', textAlign: 'center' }}>
        <div>Payment: {data.paymentMethod}</div>
      </div>

      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', marginBottom: '8px' }}>{data.verifyUrl}</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <QRCode value={data.verifyUrl} size={80} />
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '10px' }}>
        Thank you for your purchase!
      </div>
    </div>
  )
}