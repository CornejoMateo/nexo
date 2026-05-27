"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/layout"
import { ProductCard, ProductListItem, ProductFilters, ProductFormDialog } from "@/components/products"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import type { Product } from "@/lib/types"
import { Plus, LayoutGrid, List, Package } from "lucide-react"

type ProductsPageClientProps = {
  initialCategory?: string
}

export default function ProductsPageClient({ initialCategory = "all" }: ProductsPageClientProps) {
  const { products } = useStore()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState(initialCategory || "all")
  const [condition, setCondition] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.serialNumber?.toLowerCase().includes(searchLower) ||
          p.imei?.toLowerCase().includes(searchLower)
      )
    }

    if (category !== "all") {
      filtered = filtered.filter((p) => p.category === category)
    }

    if (condition !== "all") {
      filtered = filtered.filter((p) => p.condition === condition)
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "price-high":
        filtered.sort((a, b) => b.retailPriceUSD - a.retailPriceUSD)
        break
      case "price-low":
        filtered.sort((a, b) => a.retailPriceUSD - b.retailPriceUSD)
        break
      case "stock-low":
        filtered.sort((a, b) => a.stockQuantity - b.stockQuantity)
        break
      case "stock-high":
        filtered.sort((a, b) => b.stockQuantity - a.stockQuantity)
        break
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return filtered
  }, [products, search, category, condition, sortBy])

  const handleClearFilters = () => {
    setSearch("")
    setCategory("all")
    setCondition("all")
    setSortBy("newest")
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Productos</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona tu inventario de productos Apple
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-border p-1 sm:flex">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </Button>
          </div>
        </div>

        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          condition={condition}
          onConditionChange={setCondition}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onClearFilters={handleClearFilters}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No se encontraron productos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar los filtros o agrega un nuevo producto
            </p>
            <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onEdit={handleEditProduct} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductListItem key={product.id} product={product} onEdit={handleEditProduct} />
            ))}
          </div>
        )}
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
      />
    </AppShell>
  )
}