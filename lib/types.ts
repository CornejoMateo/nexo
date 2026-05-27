export type ProductCategory = 
  | 'iphone' 
  | 'used-iphone' 
  | 'macbook' 
  | 'ipad' 
  | 'airpods' 
  | 'apple-watch' 
  | 'accessories' 
  | 'chargers' 
  | 'cables'

export type ProductCondition = 'new' | 'used' | 'refurbished'

export type CosmeticCondition = 'excellent' | 'good' | 'fair' | 'poor'

export type CarrierStatus = 'unlocked' | 'locked' | 'unknown'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mercadopago' | 'other'

export type UserRole = 'admin' | 'employee'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  brand: string
  condition: ProductCondition
  storageCapacity?: string
  color?: string
  serialNumber?: string
  imei?: string
  stockQuantity: number
  purchasePriceUSD: number
  wholesalePriceUSD: number
  retailPriceUSD: number
  supplier?: string
  notes?: string
  images: string[]
  createdAt: Date
  updatedAt: Date
  // Used product specific fields
  batteryHealth?: number
  cosmeticCondition?: CosmeticCondition
  repairNotes?: string
  carrierStatus?: CarrierStatus
  accessoriesIncluded?: string[]
}

export interface Sale {
  id: string
  products: SaleItem[]
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  paymentMethod: PaymentMethod
  priceType: 'wholesale' | 'retail'
  totalUSD: number
  totalARS: number
  exchangeRateUsed: number
  notes?: string
  createdAt: Date
  createdBy: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  priceUSD: number
  priceARS: number
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  createdAt: Date
  createdBy: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

export interface ExchangeRate {
  rate: number
  updatedAt: Date
  updatedBy: string
}

export interface DashboardStats {
  totalInventoryValue: number
  totalProducts: number
  lowStockCount: number
  totalSalesToday: number
  totalSalesMonth: number
  recentSales: Sale[]
  recentProducts: Product[]
}
