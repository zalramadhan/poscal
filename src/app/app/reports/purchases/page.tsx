'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function PurchaseReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Purchase Report" description="Purchase analytics and supplier data">
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total POs</p>
            <p className="text-2xl font-semibold mt-1">23</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Spend</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(89300000)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Avg PO Value</p>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(3882609)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Purchase chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
