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
  const [transfers, setTransfers] = React.useState<TransferItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchTransfers()
  }, [])

  async function fetchTransfers() {
    try {
      const res = await fetch('/api/v1/stock-transfers')
      if (res.ok) {
        const data = await res.json()
        setTransfers(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Stock Transfers" description="Manage inter-warehouse transfers">
        <Button><Plus className="h-4 w-4 mr-2" />New Transfer</Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm text-muted-foreground">No transfers yet</p>
            </div>
          ) : (
            <DataTable columns={columns} data={transfers} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
