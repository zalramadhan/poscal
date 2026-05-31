// ──────────────────────────────────────────────────────
// POS AI - App Layout
// ──────────────────────────────────────────────────────

'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          'lg:ml-60',
          sidebarCollapsed && 'lg:ml-16',
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-end h-full px-6 gap-4">
            {/* User menu placeholder */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Owner</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
