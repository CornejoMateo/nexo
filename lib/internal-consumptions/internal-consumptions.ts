import type { PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase-client';
import { updateProduct } from '@/lib/products/products/products';
import {
	createStockMovement,
	listAllStockMovements,
	listStockMovements,
	type StockMovement,
} from '@/lib/products/stock-movements/stock-movements';

export type InternalConsumption = StockMovement;

export type InternalConsumptionInput = {
	product_id: number;
	quantity: number;
	description?: string | null;
};

export async function createInternalConsumption(
	input: InternalConsumptionInput,
	userId: string
): Promise<{ data: InternalConsumption | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();

	const { data: product, error: productError } = await supabase
		.from('products')
		.select('stock_current')
		.eq('id', input.product_id)
		.single();
	if (productError) return { data: null, error: productError };

	const newStock = (product?.stock_current ?? 0) - input.quantity;
	const { error: updateError } = await updateProduct(input.product_id, {
		stock_current: newStock,
	});
	if (updateError) return { data: null, error: updateError };

	const { data: movement, error: movementError } = await createStockMovement({
		product_id: input.product_id,
		user_id: userId,
		type: 'consumption',
		quantity: -input.quantity,
		description: input.description?.trim() || null,
	});
	if (movementError) return { data: null, error: movementError };

	return { data: movement, error: null };
}

export async function listInternalConsumptions(
	page: number,
	pageSize: number
): Promise<{
	data: InternalConsumption[] | null;
	count: number;
	error: PostgrestError | null;
}> {
	return listStockMovements(page, pageSize, 'consumption');
}

export async function listAllInternalConsumptions(): Promise<{
	data: InternalConsumption[] | null;
	error: PostgrestError | null;
}> {
	return listAllStockMovements('consumption');
}
