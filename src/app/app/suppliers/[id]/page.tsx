'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText, Calendar, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useFetch } from '@/hooks'
import type { Supplier } from '@/types'

export default function SupplierDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: supplier, loading, error, refetch } = useFetch<Supplier>(`/api/v1/suppliers/${id}`)

  if (loading) return <LoadingState message="Loading supplier..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />
  if (!supplier) return <ErrorState title="Not Found" message="Supplier not found" onRetry={() => router.refresh()} />

  return (
    <div>
      <PageHeader title={supplier.name}>
        <div className="flex items-center gap-2">
          <Link href={`/app/suppliers/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href="/app/suppliers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{supplier.name}</h2>
            <p className="text-xs text-muted-foreground mt-1">Supplier</p>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{supplier.email}</p>
                </div>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{supplier.phone}</p>
                </div>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{supplier.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Purchase Orders</p>
                <p className="text-lg font-bold">-</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Added</p>
                <p className="text-sm font-medium">{formatDate(supplier.createdAt)}</p>
              </div>
            </div>
            {supplier.notes && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{supplier.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
