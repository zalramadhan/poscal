'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { FileBarChart, TrendingUp, Package, ShoppingCart, Wallet } from 'lucide-react'

const reportCategories = [
  {
    title: 'Sales Report',
    description: 'Sales trends, revenue analysis, and payment summaries',
    icon: TrendingUp,
    href: '/app/reports/sales',
    color: 'text-primary bg-primary/10',
  },
  {
    title: 'Inventory Report',
    description: 'Stock levels, movement history, and low stock alerts',
    icon: Package,
    href: '/app/reports/inventory',
    color: 'text-success bg-success/10',
  },
  {
    title: 'Purchase Report',
    description: 'Purchase order history and supplier performance',
    icon: ShoppingCart,
    href: '/app/reports/purchases',
    color: 'text-warning bg-warning/10',
  },
  {
    title: 'Finance Report',
    description: 'Income, expenses, and cash flow overview',
    icon: Wallet,
    href: '/app/reports/finance',
    color: 'text-info bg-info/10',
  },
]

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Business insights and analytics" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
