import { getSupabaseClient } from '@/lib/supabase-client';

export type Category = {
	id: number;
	name?: string | null;
};

const TABLE = 'categories';

export async function createCategory(
	category: Omit<Category, 'id'>
): Promise<{ data: Category | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...category,
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function listCategories(): Promise<{ data: Category[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').order('name', { ascending: true });
	return { data, error };
}

export async function updateCategory(
	id: number,
	changes: Partial<Category>
): Promise<{ data: Category | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteCategory(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data, error };
}
