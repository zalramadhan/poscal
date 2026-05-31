'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { usePaginatedFetch } from '@/hooks'
import type { ColumnDef } from '@tanstack/react-table'
import type { Sale } from '@/types'

// Map Sale API type → table-friendly format
interface SaleRow {
  id: string
  invoiceNumber: string
  customer: string
  total: number
  status: string
  items: number
  createdAt: string
}

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'danger' | 'info'> = {
  COMPLETED: 'success',
  DRAFT: 'default',
  HOLD: 'warning',
  CANCELLED: 'danger',
  REFUNDED: 'info',
}

const columns: ColumnDef<SaleRow>[] = [
  { accessorKey: 'invoiceNumber', header: 'Invoice' },
  { accessorKey: 'customer', header: 'Customer' },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.getValue('total')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.getValue('status') as keyof typeof statusVariant] ?? 'default'}>
        {row.getValue('status')}
      </Badge>
    ),
  },
  { accessorKey: 'items', header: 'Items' },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/app/pos/history/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />View
        </Button>
      </Link>
    ),
  },
]

function mapSalesToRows(sales: Sale[]): SaleRow[] {
  return sales.map((s) => ({
    id: s.id,
    invoiceNumber: s.invoiceNumber,
    customer: s.customer?.name || 'Walk-in',
    total: s.total,
    status: s.status,
    items: s.items?.length || 0,
    createdAt: s.createdAt,
  }))
}

export default function SalesHistoryPage() {
  const { data, loading, error, refetch } = usePaginatedFetch<Sale>('/api/v1/sales')
  const rows = mapSalesToRows(data)

  if (loading) return <LoadingState message="Loading sales..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <div>
      <PageHeader
        title="Sales History"
        description="View all completed sales transactions"
      >
        <Link href="/app/pos">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to POS
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={rows}
            searchKey="invoiceNumber"
            searchPlaceholder="Search invoice..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
