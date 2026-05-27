"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { DollarSign, RefreshCw } from "lucide-react"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function ExchangeRateWidget() {
  const { exchangeRate, setExchangeRate, currentUser } = useStore()
  const [newRate, setNewRate] = useState(exchangeRate.rate.toString())
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdateRate = () => {
    const rate = parseFloat(newRate)
    if (!isNaN(rate) && rate > 0) {
      setExchangeRate(rate, currentUser?.name || "Admin")
      setIsEditing(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-accent/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-accent" />
          Tipo de Cambio USD/ARS
        </CardTitle>
        <CardDescription>
          Actualizado{" "}
          {formatDistanceToNow(new Date(exchangeRate.updatedAt), {
            addSuffix: true,
            locale: es,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-muted-foreground">$1 =</span>
                <Input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="h-10 w-32 text-lg font-bold"
                />
                <span className="text-lg font-medium text-muted-foreground">ARS</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ${exchangeRate.rate.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground">ARS</span>
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdateRate}>
                Guardar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewRate(exchangeRate.rate.toString())
                  setIsEditing(false)
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Por: {exchangeRate.updatedBy}
        </p>
      </CardContent>
    </Card>
  )
}
