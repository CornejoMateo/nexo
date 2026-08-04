import { getSupabaseClient } from '@/lib/supabase-client';
import type { PostgrestError } from '@supabase/supabase-js';

export type Supplier = {
	id: number;
	name: string;
	cuit: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
};

export type SupplierInput = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;

const TABLE = 'suppliers';

export async function createSupplier(
	supplier: SupplierInput
): Promise<{ data: Supplier | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).insert(supplier).select().single();
	return { data, error };
}

export async function listSuppliers(): Promise<{
	data: Supplier[] | null;
	error: PostgrestError | null;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').order('name', { ascending: true });
	return { data, error };
}

export async function updateSupplier(
	id: number,
	changes: Partial<SupplierInput>
): Promise<{ data: Supplier | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteSupplier(
	id: number
): Promise<{ data: null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data, error };
}
