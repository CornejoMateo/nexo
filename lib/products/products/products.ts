import { getSupabaseClient } from '@/lib/supabase-client';
import type { PostgrestError } from '@supabase/supabase-js';

export type Product = {
	id: number;
	name: string;
	retail_price_usd: number | null;
	retail_price_ars: number | null;
	wholesale_price_usd: number | null;
	wholesale_price_ars: number | null;
	brand_id: number | null;
	category_id: number | null;
	is_available_for_sale: boolean;
	created_at: string;
	updated_at: string;
	stock_min: number | null;
	stock_current: number | null;
	brands: { name: string } | null;
	categories: { name: string } | null;
};

export type ProductInput = Omit<
	Product,
	'id' | 'created_at' | 'updated_at' | 'brands' | 'categories'
>;

const TABLE = 'products';
const PRODUCT_SELECT = '*, brands(name), categories(name)';

export async function createProduct(
	product: ProductInput
): Promise<{ data: Product | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(product)
		.select(PRODUCT_SELECT)
		.single();
	return { data, error };
}

export async function listAllProducts(): Promise<{
	data: Product[] | null;
	error: PostgrestError | null;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(PRODUCT_SELECT)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function updateProduct(
	id: number,
	changes: Partial<ProductInput>
): Promise<{ data: Product | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update(changes)
		.eq('id', id)
		.select(PRODUCT_SELECT)
		.single();
	return { data, error };
}

export async function deleteProduct(
	id: number
): Promise<{ data: null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data, error };
}
