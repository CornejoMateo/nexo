import { getSupabaseClient } from '@/lib/supabase-client';

export type Brand = {
	id: number;
	name?: string | null;
};

const TABLE = 'brands';

export async function createBrand(
	brand: Omit<Brand, 'id'>
): Promise<{ data: Brand | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...brand,
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function listBrands(): Promise<{ data: Brand[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').order('name', { ascending: true });
	return { data, error };
}

export async function updateBrand(
	id: number,
	changes: Partial<Brand>
): Promise<{ data: Brand | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteBrand(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data, error };
}
