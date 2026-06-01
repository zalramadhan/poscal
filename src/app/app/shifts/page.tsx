'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

interface ShiftItem {
  id: string
  user: { id: string; name: string }
  branch: { id: string; name: string }
  status: 'OPEN' | 'PENDING_APPROVAL' | 'CLOSED'
  openingCash: number
  closingCash: number | null
  expectedCash: number | null
  variance: number | null
  openedAt: string
}

const statusColors = {
  OPEN: 'success',
  PENDING_APPROVAL: 'warning',
  CLOSED: 'secondary',
} as const

const columns: ColumnDef<ShiftItem>[] = [
  {
    accessorKey: 'openedAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.getValue('openedAt')),
  },
  {
    accessorKey: 'user',
    header: 'Cashier',
    cell: ({ row }) => row.original.user?.name || '-',
  },
  {
    accessorKey: 'branch',
    header: 'Branch',
    cell: ({ row }) => row.original.branch?.name || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusColors
      return <Badge variant={statusColors[status]}>{status.replace('_', ' ')}</Badge>
    },
  },
  {
    accessorKey: 'openingCash',
    header: 'Opening Cash',
    cell: ({ row }) => `$${row.original.openingCash?.toFixed(2) || '0.00'}`,
  },
  {
    accessorKey: 'closingCash',
    header: 'Closing Cash',
    cell: ({ row }) => row.original.closingCash != null ? `$${row.original.closingCash.toFixed(2)}` : '-',
  },
  {
    accessorKey: 'variance',
    header: 'Variance',
    cell: ({ row }) => {
      const variance = row.original.variance
      if (variance == null) return '-'
      const color = variance === 0 ? 'text-green-600' : 'text-red-600'
      return <span className={color}>${variance.toFixed(2)}</span>
    },
  },
]

export default function ShiftsPage() {
  const router = useRouter()
  const [shifts, setShifts] = React.useState<ShiftItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState<string>('')

  React.useEffect(() => {
    fetchShifts()
  }, [statusFilter])

  async function fetchShifts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/v1/cashier/shifts?${params.toString()}`)
      const data = await res.json()
      setShifts(data.data || [])
    } catch {
      console.error('Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }

  function handleRowClick(shift: ShiftItem) {
    router.push(`/app/shifts/${shift.id}`)
  }

  return (
    <div>
      <PageHeader title="Shifts" description="View and manage cashier shifts" />

      <div className="flex gap-2 mb-4">
        {['', 'OPEN', 'PENDING_APPROVAL', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === '' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {!loading && (
            <DataTable
              columns={columns}
              data={shifts}
              onRowClick={handleRowClick}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}