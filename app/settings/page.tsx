"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  DollarSign,
  Moon,
  Sun,
  User,
  Shield,
  Bell,
  Database,
  RefreshCw,
  Save,
  Users,
  Activity,
} from "lucide-react"

export default function SettingsPage() {
  const {
    exchangeRate,
    setExchangeRate,
    currentUser,
    users,
    isDarkMode,
    toggleDarkMode,
    products,
    sales,
    inventoryMovements,
  } = useStore()

  const [newRate, setNewRate] = useState(exchangeRate.rate.toString())
  const [isEditingRate, setIsEditingRate] = useState(false)

  const handleUpdateRate = () => {
    const rate = parseFloat(newRate)
    if (!isNaN(rate) && rate > 0) {
      setExchangeRate(rate, currentUser?.name || "Admin")
      setIsEditingRate(false)
      toast.success("Tipo de cambio actualizado")
    } else {
      toast.error("Ingresa un valor valido")
    }
  }

  // Calculate stats
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.purchasePriceUSD * p.stockQuantity,
    0
  )
  const totalRetailValue = products.reduce(
    (sum, p) => sum + p.retailPriceUSD * p.stockQuantity,
    0
  )

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Configuracion</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona la configuracion de tu tienda
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Exchange Rate Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Tipo de Cambio
              </CardTitle>
              <CardDescription>
                Configura el tipo de cambio USD/ARS para los precios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de cambio actual</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${exchangeRate.rate.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Actualizado{" "}
                    {format(new Date(exchangeRate.updatedAt), "PPp", { locale: es })} por{" "}
                    {exchangeRate.updatedBy}
                  </p>
                </div>
              </div>

              {isEditingRate ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="newRate">Nuevo tipo de cambio (ARS por USD)</Label>
                    <Input
                      id="newRate"
                      type="number"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      placeholder="1150"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateRate} className="gap-2">
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewRate(exchangeRate.rate.toString())
                        setIsEditingRate(false)
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingRate(true)}
                  className="w-full gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar Tipo de Cambio
                </Button>
              )}

              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">
                  El tipo de cambio se aplica automaticamente a todos los precios en ARS.
                  Los precios en USD permanecen sin cambios.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-accent" />
                ) : (
                  <Sun className="h-5 w-5 text-accent" />
                )}
                Apariencia
              </CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicacion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Modo Oscuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa el tema oscuro para reducir la fatiga visual
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir alertas de stock bajo
                  </p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Perfil de Usuario
              </CardTitle>
              <CardDescription>Tu informacion de cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser && (
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <span className="text-xl font-bold">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{currentUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    <Badge className="mt-1" variant={currentUser.role === "admin" ? "default" : "secondary"}>
                      {currentUser.role === "admin" ? "Administrador" : "Empleado"}
                    </Badge>
                  </div>
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electronico</Label>
                <Input
                  id="email"
                  defaultValue={currentUser?.email}
                  disabled
                />
              </div>
              <Button variant="outline" className="w-full">
                Cambiar Contrasena
              </Button>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Equipo
              </CardTitle>
              <CardDescription>Usuarios con acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <span className="text-sm font-medium">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role === "admin" ? "Admin" : "Empleado"}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2">
                <User className="h-4 w-4" />
                Agregar Usuario
              </Button>
            </CardContent>
          </Card>

          {/* System Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Estadisticas del Sistema
              </CardTitle>
              <CardDescription>Resumen de datos almacenados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Productos Registrados</p>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Valor del Inventario</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${totalInventoryValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${totalRetailValue.toLocaleString()} USD valor
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-accent" />
                Gestion de Datos
              </CardTitle>
              <CardDescription>Exportar y respaldar datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  Exportar Productos
                </Button>
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  Exportar Ventas
                </Button>
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  Exportar Inventario
                </Button>
                <Button variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Crear Respaldo
                </Button>
              </div>
              <div className="mt-4 rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">
                  Los datos se exportan en formato CSV compatible con Excel.
                  Los respaldos incluyen toda la informacion del sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
