'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { DataTable, type FilterConfig } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { usePaginatedFetch } from '@/hooks'
import type { ColumnDef } from '@tanstack/react-table'
import type { PurchaseOrder } from '@/types'

interface PurchaseRow {
  id: string
  poNumber: string
  supplier: string
  warehouse: string
  status: string
  total: number
  items: number
  createdAt: string
}

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info' | 'danger'> = {
  DRAFT: 'default',
  APPROVED: 'info',
  ORDERED: 'warning',
  RECEIVED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

const statusFilters: FilterConfig = {
  id: 'status',
  label: 'Status',
  placeholder: 'All Status',
  options: [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Ordered', value: 'ORDERED' },
    { label: 'Received', value: 'RECEIVED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ],
}

function mapPOsToRows(pos: PurchaseOrder[]): PurchaseRow[] {
  return pos.map((po) => ({
    id: po.id,
    poNumber: po.poNumber,
    supplier: po.supplier?.name || '-',
    warehouse: po.warehouse?.name || '-',
    status: po.status,
    total: po.total,
    items: (po as any)._count?.items || po.items?.length || 0,
    createdAt: po.createdAt,
  }))
}

const columns: ColumnDef<PurchaseRow>[] = [
  { accessorKey: 'poNumber', header: 'PO Number' },
  { accessorKey: 'supplier', header: 'Supplier' },
  { accessorKey: 'warehouse', header: 'Warehouse' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.getValue('status') as keyof typeof statusVariant] ?? 'default'}>
        {row.getValue('status')}
      </Badge>
    ),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatCurrency(row.getValue('total')),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/app/purchases/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />View
        </Button>
      </Link>
    ),
  },
]

export default function PurchasesPage() {
  const { data, loading, error, refetch } = usePaginatedFetch<PurchaseOrder>('/api/v1/purchase-orders')
  const rows = mapPOsToRows(data)

  if (loading) return <LoadingState message="Loading purchase orders..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <div>
      <PageHeader title="Purchase Orders" description="Manage purchase orders and receive goods">
        <Link href="/app/purchases/create">
          <Button><Plus className="h-4 w-4 mr-2" />New Purchase Order</Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={rows}
            searchKey="poNumber"
            searchPlaceholder="Search by PO number, supplier..."
            filters={[statusFilters]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
