import { getSupabaseClient } from '@/lib/supabase-client';
import type { PostgrestError } from '@supabase/supabase-js';

export type PaymentMethod = {
	id: number;
	name: string;
};

const TABLE = 'payment_methods';

export async function createPaymentMethod(
	method: Omit<PaymentMethod, 'id'>
): Promise<{ data: PaymentMethod | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).insert(method).select().single();
	return { data, error };
}

export async function listPaymentMethods(): Promise<{
	data: PaymentMethod[] | null;
	error: PostgrestError | null;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').order('name', { ascending: true });
	return { data, error };
}

export async function updatePaymentMethod(
	id: number,
	changes: Partial<PaymentMethod>
): Promise<{ data: PaymentMethod | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deletePaymentMethod(
	id: number
): Promise<{ data: null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data, error };
}
