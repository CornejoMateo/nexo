import { getSupabaseClient } from '../supabase-client';
import { Product } from '../types';

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
	createdAt: Date;
	updatedAt: Date;
};

const table = 'products';

export async function getProducts(): Promise<iphone_product[]> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(table)
		.select('*')
		.order('createdAt', { ascending: false });

	if (error) {
		throw error;
	}

	return data;
}

export async function getProductById(id: number): Promise<iphone_product | null> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(table).select('*').eq('id', id).single();

	if (error) {
		if (error.code === 'PGRST116') {
			return null;
		}

		throw error;
	}

	return data;
}

export async function createProduct(product: iphone_product): Promise<iphone_product> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(table)
		.insert({
			...product,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
		.select('*')
		.single();

	if (error) {
		throw error;
	}

	return data;
}

export async function updateProduct(
	id: number,
	updates: Partial<iphone_product>
): Promise<iphone_product> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(table)
		.update({
			...updates,
			updatedAt: new Date().toISOString(),
		})
		.eq('id', id)
		.select('*')
		.single();

	if (error) {
		throw error;
	}

	return data;
}

export async function deleteProduct(id: number): Promise<void> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(table).delete().eq('id', id);

	if (error) {
		throw error;
	}
}
