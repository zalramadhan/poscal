// ──────────────────────────────────────────────────────
// POS AI - Custom API Hooks
// ──────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(url: string | null, options?: { enabled?: boolean }) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchData = useCallback(async () => {
    if (!url) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const res = await fetch(url)
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Request failed')
      setState({ data: json.data ?? json, loading: false, error: null })
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message })
    }
  }, [url])

  useEffect(() => {
    if (options?.enabled !== false) fetchData()
  }, [fetchData, options?.enabled])

  return { ...state, refetch: fetchData }
}

export function usePaginatedFetch<T>(baseUrl: string) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [state, setState] = useState<{
    data: T[]
    loading: boolean
    error: string | null
    total: number
    totalPages: number
  }>({ data: [], loading: false, error: null, total: 0, totalPages: 0 })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      const res = await fetch(`${baseUrl}?${params}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Request failed')
      setState({
        data: json.data ?? [],
        loading: false,
        error: null,
        total: json.pagination?.total ?? 0,
        totalPages: json.pagination?.totalPages ?? 0,
      })
    } catch (err: any) {
      setState((prev) => ({ ...prev, loading: false, error: err.message }))
    }
  }, [baseUrl, page, limit, search])

  useEffect(() => { fetchData() }, [fetchData])

  return { ...state, page, setPage, search, setSearch, refetch: fetchData }
}
