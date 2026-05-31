'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Check, Zap, Building2 } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For small businesses',
    features: ['Up to 1 branch', 'Up to 500 products', 'Basic reports', 'Email support'],
    current: false,
  },
  {
    name: 'Growth',
    price: 'Rp 150.000/mo',
    description: 'For growing businesses',
    features: ['Up to 5 branches', 'Up to 5000 products', 'Advanced reports', 'Priority support', 'Multi-user access'],
    current: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Unlimited branches', 'Unlimited products', 'Custom reports', '24/7 support', 'API access', 'Dedicated account manager'],
    current: false,
  },
]

export default function SubscriptionSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Subscription" description="Manage your plan and billing" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are on the Growth plan</CardDescription>
            </div>
            <Badge variant="success" className="text-sm px-3 py-1">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Plan</label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-semibold">Growth</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Billing Cycle</label>
              <span>Monthly</span>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Next Billing</label>
              <span>June 30, 2026</span>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Payment Method</label>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Visa •••• 4242</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.current ? 'border-primary shadow-md' : ''}`}>
              {plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success" className="px-3">Current Plan</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {plan.name === 'Growth' ? <Zap className="h-5 w-5 text-primary" /> : <CreditCard className="h-5 w-5" />}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <div className="text-2xl font-bold">{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    {feature}
                  </div>
                ))}
                <Button className="w-full mt-4" variant={plan.current ? 'outline' : 'default'} disabled={plan.current}>
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
