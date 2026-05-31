// ──────────────────────────────────────────────────────
// POS AI - Navigation Items
// ──────────────────────────────────────────────────────

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PackageSearch,
  Users,
  Truck,
  Warehouse,
  FileBarChart,
  Wallet,
  Settings,
  UserCog,
  Building2,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
  children?: NavItem[]
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'POS',
    href: '/app/pos',
    icon: ShoppingCart,
    children: [
      { title: 'New Sale', href: '/app/pos', icon: ShoppingCart },
      { title: 'Sales History', href: '/app/pos/history', icon: ShoppingCart },
    ],
  },
  {
    title: 'Products',
    href: '/app/products',
    icon: Package,
  },
  {
    title: 'Inventory',
    href: '/app/inventory',
    icon: PackageSearch,
    children: [
      { title: 'Overview', href: '/app/inventory', icon: PackageSearch },
      { title: 'Stock In', href: '/app/inventory/stock-in', icon: PackageSearch },
      { title: 'Stock Out', href: '/app/inventory/stock-out', icon: PackageSearch },
      { title: 'Adjustment', href: '/app/inventory/adjustment', icon: PackageSearch },
      { title: 'Opname', href: '/app/inventory/opname', icon: PackageSearch },
    ],
  },
  {
    title: 'Customers',
    href: '/app/customers',
    icon: Users,
  },
  {
    title: 'Suppliers',
    href: '/app/suppliers',
    icon: Truck,
  },
  {
    title: 'Purchases',
    href: '/app/purchases',
    icon: ShoppingCart,
  },
  {
    title: 'Warehouse',
    href: '/app/warehouses',
    icon: Warehouse,
    children: [
      { title: 'Warehouses', href: '/app/warehouses', icon: Building2 },
      { title: 'Transfers', href: '/app/transfers', icon: Warehouse },
    ],
  },
  {
    title: 'Reports',
    href: '/app/reports',
    icon: FileBarChart,
    children: [
      { title: 'Sales', href: '/app/reports/sales', icon: FileBarChart },
      { title: 'Inventory', href: '/app/reports/inventory', icon: FileBarChart },
      { title: 'Purchases', href: '/app/reports/purchases', icon: FileBarChart },
      { title: 'Finance', href: '/app/reports/finance', icon: Wallet },
    ],
  },
  {
    title: 'Finance',
    href: '/app/finance',
    icon: Wallet,
  },
  {
    title: 'Employees',
    href: '/app/employees',
    icon: UserCog,
  },
  {
    title: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
]
