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
import { useStore } from "@/lib/store"
import { categoryLabels } from "@/lib/mock-data"
import type { Product, ProductCategory, ProductCondition, CosmeticCondition, CarrierStatus } from "@/lib/types"
import { toast } from "sonner"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

const defaultProduct: Partial<Product> = {
  name: "",
  category: "iphone",
  brand: "Apple",
  condition: "new",
  storageCapacity: "",
  color: "",
  serialNumber: "",
  imei: "",
  stockQuantity: 1,
  purchasePriceUSD: 0,
  wholesalePriceUSD: 0,
  retailPriceUSD: 0,
  supplier: "",
  notes: "",
  images: [],
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { addProduct, updateProduct } = useStore()
  const [formData, setFormData] = useState<Partial<Product>>(product || defaultProduct)
  const isEditing = !!product

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    if (isEditing && product) {
      updateProduct(product.id, formData)
      toast.success("Producto actualizado correctamente")
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        images: formData.images || [],
      } as Product
      addProduct(newProduct)
      toast.success("Producto agregado correctamente")
    }

    onOpenChange(false)
    setFormData(defaultProduct)
  }

  const isUsedCategory = formData.category === "used-iphone"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del producto"
              : "Completa los datos para agregar un nuevo producto"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="iPhone 15 Pro Max"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ProductCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condicion *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: ProductCondition) =>
                  setFormData({ ...formData, condition: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar condicion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="used">Usado</SelectItem>
                  <SelectItem value="refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage">Almacenamiento</Label>
              <Select
                value={formData.storageCapacity || ""}
                onValueChange={(value) => setFormData({ ...formData, storageCapacity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64GB">64GB</SelectItem>
                  <SelectItem value="128GB">128GB</SelectItem>
                  <SelectItem value="256GB">256GB</SelectItem>
                  <SelectItem value="512GB">512GB</SelectItem>
                  <SelectItem value="1TB">1TB</SelectItem>
                  <SelectItem value="2TB">2TB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color || ""}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Natural Titanium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial">Numero de Serie</Label>
              <Input
                id="serial"
                value={formData.serialNumber || ""}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="DNQXH1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imei">IMEI</Label>
              <Input
                id="imei"
                value={formData.imei || ""}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                placeholder="353912110123456"
              />
            </div>
          </div>

          {/* Used Product Fields */}
          {isUsedCategory && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <h4 className="font-medium text-foreground">Informacion de Producto Usado</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="battery">Salud de Bateria (%)</Label>
                  <Input
                    id="battery"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.batteryHealth || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, batteryHealth: parseInt(e.target.value) || 0 })
                    }
                    placeholder="85"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cosmetic">Condicion Cosmetica</Label>
                  <Select
                    value={formData.cosmeticCondition || ""}
                    onValueChange={(value: CosmeticCondition) =>
                      setFormData({ ...formData, cosmeticCondition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Bueno</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Malo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrier">Estado de Operador</Label>
                  <Select
                    value={formData.carrierStatus || ""}
                    onValueChange={(value: CarrierStatus) =>
                      setFormData({ ...formData, carrierStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlocked">Liberado</SelectItem>
                      <SelectItem value="locked">Bloqueado</SelectItem>
                      <SelectItem value="unknown">Desconocido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessories">Accesorios Incluidos</Label>
                  <Input
                    id="accessories"
                    value={formData.accessoriesIncluded?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accessoriesIncluded: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    placeholder="Caja, Cargador, Cable"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="repair">Notas de Reparacion</Label>
                  <Textarea
                    id="repair"
                    value={formData.repairNotes || ""}
                    onChange={(e) => setFormData({ ...formData, repairNotes: e.target.value })}
                    placeholder="Historial de reparaciones..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stock & Pricing */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Stock y Precios</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Cantidad en Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier || ""}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Apple Official"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase">Precio de Compra (USD) *</Label>
                <Input
                  id="purchase"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.purchasePriceUSD}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePriceUSD: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wholesale">Precio Mayorista (USD) *</Label>
                <Input
                  id="wholesale"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.wholesalePriceUSD}
                  onChange={(e) =>
                    setFormData({ ...formData, wholesalePriceUSD: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="retail">Precio Minorista (USD) *</Label>
                <Input
                  id="retail"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.retailPriceUSD}
                  onChange={(e) =>
                    setFormData({ ...formData, retailPriceUSD: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre el producto..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? "Guardar Cambios" : "Agregar Producto"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
