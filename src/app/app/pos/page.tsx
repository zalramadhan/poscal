'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import { LoadingState, ErrorState } from '@/components/shared/page-states'
import { formatCurrency } from '@/lib/utils'
import { useFetch } from '@/hooks'
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Check,
  X,
  DollarSign,
  CreditCard,
  Smartphone,
  Package,
  Warehouse,
} from 'lucide-react'
import { PrintDialog } from './print-dialog'
import type { Product } from '@/types'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface ProductWithStock extends Product {
  stock?: {
    balance: number
    reserved: number
    available: number
  }
  minStock?: number
  maxStock?: number
}

interface Warehouse {
  id: string
  name: string
}

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: DollarSign },
  { id: 'debit', name: 'Debit Card', icon: CreditCard },
  { id: 'qris', name: 'QRIS', icon: Smartphone },
]

export default function POSPage() {
  const router = useRouter()
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<string>('')
  const { data: warehouses } = useFetch<Warehouse[]>('/api/v1/warehouses')
  const productUrl = selectedWarehouse
    ? `/api/v1/products?includeStock=true&warehouseId=${selectedWarehouse}`
    : null
  const { data: products, loading, error, refetch } = useFetch<ProductWithStock[]>(productUrl)
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [search, setSearch] = React.useState('')
  const [selectedPayment, setSelectedPayment] = React.useState('cash')
  const [checkoutLoading, setCheckoutLoading] = React.useState(false)
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null)
  const [currentShift, setCurrentShift] = React.useState<any>(null)
  const [showStartShift, setShowStartShift] = React.useState(false)
  const [showCloseShift, setShowCloseShift] = React.useState(false)
  const [openingCash, setOpeningCash] = React.useState('')
  const [closingCash, setClosingCash] = React.useState('')
  const [printDialogOpen, setPrintDialogOpen] = React.useState(false)
  const [receiptData, setReceiptData] = React.useState<any>(null)
  const [invoiceData, setInvoiceData] = React.useState<any>(null)
  const [completedSaleId, setCompletedSaleId] = React.useState<string | null>(null)

  const userId = 'system'

  React.useEffect(() => {
    if (warehouses && warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0].id)
    }
  }, [warehouses, selectedWarehouse])

  React.useEffect(() => {
    const checkShift = async () => {
      const res = await fetch('/api/v1/cashier/shifts?current=true', {
        headers: { 'x-user-id': userId }
      })
      const data = await res.json()
      if (data.data) {
        setCurrentShift(data.data)
      } else {
        setShowStartShift(true)
      }
    }
    checkShift()
  }, [])

  const productList = Array.isArray(products) ? products : []
  const filteredProducts = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function addToCart(product: ProductWithStock) {
    if (product.stock && product.stock.available <= 0) return
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.sellingPrice), quantity: 1 }]
    })
  }

  function updateQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const handleStartShift = async () => {
    const res = await fetch('/api/v1/cashier/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ branchId: selectedWarehouse, openingCash: Number(openingCash) }),
    })
    const data = await res.json()
    if (res.ok) {
      setCurrentShift(data.data)
      setShowStartShift(false)
      setOpeningCash('')
    } else {
      alert(data.message || 'Failed to start shift')
    }
  }

  const handleCloseShift = async () => {
    const res = await fetch(`/api/v1/cashier/shifts/${currentShift.id}?action=close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ closingCash: Number(closingCash) }),
    })
    const data = await res.json()
    if (res.ok) {
      if (data.data?.status === 'PENDING_APPROVAL') {
        alert('Variance requires manager approval')
      }
      setCurrentShift(null)
      setShowCloseShift(false)
      setClosingCash('')
    } else {
      alert(data.message || 'Failed to close shift')
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return
    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const body = {
        branchId: 'default-branch',
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        payments: [
          {
            paymentMethodId: selectedPayment,
            amount: subtotal,
          },
        ],
        discount: 0,
        notes: undefined,
      }

      const res = await fetch('/api/v1/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-cashier-shift-id': currentShift?.id || '',
        },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Checkout failed')

      if (json.data?.id) {
        setCompletedSaleId(json.data.id)
        setReceiptData(json.data.receiptData)
        setInvoiceData(json.data.invoiceData)
        setPrintDialogOpen(true)
      }
      setCart([])
      router.push('/app/pos/history')
      router.refresh()
    } catch (err: any) {
      setCheckoutError(err.message)
      setCheckoutLoading(false)
    }
  }

  if (loading) return <LoadingState message="Loading products..." />
  if (error) return <ErrorState title="Error" message={error} onRetry={refetch} />

  return (
    <>
      {showStartShift && (
        <Dialog open onOpenChange={setShowStartShift}>
          <DialogContent>
            <DialogHeader>Start Your Shift</DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Opening Cash Amount</label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStartShift(false)}>Cancel</Button>
              <Button onClick={handleStartShift}>Start Shift</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showCloseShift && (
        <Dialog open onOpenChange={setShowCloseShift}>
          <DialogContent>
            <DialogHeader>Close Your Shift</DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Opening Cash:</span>
                  <span>Rp {(currentShift?.openingCash || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Expected Cash:</span>
                  <span>Rp {((currentShift?.expectedCash) || currentShift?.openingCash || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Counted Cash</label>
                <Input
                  type="number"
                  placeholder="1500000"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                />
              </div>
              {closingCash && (
                <div className="text-sm">
                  Variance: Rp {(Number(closingCash) - ((currentShift?.expectedCash) || currentShift?.openingCash || 0)).toLocaleString()}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloseShift(false)}>Cancel</Button>
              <Button onClick={handleCloseShift}>Close Shift</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="relative">
              <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer"
              >
                {!selectedWarehouse && <option value="">Select warehouse</option>}
                {warehouses?.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            {currentShift && (
              <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded">
                <span className="text-sm font-medium">SHIFT: {currentShift.status}</span>
                <Button size="sm" variant="ghost" onClick={() => setShowCloseShift(true)}>Close</Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No products match your search' : 'No products available'}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.stock && product.stock.available <= 0
                  const isLowStock = product.stock && product.minStock && product.stock.available < product.minStock && product.stock.available > 0
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`p-3 rounded-lg border bg-surface transition-all text-left flex flex-col ${
                        isOutOfStock
                          ? 'opacity-50 cursor-not-allowed border-muted'
                          : 'hover:border-primary hover:shadow-sm border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary/5 shrink-0 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary/60" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight line-clamp-2 break-words">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
                          <p className="text-sm font-semibold text-primary mt-1">
                            {formatCurrency(product.sellingPrice)}
                          </p>
                          {product.stock && (
                            <p className={`text-xs mt-1 ${isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-muted-foreground'}`}>
                              {isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${product.stock.available} left` : `${product.stock.available} available`}
                            </p>
                          )}
                        </div>
                      </div>
                      {product.category && (
                        <Badge variant="outline" className="mt-2 self-start text-[10px]">
                          {product.category.name}
                        </Badge>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col bg-surface rounded-lg border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Cart</h2>
              <Badge variant="default" className="ml-auto">
                {cart.length} items
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Cart is empty</p>
                <p className="text-xs text-muted-foreground">Click products to add them</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 rounded hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 rounded hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm font-medium w-20 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                    selectedPayment === pm.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <pm.icon className="h-4 w-4" />
                  {pm.name}
                </button>
              ))}
            </div>
          </div>

          {checkoutError && (
            <div className="px-4 py-2 text-xs text-danger bg-danger/5 border-t border-border">
              {checkoutError}
            </div>
          )}

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={cart.length === 0 || checkoutLoading}
                onClick={() => setCart([])}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={cart.length === 0 || checkoutLoading}
                onClick={handleCheckout}
              >
                {checkoutLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {printDialogOpen && completedSaleId && (
        <PrintDialog
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
          saleId={completedSaleId}
          receiptData={receiptData}
          invoiceData={invoiceData}
        />
      )}
    </>
  )
}
