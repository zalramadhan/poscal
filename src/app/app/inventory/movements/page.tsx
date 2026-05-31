'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@tanstack/react-table'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Movement {
  id: string
  product: string
  type: string
  quantity: number
  previousStock: number
  currentStock: number
  notes: string
  createdAt: string
}

const mockMovements: Movement[] = [
  { id: '1', product: 'Indomie Goreng', type: 'PURCHASE', quantity: 100, previousStock: 400, currentStock: 500, notes: 'PO-001', createdAt: new Date().toISOString() },
  { id: '2', product: 'Aqua 600ml', type: 'SALE', quantity: -10, previousStock: 210, currentStock: 200, notes: 'INV-001', createdAt: new Date().toISOString() },
]

const movementVariants: Record<string, 'success' | 'danger' | 'info' | 'warning' | 'default'> = {
  PURCHASE: 'success',
  SALE: 'danger',
  ADJUSTMENT: 'warning',
  TRANSFER_IN: 'info',
  TRANSFER_OUT: 'warning',
  STOCK_OPNAME: 'default',
  RETURN: 'info',
}

const columns: ColumnDef<Movement>[] = [
  { accessorKey: 'product', header: 'Product' },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant={movementVariants[row.getValue('type') as keyof typeof movementVariants] ?? 'default'}>
        {row.getValue('type')}
      </Badge>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      const qty = row.getValue<number>('quantity')
      return <span className={qty < 0 ? 'text-danger font-medium' : 'text-success font-medium'}>{qty > 0 ? '+' : ''}{qty}</span>
    },
  },
  { accessorKey: 'previousStock', header: 'Previous Stock' },
  { accessorKey: 'currentStock', header: 'Current Stock' },
  { accessorKey: 'notes', header: 'Reference' },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
]

export default function MovementsPage() {
  return (
    <div>
      <PageHeader title="Stock Movements" description="History of all inventory movements" />
      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={mockMovements} />
        </CardContent>
      </Card>
    </div>
  )
}
