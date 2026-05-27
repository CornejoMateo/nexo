"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Sale } from "@/lib/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  CircleDollarSign,
  ChevronRight,
} from "lucide-react"

const paymentMethodIcons: Record<string, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Building2,
  mercadopago: Smartphone,
  other: CircleDollarSign,
}

const paymentMethodLabels: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  mercadopago: "MercadoPago",
  other: "Otro",
}

interface SaleCardProps {
  sale: Sale
  onClick?: () => void
}

export function SaleCard({ sale, onClick }: SaleCardProps) {
  const PaymentIcon = paymentMethodIcons[sale.paymentMethod] || CircleDollarSign

  return (
    <Card
      className="cursor-pointer transition-all hover:bg-secondary/30"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-foreground">
                {sale.customerName || "Cliente Anonimo"}
              </p>
              <Badge variant={sale.priceType === "retail" ? "default" : "secondary"}>
                {sale.priceType === "retail" ? "Minorista" : "Mayorista"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{format(new Date(sale.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}</span>
              <span className="flex items-center gap-1">
                <PaymentIcon className="h-3.5 w-3.5" />
                {paymentMethodLabels[sale.paymentMethod]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {sale.products.length} producto{sale.products.length !== 1 ? "s" : ""} |{" "}
                {sale.products.reduce((sum, p) => sum + p.quantity, 0)} unidad
                {sale.products.reduce((sum, p) => sum + p.quantity, 0) !== 1 ? "es" : ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                ${sale.totalUSD.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                ${sale.totalARS.toLocaleString()} ARS
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Table row for desktop
export function SaleTableRow({ sale, onClick }: SaleCardProps) {
  const PaymentIcon = paymentMethodIcons[sale.paymentMethod] || CircleDollarSign

  return (
    <tr
      className="cursor-pointer border-b border-border transition-colors hover:bg-secondary/30"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{sale.customerName || "Cliente Anonimo"}</p>
        <p className="text-sm text-muted-foreground">{sale.createdBy}</p>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PaymentIcon className="h-4 w-4" />
          {paymentMethodLabels[sale.paymentMethod]}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={sale.priceType === "retail" ? "default" : "secondary"}>
          {sale.priceType === "retail" ? "Minorista" : "Mayorista"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-center text-sm">
        {sale.products.reduce((sum, p) => sum + p.quantity, 0)}
      </td>
      <td className="px-4 py-3 text-right">
        <p className="font-semibold text-foreground">${sale.totalUSD.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">${sale.totalARS.toLocaleString()} ARS</p>
      </td>
    </tr>
  )
}
