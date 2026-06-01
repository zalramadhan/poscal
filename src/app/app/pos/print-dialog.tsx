'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReceiptTemplate } from '@/components/shared/receipt-template'
import { InvoiceTemplate } from '@/components/shared/invoice-template'
import { formatCurrency } from '@/lib/utils'

interface PrintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId: string
  receiptData: any
  invoiceData: any
}

export function PrintDialog({ open, onOpenChange, saleId, receiptData, invoiceData }: PrintDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !receiptRef.current) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptData.invoiceNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `)
  }

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !invoiceRef.current) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceData.invoiceNumber}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Print Receipt / Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatCurrency(receiptData?.total || 0)}</p>
            <p className="text-sm text-muted-foreground">{receiptData?.invoiceNumber}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
            <Button className="flex-1" variant="outline" onClick={handlePrintInvoice}>
              Print Invoice
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Done (No Print)
          </Button>
        </div>

        <div style={{ position: 'absolute', left: '-9999px' }}>
          <div ref={receiptRef}>
            {receiptData && <ReceiptTemplate data={receiptData} />}
          </div>
          <div ref={invoiceRef}>
            {invoiceData && <InvoiceTemplate data={invoiceData} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}