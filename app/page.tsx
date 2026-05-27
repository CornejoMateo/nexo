"use client"

import { AppShell } from "@/components/layout"
import {
  StatsCard,
  StockChart,
  LowStockAlert,
  RecentSales,
  RecentProducts,
  ExchangeRateWidget,
} from "@/components/dashboard"
import { useStore } from "@/lib/store"
import { Package, DollarSign, ShoppingCart, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  const { products, sales, getTotalInventoryValue, getLowStockProducts, exchangeRate } = useStore()

  const totalInventoryValue = getTotalInventoryValue()
  const lowStockCount = getLowStockProducts().length
  const totalProducts = products.reduce((sum, p) => sum + p.stockQuantity, 0)

  // Calculate today's sales
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaySales = sales.filter((s) => new Date(s.createdAt) >= today)
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.totalUSD, 0)

  // Calculate this month's sales
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthSales = sales.filter((s) => new Date(s.createdAt) >= monthStart)
  const monthSalesTotal = monthSales.reduce((sum, s) => sum + s.totalUSD, 0)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Panel</h1>
          <p className="mt-1 text-muted-foreground">
            Resumen de tu inventario y ventas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Valor del Inventario"
            value={`$${totalInventoryValue.toLocaleString()}`}
            subtitle={`$${(totalInventoryValue * exchangeRate.rate).toLocaleString()} ARS`}
            icon={DollarSign}
          />
          <StatsCard
            title="Productos en Stock"
            value={totalProducts}
            subtitle={`${products.length} productos distintos`}
            icon={Package}
          />
          <StatsCard
            title="Stock Bajo"
            value={lowStockCount}
            subtitle="Productos a reponer"
            icon={AlertTriangle}
            className={lowStockCount > 0 ? "border-warning/50" : ""}
          />
        </div>

        {/* Exchange Rate Widget */}
        <ExchangeRateWidget />

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <StockChart />
        </div>

        {/* Bottom Widgets */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LowStockAlert />
          <RecentSales />
          <RecentProducts />
        </div>
      </div>
    </AppShell>
  )
}
