'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader, LoadingState, EmptyState, ErrorState } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Package, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { usePaginatedFetch } from '@/hooks'
import type { ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types'

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => {
      const image = row.getValue('image') as string | null | undefined
      return image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-10 w-10 rounded-md object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      )
    },
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'category.name',
    header: 'Category',
  },
  {
    accessorKey: 'sellingPrice',
    header: 'Selling Price',
    cell: ({ row }) => formatCurrency(row.getValue('sellingPrice')),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('isActive') ? 'success' : 'outline'}>
        {row.getValue('isActive') ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link href={`/app/products/${row.original.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.original.id, row.original.name)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ),
  },
]

function handleDelete(id: string, name: string) {
  if (!confirm(`Delete product "${name}"?`)) return

  fetch(`/api/v1/products/${id}`, { method: 'DELETE' })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to delete')
      window.location.reload()
    })
    .catch(() => alert('Failed to delete product'))
}

export default function ProductsPage() {
  const router = useRouter()
  const { data, loading, error, refetch } = usePaginatedFetch<Product>('/api/v1/products')

  if (loading) return <LoadingState />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
      >
        <Link href="/app/products/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Get started by adding your first product."
              action={{ label: 'Add Product', onClick: () => router.push('/app/products/create') }}
            />
          ) : (
            <DataTable
              columns={columns}
              data={data}
              searchKey="name"
              searchPlaceholder="Search products..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
