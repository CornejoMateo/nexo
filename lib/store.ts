import { create } from "zustand";
import type {
  Product,
  Sale,
  InventoryMovement,
  ExchangeRate,
  User,
} from "./types";
import {
  mockProducts,
  mockSales,
  mockInventoryMovements,
  mockExchangeRate,
  mockUsers,
} from "./mock-data";

function applySaleStockAdjustment(
  products: Product[],
  sale: Sale,
  direction: 1 | -1,
): Product[] {
  return products.map((product) => {
    const saleItem = sale.products.find((item) => item.productId === product.id);

    if (!saleItem) {
      return product;
    }

    return {
      ...product,
      stockQuantity: product.stockQuantity - direction * saleItem.quantity,
      updatedAt: new Date(),
    };
  });
}

interface StoreState {
  // Data
  products: Product[];
  sales: Sale[];
  inventoryMovements: InventoryMovement[];
  exchangeRate: ExchangeRate;
  users: User[];
  currentUser: User | null;

  // UI State
  isDarkMode: boolean;
  sidebarOpen: boolean;

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  setSales: (sales: Sale[]) => void;
  addSale: (sale: Sale) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getSaleById: (id: string) => Sale | undefined;

  setExchangeRate: (rate: number, updatedBy: string) => void;

  addInventoryMovement: (movement: InventoryMovement) => void;

  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  getUserById: (id: string) => User | undefined;

  setDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Computed
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  getTotalInventoryValue: () => number;
  convertToARS: (usd: number) => number;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial data
  products: mockProducts,
  sales: mockSales,
  inventoryMovements: mockInventoryMovements,
  exchangeRate: mockExchangeRate,
  users: mockUsers,
  currentUser: mockUsers[0],

  // UI State
  isDarkMode: false,
  sidebarOpen: true,

  // Product actions
  setProducts: (products) => set({ products }),

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p,
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // Sales actions
  setSales: (sales) => set({ sales }),

  addSale: (sale) =>
    set((state) => {
      const updatedProducts = applySaleStockAdjustment(state.products, sale, 1);

      return {
        sales: [sale, ...state.sales],
        products: updatedProducts,
      };
    }),

  updateSale: (id, updates) =>
    set((state) => {
      const existingSale = state.sales.find((sale) => sale.id === id);

      if (!existingSale) {
        return state;
      }

      const updatedSale: Sale = {
        ...existingSale,
        ...updates,
        id,
        createdAt: existingSale.createdAt,
      };

      const stockRestoredProducts = applySaleStockAdjustment(
        state.products,
        existingSale,
        -1,
      );
      const updatedProducts = applySaleStockAdjustment(
        stockRestoredProducts,
        updatedSale,
        1,
      );

      return {
        sales: state.sales.map((sale) =>
          sale.id === id ? updatedSale : sale,
        ),
        products: updatedProducts,
      };
    }),

  deleteSale: (id) =>
    set((state) => {
      const saleToDelete = state.sales.find((sale) => sale.id === id);

      if (!saleToDelete) {
        return state;
      }

      return {
        sales: state.sales.filter((sale) => sale.id !== id),
        products: applySaleStockAdjustment(state.products, saleToDelete, -1),
      };
    }),

  getSaleById: (id) => get().sales.find((sale) => sale.id === id),

  // Exchange rate actions
  setExchangeRate: (rate, updatedBy) =>
    set({
      exchangeRate: {
        rate,
        updatedAt: new Date(),
        updatedBy,
      },
    }),

  // Inventory movement actions
  addInventoryMovement: (movement) =>
    set((state) => ({
      inventoryMovements: [movement, ...state.inventoryMovements],
    })),

  // User actions
  setUsers: (users) => set({ users }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  updateUser: (id, updates) =>
    set((state) => {
      const nextCurrentUser =
        state.currentUser?.id === id
          ? { ...state.currentUser, ...updates }
          : state.currentUser;

      return {
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updates } : user,
        ),
        currentUser: nextCurrentUser,
      };
    }),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      currentUser: state.currentUser?.id === id ? null : state.currentUser,
    })),

  setCurrentUser: (user) => set({ currentUser: user }),

  getUserById: (id) => get().users.find((user) => user.id === id),

  // UI actions
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Computed getters
  getProductById: (id) => get().products.find((p) => p.id === id),

  getLowStockProducts: () => get().products.filter((p) => p.stockQuantity <= 3),

  getTotalInventoryValue: () => {
    return get().products.reduce((total, product) => {
      return total + product.purchasePriceUSD * product.stockQuantity;
    }, 0);
  },

  convertToARS: (usd) => usd * get().exchangeRate.rate,
}));
