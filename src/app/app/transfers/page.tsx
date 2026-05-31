'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

interface TransferItem {
  id: string
  transferNumber: string
  fromWarehouse: string
  toWarehouse: string
  status: string
  items: number
  createdAt: string
}

const mockTransfers: TransferItem[] = [
  { id: '1', transferNumber: 'TRF-2026-0001', fromWarehouse: 'Gudang Utama', toWarehouse: 'Gudang Surabaya', status: 'RECEIVED', items: 50, createdAt: new Date().toISOString() },
  { id: '2', transferNumber: 'TRF-2026-0002', fromWarehouse: 'Gudang Jakarta', toWarehouse: 'Gudang Utama', status: 'IN_TRANSIT', items: 25, createdAt: new Date().toISOString() },
]

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
  DRAFT: 'default',
  IN_TRANSIT: 'warning',
  RECEIVED: 'success',
  CANCELLED: 'warning',
}

const columns: ColumnDef<TransferItem>[] = [
  { accessorKey: 'transferNumber', header: 'Transfer #' },
  { accessorKey: 'fromWarehouse', header: 'From' },
  { accessorKey: 'toWarehouse', header: 'To' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant={statusVariant[row.getValue('status') as keyof typeof statusVariant] ?? 'default'}>{row.getValue('status')}</Badge>,
  },
  { accessorKey: 'items', header: 'Items' },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  { id: 'actions', cell: () => <Button variant="ghost" size="sm">View</Button> },
]

export default function TransfersPage() {
  return (
    <div>
      <PageHeader title="Stock Transfers" description="Manage inter-warehouse transfers">
        <Button><Plus className="h-4 w-4 mr-2" />New Transfer</Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={mockTransfers} />
        </CardContent>
      </Card>
    </div>
  )
}
