"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout"
import { useStore } from "@/lib/store"
import { categoryLabels } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Battery,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  BatteryCharging,
  Cable,
  Mouse,
  Package,
  DollarSign,
  Hash,
  Palette,
  HardDrive,
  User,
  FileText,
  ShieldCheck,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params)
  const { getProductById, exchangeRate } = useStore()
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  const Icon = categoryIconMap[product.category] || Smartphone
  const isUsed = product.category === "used-iphone"
  const isLowStock = product.stockQuantity <= 3

  const profitMarginWholesale = (
    ((product.wholesalePriceUSD - product.purchasePriceUSD) / product.purchasePriceUSD) *
    100
  ).toFixed(1)
  const profitMarginRetail = (
    ((product.retailPriceUSD - product.purchasePriceUSD) / product.purchasePriceUSD) *
    100
  ).toFixed(1)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Link href="/products">
              <Button variant="outline" size="icon" className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  {product.name}
                </h1>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{categoryLabels[product.category]}</Badge>
                <Badge
                  variant={product.condition === "new" ? "default" : "secondary"}
                >
                  {product.condition === "new"
                    ? "Nuevo"
                    : product.condition === "used"
                    ? "Usado"
                    : "Refurbished"}
                </Badge>
                {isLowStock && (
                  <Badge variant="destructive" className="animate-pulse">
                    Stock Bajo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product Image Placeholder */}
            <Card>
              <CardContent className="flex aspect-video items-center justify-center bg-secondary/30 p-8">
                <Icon className="h-24 w-24 text-muted-foreground/50" />
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Detalles del Producto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Numero de Serie</p>
                      <p className="font-mono font-medium text-foreground">
                        {product.serialNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  {product.imei && (
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">IMEI</p>
                        <p className="font-mono font-medium text-foreground">{product.imei}</p>
                      </div>
                    </div>
                  )}

                  {product.storageCapacity && (
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Almacenamiento</p>
                        <p className="font-medium text-foreground">{product.storageCapacity}</p>
                      </div>
                    </div>
                  )}

                  {product.color && (
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                      <Palette className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Color</p>
                        <p className="font-medium text-foreground">{product.color}</p>
                      </div>
                    </div>
                  )}

                  {product.supplier && (
                    <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Proveedor</p>
                        <p className="font-medium text-foreground">{product.supplier}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Marca</p>
                      <p className="font-medium text-foreground">{product.brand}</p>
                    </div>
                  </div>
                </div>

                {product.notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Notas</p>
                        <p className="mt-1 text-sm text-foreground">{product.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Used Product Info */}
            {isUsed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-accent" />
                    Informacion de Producto Usado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {product.batteryHealth !== undefined && (
                      <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                        <Battery className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Salud de Bateria</p>
                          <p
                            className={cn(
                              "text-lg font-bold",
                              product.batteryHealth >= 80 ? "text-success" : "text-warning"
                            )}
                          >
                            {product.batteryHealth}%
                          </p>
                        </div>
                      </div>
                    )}

                    {product.cosmeticCondition && (
                      <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Condicion Cosmetica</p>
                          <p className="font-medium capitalize text-foreground">
                            {product.cosmeticCondition === "excellent"
                              ? "Excelente"
                              : product.cosmeticCondition === "good"
                              ? "Bueno"
                              : product.cosmeticCondition === "fair"
                              ? "Regular"
                              : "Malo"}
                          </p>
                        </div>
                      </div>
                    )}

                    {product.carrierStatus && (
                      <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Estado de Operador</p>
                          <p className="font-medium text-foreground">
                            {product.carrierStatus === "unlocked"
                              ? "Liberado"
                              : product.carrierStatus === "locked"
                              ? "Bloqueado"
                              : "Desconocido"}
                          </p>
                        </div>
                      </div>
                    )}

                    {product.accessoriesIncluded && product.accessoriesIncluded.length > 0 && (
                      <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3 sm:col-span-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Accesorios Incluidos</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {product.accessoriesIncluded.map((acc, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {acc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {product.repairNotes && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-start gap-3">
                        <Wrench className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Notas de Reparacion</p>
                          <p className="mt-1 text-sm text-foreground">{product.repairNotes}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock Card */}
            <Card className={cn(isLowStock && "border-destructive/50")}>
              <CardHeader>
                <CardTitle className="text-base">Stock Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      isLowStock ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {product.stockQuantity}
                  </span>
                  <span className="text-muted-foreground">unidades</span>
                </div>
                {isLowStock && (
                  <p className="mt-2 text-sm text-destructive">
                    Stock bajo - considerar reposicion
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-accent" />
                  Precios
                </CardTitle>
                <CardDescription>
                  Tipo de cambio: ${exchangeRate.rate.toLocaleString()} ARS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">Precio de Compra</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${product.purchasePriceUSD.toLocaleString()} USD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${(product.purchasePriceUSD * exchangeRate.rate).toLocaleString()} ARS
                  </p>
                </div>

                <div className="rounded-lg bg-secondary/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Precio Mayorista</p>
                    <Badge variant="outline" className="text-xs text-success">
                      +{profitMarginWholesale}%
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    ${product.wholesalePriceUSD.toLocaleString()} USD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${(product.wholesalePriceUSD * exchangeRate.rate).toLocaleString()} ARS
                  </p>
                </div>

                <div className="rounded-lg bg-accent/10 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Precio Minorista</p>
                    <Badge variant="outline" className="text-xs text-success">
                      +{profitMarginRetail}%
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-accent">
                    ${product.retailPriceUSD.toLocaleString()} USD
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${(product.retailPriceUSD * exchangeRate.rate).toLocaleString()} ARS
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones Rapidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default">
                  Registrar Venta
                </Button>
                <Button className="w-full" variant="outline">
                  Ajustar Stock
                </Button>
                <Button className="w-full" variant="outline">
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
