'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useFetch } from '@/hooks'
import { Warehouse, Building2, Package, Plus, Eye, Search, X } from 'lucide-react'
import type { Warehouse as WarehouseType } from '@/types'

export default function WarehousesPage() {
  const { data: warehouses, loading, error, refetch } = useFetch<WarehouseType[]>('/api/v1/warehouses')
  const list = Array.isArray(warehouses) ? warehouses : []

  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('')

  const filtered = list.filter((wh) => {
    const matchesSearch = !search ||
      wh.name.toLowerCase().includes(search.toLowerCase()) ||
      wh.code.toLowerCase().includes(search.toLowerCase()) ||
      wh.branch?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && wh.isActive) ||
      (statusFilter === 'inactive' && !wh.isActive)
    return matchesSearch && matchesStatus
  })

  if (loading) return <LoadingState message="Loading warehouses..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <div>
      <PageHeader title="Warehouses" description="Manage warehouses">
        <div className="flex gap-2">
          <Link href="/app/transfers"><Button variant="outline">Stock Transfers</Button></Link>
          <Link href="/app/warehouses/create">
            <Button><Plus className="h-4 w-4 mr-2" />Add Warehouse</Button>
          </Link>
        </div>
      </PageHeader>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          className="h-10 rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[140px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('') }} className="h-10">
            <X className="h-4 w-4 mr-1" />Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Warehouse className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">
              {search || statusFilter ? 'No warehouses match your filters' : 'No warehouses yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter ? 'Try adjusting your search or filters' : 'Add your first warehouse to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((wh) => (
            <Link key={wh.id} href={`/app/warehouses/${wh.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Warehouse className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={wh.isActive ? 'success' : 'outline'}>
                      {wh.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{wh.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{wh.code}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Building2 className="h-3 w-3" />
                    {wh.branch?.name || '-'}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">View details</span>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
