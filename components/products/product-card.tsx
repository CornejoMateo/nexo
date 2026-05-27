"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { categoryLabels } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Eye,
  MoreHorizontal,
  Battery,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  BatteryCharging,
  Cable,
  Mouse,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const categoryIconMap: Record<string, React.ElementType> = {
  iphone: Smartphone,
  "used-iphone": Smartphone,
  macbook: Laptop,
  ipad: Tablet,
  airpods: Headphones,
  "apple-watch": Watch,
  chargers: BatteryCharging,
  cables: Cable,
  accessories: Mouse,
}

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { exchangeRate } = useStore()
  const Icon = categoryIconMap[product.category] || Smartphone

  const isLowStock = product.stockQuantity <= 3
  const isUsed = product.category === "used-iphone"

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {categoryLabels[product.category]}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/products/${product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="text-destructive focus:text-destructive"
                >
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {product.storageCapacity && (
              <Badge variant="secondary" className="text-xs">
                {product.storageCapacity}
              </Badge>
            )}
            {product.color && (
              <Badge variant="secondary" className="text-xs">
                {product.color}
              </Badge>
            )}
            <Badge
              variant={product.condition === "new" ? "default" : "outline"}
              className="text-xs"
            >
              {product.condition === "new" ? "Nuevo" : product.condition === "used" ? "Usado" : "Refurbished"}
            </Badge>
          </div>

          {/* Used product specific info */}
          {isUsed && product.batteryHealth && (
            <div className="flex items-center gap-2 text-sm">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Bateria:</span>
              <span
                className={cn(
                  "font-medium",
                  product.batteryHealth >= 80 ? "text-success" : "text-warning"
                )}
              >
                {product.batteryHealth}%
              </span>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stock</span>
            <Badge
              variant={isLowStock ? "destructive" : "secondary"}
              className={cn(isLowStock && "animate-pulse")}
            >
              {product.stockQuantity} unidades
            </Badge>
          </div>

          {/* Prices */}
          <div className="space-y-1 rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mayorista</span>
              <div className="text-right">
                <span className="font-medium text-foreground">
                  ${product.wholesalePriceUSD.toLocaleString()}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  (${(product.wholesalePriceUSD * exchangeRate.rate).toLocaleString()} ARS)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minorista</span>
              <div className="text-right">
                <span className="font-semibold text-accent">
                  ${product.retailPriceUSD.toLocaleString()}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  (${(product.retailPriceUSD * exchangeRate.rate).toLocaleString()} ARS)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile-friendly list view
export function ProductListItem({ product, onEdit, onDelete }: ProductCardProps) {
  const { exchangeRate } = useStore()
  const Icon = categoryIconMap[product.category] || Smartphone
  const isLowStock = product.stockQuantity <= 3

  return (
    <Link href={`/products/${product.id}`}>
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {categoryLabels[product.category]}
            </span>
            {product.storageCapacity && (
              <Badge variant="secondary" className="text-xs">
                {product.storageCapacity}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground">
            ${product.retailPriceUSD.toLocaleString()}
          </p>
          <Badge
            variant={isLowStock ? "destructive" : "outline"}
            className="mt-1 text-xs"
          >
            {product.stockQuantity} uds
          </Badge>
        </div>
      </div>
    </Link>
  )
}
