import { getSupabaseClient } from '../supabase-client';

export type iphone_product = {
	id: number;
	name: string;
	category: string;
	brand: string;
	condition: string;
	storage_capacity: string;
	color: string;
	serial_number: string;
	imei: string;
	stock_quantity: number | null;
	purchase_price_USD: number | null;
	wholesale_price_USD: number | null;
	retail_price_USD: number | null;
	notes: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type macbook_product = {
	id: number;
	name: string;
	category: string;
	brand: string;
	condition: string;
	storageCapacity: string;
	color: string;
	serialNumber: string;
	stockQuantity: number;
	purchasePriceUSD: number;
	wholesalePriceUSD: number;
	retailPriceUSD: number;
	supplier: string;
	notes: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type ipad_product = {
	id: number;
	name: string;
	category: string;
	brand: string;
	condition: string;
	storageCapacity: string;
	color: string;
	serialNumber: string;
	stockQuantity: number;
	purchasePriceUSD: number;
	wholesalePriceUSD: number;
	retailPriceUSD: number;
	supplier: string;
	notes: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type airpods_product = {
	id: number;
	name: string;
	category: string;
	brand: string;
	condition: string;
	color: string;
	serialNumber: string;
	stockQuantity: number;
	purchasePriceUSD: number;
	wholesalePriceUSD: number;
	retailPriceUSD: number;
	supplier: string;
	notes: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type watch_product = {
	id: number;
	name: string;
	category: string;
	brand: string;
	condition: string;
	color: string;
	serialNumber: string;
	stockQuantity: number;
	purchasePriceUSD: number;
	wholesalePriceUSD: number;
	retailPriceUSD: number;
	supplier: string;
	notes: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type accessory_product = {
	id: number;
	name: string;
	category: string;
	brand: string;
	condition: string;
	color: string;
	serialNumber: string;
	stockQuantity: number;
	purchasePriceUSD: number;
	wholesalePriceUSD: number;
	retailPriceUSD: number;
	supplier: string;
	notes: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
};
