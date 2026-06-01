'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { DataTable, type FilterConfig } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { usePaginatedFetch } from '@/hooks'
import type { ColumnDef } from '@tanstack/react-table'
import type { Customer } from '@/types'

interface CustomerRow {
  id: string
  name: string
  phone: string
  email: string
  points: number
  tier: string
  totalSales: number
}

const tierVariant: Record<string, 'default' | 'warning' | 'info'> = {
  platinum: 'default',
  gold: 'warning',
  silver: 'info',
  bronze: 'info',
}

const tierFilters: FilterConfig = {
  id: 'tier',
  label: 'Tier',
  placeholder: 'All Tiers',
  options: [
    { label: 'Bronze', value: 'bronze' },
    { label: 'Silver', value: 'silver' },
    { label: 'Gold', value: 'gold' },
    { label: 'Platinum', value: 'platinum' },
  ],
}

function DeleteButton({ id, name, onDeleted }: { id: string, name: string, onDeleted: () => void }) {
  const [deleting, setDeleting] = React.useState(false)

  async function handleDelete() {
    if (!confirm('Delete customer ' + name + '?')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/v1/customers?id=' + id, { method: 'DELETE' })
      if (res.ok) {
        onDeleted()
      } else {
        alert('Failed to delete')
      }
    } catch {
      alert('Error deleting')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
      <Trash2 className="h-4 w-4 mr-1" />{deleting ? '...' : 'Delete'}
    </Button>
  )
}

function mapCustomersToRows(customers: Customer[]): CustomerRow[] {
  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone || '-',
    email: c.email || '-',
    points: c.points,
    tier: c.tier,
    totalSales: (c as any)._count?.sales || 0,
  }))
}

const columns: ColumnDef<CustomerRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'totalSales', header: 'Sales' },
  {
    accessorKey: 'tier',
    header: 'Tier',
    cell: ({ row }) => (
      <Badge variant={tierVariant[row.getValue('tier') as keyof typeof tierVariant] ?? 'default'}>
        {row.getValue('tier')}
      </Badge>
    ),
  },
  { accessorKey: 'points', header: 'Points' },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <DeleteButton id={row.original.id} name={row.original.name} onDeleted={() => window.location.reload()} />
        <Link href={`/app/customers/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />View
          </Button>
        </Link>
      </div>
    ),
  },
]

export default function CustomersPage() {
  const { data, loading, error, refetch } = usePaginatedFetch<Customer>('/api/v1/customers')
  const rows = mapCustomersToRows(data)

  if (loading) return <LoadingState message="Loading customers..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <div>
      <PageHeader title="Customers" description="Manage your customers">
        <Link href="/app/customers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={rows}
            searchKey="name"
            searchPlaceholder="Search by name, phone, email..."
            filters={[tierFilters]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
