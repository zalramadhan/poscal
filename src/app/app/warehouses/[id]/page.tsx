'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Warehouse, Building2, MapPin, Package, Calendar, Hash } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useFetch } from '@/hooks'
import type { Warehouse as WarehouseType } from '@/types'

export default function WarehouseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: wh, loading, error, refetch } = useFetch<WarehouseType>(`/api/v1/warehouses/${id}`)

  if (loading) return <LoadingState message="Loading warehouse..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />
  if (!wh) return <ErrorState title="Not Found" message="Warehouse not found" onRetry={() => router.refresh()} />

  return (
    <div>
      <PageHeader title={wh.name}>
        <Link href="/app/warehouses">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Warehouses
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Warehouse className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{wh.name}</h2>
            <p className="text-xs text-muted-foreground mt-1">{wh.code}</p>
            <div className="mt-3">
              <Badge variant={wh.isActive ? 'success' : 'outline'}>
                {wh.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Warehouse Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Code</p>
                <p className="text-sm font-medium">{wh.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Branch</p>
                <p className="text-sm font-medium">{(wh as any).branch?.name || '-'}</p>
              </div>
            </div>
            {wh.address && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{wh.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(wh.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/app/inventory?warehouseId=${wh.id}`}>
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                View Inventory
              </Button>
            </Link>
            <Link href="/app/transfers">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Stock Transfers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
