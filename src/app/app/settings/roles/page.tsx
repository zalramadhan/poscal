'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-states'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Shield, UserCog, Users } from 'lucide-react'
import Link from 'next/link'

const roles = [
  { name: 'Owner', users: 1, permissions: 'All permissions', badge: 'default' },
  { name: 'Manager', users: 1, permissions: 'View, Create, Edit', badge: 'secondary' },
  { name: 'Cashier', users: 1, permissions: 'Sales, Customers, Products', badge: 'outline' },
  { name: 'Warehouse Staff', users: 1, permissions: 'Inventory, Purchases, Transfers', badge: 'outline' },
]

const users = [
  { name: 'Owner', email: 'owner@demo.com', role: 'Owner', status: 'Active' },
  { name: 'Manager', email: 'manager@demo.com', role: 'Manager', status: 'Active' },
  { name: 'Cashier', email: 'cashier@demo.com', role: 'Cashier', status: 'Active' },
  { name: 'Warehouse Staff', email: 'warehouse@demo.com', role: 'Warehouse Staff', status: 'Active' },
]

export default function RolesSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <PageHeader title="Users & Roles" description="Manage user permissions and roles" />
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Roles</CardTitle>
          </div>
          <CardDescription>Define role-based access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {roles.map((role) => (
              <div key={role.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-muted-foreground">{role.permissions}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{role.users} user(s)</span>
                  <Badge variant={role.badge as any}>{role.name}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <CardTitle>Users</CardTitle>
          </div>
          <CardDescription>Manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.email} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge variant="success">{user.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
