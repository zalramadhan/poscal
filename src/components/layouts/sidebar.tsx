// ──────────────────────────────────────────────────────
// POS AI - Sidebar Navigation
// ──────────────────────────────────────────────────────

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mainNavItems, type NavItem } from '@/constants/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'

function NavItemComponent({
  item,
  isCollapsed,
  depth = 0,
}: {
  item: NavItem
  isCollapsed: boolean
  depth?: number
}) {
  const pathname = usePathname()
  const [expanded, setExpanded] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

  React.useEffect(() => {
    if (isActive && hasChildren) {
      setExpanded(true)
    }
  }, [isActive, hasChildren])

  if (isCollapsed && depth === 0) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        title={item.title}
      >
        <item.icon className="h-5 w-5" />
      </Link>
    )
  }

  return (
    <div>
      <Link
        href={item.href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault()
            setExpanded(!expanded)
          }
        }}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive && !hasChildren
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        style={{ paddingLeft: depth > 0 ? `${depth * 16 + 12}px` : '12px' }}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate">{item.title}</span>
        {hasChildren && (
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expanded && 'rotate-180',
            )}
          />
        )}
      </Link>
      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ml-8',
                pathname === child.href
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <child.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{child.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-surface border border-border shadow-sm"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full bg-surface border-r border-border flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          {collapsed ? (
            <Link href="/app/dashboard" className="text-xl font-bold text-primary mx-auto">
              P
            </Link>
          ) : (
            <Link href="/app/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">POS AI</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {mainNavItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              isCollapsed={collapsed}
            />
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>
      </aside>
    </>
  )
}
