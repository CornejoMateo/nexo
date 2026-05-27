"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { AlertTriangle, Package, ShoppingCart, TrendingDown } from "lucide-react"

export function LowStockAlert() {
  const { getLowStockProducts } = useStore()
  const lowStockProducts = getLowStockProducts()

  if (lowStockProducts.length === 0) return null

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-warning-foreground">Stock Bajo</span>
          <Badge variant="secondary" className="ml-auto">
            {lowStockProducts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lowStockProducts.slice(0, 5).map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {product.name}
              </span>
            </div>
            <Badge variant={product.stockQuantity === 0 ? "destructive" : "secondary"}>
              {product.stockQuantity} unidades
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RecentSales() {
  const { sales, exchangeRate } = useStore()
  const recentSales = sales.slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-4 w-4 text-accent" />
          Ventas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentSales.map((sale) => (
          <div
            key={sale.id}
            className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {sale.customerName || "Cliente"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(sale.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                ${sale.totalUSD.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ${(sale.totalUSD * exchangeRate.rate).toLocaleString()} ARS
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RecentProducts() {
  const { products } = useStore()
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4 text-accent" />
          Productos Agregados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(product.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
            <Badge variant="outline">{product.stockQuantity} unidades</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
