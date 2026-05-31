'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Eye } from 'lucide-react'
import { usePaginatedFetch } from '@/hooks'
import type { ColumnDef } from '@tanstack/react-table'
import type { Supplier } from '@/types'

interface SupplierRow {
  id: string
  name: string
  phone: string
  email: string
  totalPO: number
}

function mapSuppliersToRows(suppliers: Supplier[]): SupplierRow[] {
  return suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone || '-',
    email: s.email || '-',
    totalPO: 0,
  }))
}

const columns: ColumnDef<SupplierRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'totalPO', header: 'Purchase Orders' },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/app/suppliers/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />View
        </Button>
      </Link>
    ),
  },
]

export default function SuppliersPage() {
  const { data, loading, error, refetch } = usePaginatedFetch<Supplier>('/api/v1/suppliers')
  const rows = mapSuppliersToRows(data)

  if (loading) return <LoadingState message="Loading suppliers..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <div>
      <PageHeader title="Suppliers" description="Manage product suppliers">
        <Link href="/app/suppliers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
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
          />
        </CardContent>
      </Card>
    </div>
  )
}
