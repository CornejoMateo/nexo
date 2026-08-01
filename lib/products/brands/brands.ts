import { getSupabaseClient } from '@/lib/supabase-client';
import type { PostgrestError } from '@supabase/supabase-js';

export type Brand = {
	id: number;
	name: string;
};

const TABLE = 'brands';

export async function createBrand(
	brand: Omit<Brand, 'id'>
): Promise<{ data: Brand | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).insert(brand).select().single();
	return { data, error };
}

export async function listBrands(): Promise<{
	data: Brand[] | null;
	error: PostgrestError | null;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').order('name', { ascending: true });
	return { data, error };
}

export async function updateBrand(
	id: number,
	changes: Partial<Brand>
): Promise<{ data: Brand | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteBrand(
	id: number
): Promise<{ data: null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data, error };
}
