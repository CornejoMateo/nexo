import { create } from 'zustand';
import type { Product, Sale, InventoryMovement, ExchangeRate, User } from './types';
import {
	mockProducts,
	mockSales,
	mockInventoryMovements,
	mockExchangeRate,
	mockUsers,
} from './mock-data';

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

	setExchangeRate: (rate: number, updatedBy: string) => void;

	addInventoryMovement: (movement: InventoryMovement) => void;

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
				p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
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
			// Update product stock
			const updatedProducts = state.products.map((product) => {
				const saleItem = sale.products.find((item) => item.productId === product.id);
				if (saleItem) {
					return {
						...product,
						stockQuantity: product.stockQuantity - saleItem.quantity,
						updatedAt: new Date(),
					};
				}
				return product;
			});

			return {
				sales: [sale, ...state.sales],
				products: updatedProducts,
			};
		}),

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
