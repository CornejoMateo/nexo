"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import type { Sale, SaleItem, PaymentMethod } from "@/lib/types"
import { toast } from "sonner"
import { Plus, Minus, X, ShoppingCart } from "lucide-react"

interface SaleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaleFormDialog({ open, onOpenChange }: SaleFormDialogProps) {
  const { products, addSale, exchangeRate, currentUser } = useStore()
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([])
  const [priceType, setPriceType] = useState<"wholesale" | "retail">("retail")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [notes, setNotes] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const availableProducts = products.filter(
    (p) =>
      p.stockQuantity > 0 &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.imei?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const addItem = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const existingItem = selectedItems.find((item) => item.productId === productId)
    const currentQty = existingItem?.quantity || 0

    if (currentQty >= product.stockQuantity) {
      toast.error("No hay suficiente stock disponible")
      return
    }

    const price = priceType === "wholesale" ? product.wholesalePriceUSD : product.retailPriceUSD

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                priceUSD: price * (item.quantity + 1),
                priceARS: price * (item.quantity + 1) * exchangeRate.rate,
              }
            : item
        )
      )
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId,
          productName: product.name,
          quantity: 1,
          priceUSD: price,
          priceARS: price * exchangeRate.rate,
        },
      ])
    }
  }

  const updateItemQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setSelectedItems(
      selectedItems
        .map((item) => {
          if (item.productId !== productId) return item
          const newQty = item.quantity + delta
          if (newQty <= 0) return null
          if (newQty > product.stockQuantity) {
            toast.error("No hay suficiente stock disponible")
            return item
          }
          const unitPrice =
            priceType === "wholesale" ? product.wholesalePriceUSD : product.retailPriceUSD
          return {
            ...item,
            quantity: newQty,
            priceUSD: unitPrice * newQty,
            priceARS: unitPrice * newQty * exchangeRate.rate,
          }
        })
        .filter(Boolean) as SaleItem[]
    )
  }

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.productId !== productId))
  }

  const totalUSD = selectedItems.reduce((sum, item) => sum + item.priceUSD, 0)
  const totalARS = totalUSD * exchangeRate.rate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      toast.error("Agrega al menos un producto a la venta")
      return
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      products: selectedItems,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      paymentMethod,
      priceType,
      totalUSD,
      totalARS,
      exchangeRateUsed: exchangeRate.rate,
      notes: notes || undefined,
      createdAt: new Date(),
      createdBy: currentUser?.name || "Admin",
    }

    addSale(newSale)
    toast.success("Venta registrada correctamente")
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedItems([])
    setCustomerName("")
    setCustomerPhone("")
    setCustomerEmail("")
    setPaymentMethod("cash")
    setNotes("")
    setSearchQuery("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>Registra una nueva venta de productos</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Price Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={priceType === "retail" ? "default" : "outline"}
              onClick={() => setPriceType("retail")}
              className="flex-1"
            >
              Minorista
            </Button>
            <Button
              type="button"
              variant={priceType === "wholesale" ? "default" : "outline"}
              onClick={() => setPriceType("wholesale")}
              className="flex-1"
            >
              Mayorista
            </Button>
          </div>

          {/* Product Search */}
          <div className="space-y-2">
            <Label>Agregar Productos</Label>
            <Input
              placeholder="Buscar por nombre, IMEI, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                {availableProducts.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No se encontraron productos
                  </p>
                ) : (
                  availableProducts.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addItem(product.id)}
                      className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {product.stockQuantity} | $
                          {priceType === "wholesale"
                            ? product.wholesalePriceUSD
                            : product.retailPriceUSD}{" "}
                          USD
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <Label>Productos Seleccionados</Label>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <Card key={item.productId}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          ${(item.priceUSD / item.quantity).toLocaleString()} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-lg border border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(item.productId, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateItemQuantity(item.productId, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="w-24 text-right font-semibold text-foreground">
                          ${item.priceUSD.toLocaleString()}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre del Cliente</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Perez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefono</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Metodo de Pago</Label>
            <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="mercadopago">MercadoPago</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          {/* Total */}
          <Card className="bg-accent/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total a Pagar</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${totalUSD.toLocaleString()} USD
                  </p>
                  <p className="text-lg text-muted-foreground">
                    ${totalARS.toLocaleString()} ARS
                  </p>
                </div>
                <Badge variant="outline" className="text-sm">
                  {priceType === "retail" ? "Minorista" : "Mayorista"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={selectedItems.length === 0} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Registrar Venta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
