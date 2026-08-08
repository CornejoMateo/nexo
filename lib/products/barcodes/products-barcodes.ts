import { getSupabaseClient } from '@/lib/supabase-client';
import type { PostgrestError } from '@supabase/supabase-js';

export type ProductBarcode = {
	id: number;
	product_id: number;
	barcode: string;
	supplier_id: number | null;
	cost_price_ars: number | null;
	cost_price_usd: number | null;
};

export type ProductBarcodeWithSupplier = ProductBarcode & {
	suppliers: { name: string } | null;
};

export type ProductBarcodeInput = Omit<ProductBarcode, 'id'>;

const TABLE = 'products_barcodes';

export async function createProductBarcode(
	barcode: ProductBarcodeInput
): Promise<{ data: ProductBarcode | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).insert(barcode).select().single();
	return { data, error };
}

export async function listProductBarcodes(): Promise<{
	data: ProductBarcode[] | null;
	error: PostgrestError | null;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').order('id', { ascending: true });
	return { data, error };
}

export async function listProductBarcodesByProduct(productId: number): Promise<{
	data: ProductBarcodeWithSupplier[] | null;
	error: PostgrestError | null;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*, suppliers(name)')
		.eq('product_id', productId)
		.order('id', { ascending: true });
	return { data, error };
}

export async function deleteProductBarcodeById(
	id: number
): Promise<{ data: null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data, error };
}

export async function deleteProductBarcodes(
	productId: number
): Promise<{ data: null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('product_id', productId);
	return { data, error };
}
