// ──────────────────────────────────────────────────────
// POS AI - DataTable Component (TanStack Table)
// ──────────────────────────────────────────────────────

'use client'

import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface FilterConfig {
  id: string
  label: string
  placeholder?: string
  options: { label: string; value: string }[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
  loading?: boolean
  filters?: FilterConfig[]
  onSearchChange?: (value: string) => void
  searchValue?: string
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  loading = false,
  filters,
  onSearchChange,
  searchValue,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [localSearch, setLocalSearch] = React.useState('')

  const isControlled = onSearchChange !== undefined && searchValue !== undefined
  const currentSearch = isControlled ? searchValue : localSearch

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter: searchKey ? undefined : currentSearch,
    },
    initialState: {
      pagination: { pageSize },
    },
  })

  const handleSearchChange = (value: string) => {
    if (isControlled) {
      onSearchChange(value)
    } else {
      setLocalSearch(value)
      if (searchKey) {
        table.getColumn(searchKey)?.setFilterValue(value)
      }
    }
  }

  const handleFilterChange = (filterId: string, value: string) => {
    if (!value) {
      table.getColumn(filterId)?.setFilterValue(undefined)
    } else {
      table.getColumn(filterId)?.setFilterValue(value)
    }
  }

  const clearFilters = () => {
    setColumnFilters([])
    handleSearchChange('')
  }

  const hasActiveFilters = columnFilters.length > 0 || currentSearch.length > 0

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-8"
          />
          {currentSearch && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <div key={filter.id} className="min-w-[140px]">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  value={(table.getColumn(filter.id)?.getFilterValue() as string) ?? ''}
                >
                  <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                <X className="h-4 w-4 mr-1" />Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ChevronUp className="h-3 w-3" />,
                          desc: <ChevronDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ??
                          (header.column.getCanSort() && (
                            <ChevronsUpDown className="h-3 w-3 opacity-50" />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {hasActiveFilters ? 'No matching records found' : 'No data found'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                    onClick={() => onRowClick?.(row.original)}
                    style={{ cursor: onRowClick ? 'pointer' : undefined }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length > 0 && (
            <>Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} results</>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
