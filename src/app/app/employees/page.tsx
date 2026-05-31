'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

interface EmployeeItem {
  id: string
  name: string
  email: string
  role: string
  branch: string
  status: string
  createdAt: string
}

const mockEmployees: EmployeeItem[] = [
  { id: '1', name: 'Admin Utama', email: 'admin@pos.ai', role: 'Owner', branch: 'Cabang Pusat', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: '2', name: 'Manager', email: 'manager@pos.ai', role: 'Manager', branch: 'Cabang Pusat', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: '3', name: 'Kasir 1', email: 'kasir1@pos.ai', role: 'Cashier', branch: 'Cabang Pusat', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: '4', name: 'Warehouse Staff', email: 'warehouse@pos.ai', role: 'Warehouse Staff', branch: 'Cabang Pusat', status: 'ACTIVE', createdAt: new Date().toISOString() },
]

const columns: ColumnDef<EmployeeItem>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <Badge variant="default">{row.getValue('role')}</Badge>,
  },
  { accessorKey: 'branch', header: 'Branch' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'ACTIVE' ? 'success' : 'outline'}>
        {row.getValue('status')}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    id: 'actions',
    cell: () => <Button variant="ghost" size="sm">Edit</Button>,
  },
]

export default function EmployeesPage() {
  return (
    <div>
      <PageHeader title="Employees" description="Manage users and their roles">
        <Button><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns} data={mockEmployees} searchKey="name" searchPlaceholder="Search employees..." />
        </CardContent>
      </Card>
    </div>
  )
}
