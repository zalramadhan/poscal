'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, LoadingState, ErrorState } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, Award, Star, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useFetch } from '@/hooks'
import type { Customer } from '@/types'

const tierBadge: Record<string, 'default' | 'warning' | 'info'> = {
  platinum: 'default',
  gold: 'warning',
  silver: 'info',
  bronze: 'info',
}

const tierIcon: Record<string, React.ElementType> = {
  platinum: Award,
  gold: Star,
  silver: Star,
  bronze: Star,
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: customer, loading, error, refetch } = useFetch<Customer>(`/api/v1/customers/${id}`)

  if (loading) return <LoadingState message="Loading customer..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />
  if (!customer) return <ErrorState title="Not Found" message="Customer not found" onRetry={() => router.refresh()} />

  const TierIcon = tierIcon[customer.tier] || Star
  const totalSales = (customer as any)._count?.sales || 0

  return (
    <div>
      <PageHeader title={customer.name}>
        <div className="flex items-center gap-2">
          <Link href={`/app/customers/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link href="/app/customers">
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
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{customer.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={tierBadge[customer.tier] || 'default'}>
                <TierIcon className="h-3 w-3 mr-1" />
                {customer.tier}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Star className="h-4 w-4 text-warning-500 fill-warning-500" />
              <span className="text-sm font-medium">{customer.points} points</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{customer.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
                <p className="text-lg font-bold">{totalSales}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-warning-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Loyalty Points</p>
                <p className="text-lg font-bold">{customer.points.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
