import { getSupabaseClient } from '../supabase-client';

const SALES_TABLE = 'sales';

type SaleRow = Omit<sales, 'createdAt'> & {
	createdAt: string;
};

type SaleInsert = Omit<sales, 'id' | 'createdAt'> & {
	createdAt?: Date;
};

function toSale(row: SaleRow): sales {
	return {
		...row,
		createdAt: new Date(row.createdAt),
	};
}

function toSalePayload(sale: SaleInsert) {
	return {
		...sale,
		createdAt: sale.createdAt?.toISOString() ?? new Date().toISOString(),
	};
}

export type sales = {
	id: number;
	products: number[]; // Array of product IDs
	customerName: string;
	customerPhone: string;
	paymentMethod: string; // e.g., "cash", "card", "bank transfer"
	priceType: string; // e.g., "retail", "wholesale"
	totalUSD: number;
	totalARS: number;
	exchangeRateUsed: number;
	createdAt: Date;
	createdBy: string;
};

export async function getSales(): Promise<sales[]> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(SALES_TABLE)
		.select('*')
		.order('createdAt', { ascending: false });

	if (error) {
		throw error;
	}

	return (data ?? []).map((row) => toSale(row as SaleRow));
}

export async function getSaleById(id: number): Promise<sales | null> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(SALES_TABLE)
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return null;
		}

		throw error;
	}

	return data ? toSale(data as SaleRow) : null;
}

export async function createSale(sale: SaleInsert): Promise<sales> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(SALES_TABLE)
		.insert(toSalePayload(sale))
		.select('*')
		.single();

	if (error) {
		throw error;
	}

	return toSale(data as SaleRow);
}

export async function updateSale(
	id: number,
	updates: Partial<SaleInsert>,
): Promise<sales> {
	const supabase = getSupabaseClient();
	const updatePayload = {
		...updates,
		...(updates.createdAt ? { createdAt: updates.createdAt.toISOString() } : {}),
	};
	const { data, error } = await supabase
		.from(SALES_TABLE)
		.update(updatePayload)
		.eq('id', id)
		.select('*')
		.single();

	if (error) {
		throw error;
	}

	return toSale(data as SaleRow);
}

export async function deleteSale(id: number): Promise<void> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(SALES_TABLE).delete().eq('id', id);

	if (error) {
		throw error;
	}
}
