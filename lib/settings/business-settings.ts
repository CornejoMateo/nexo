import { getSupabaseClient } from '@/lib/supabase-client';
import type { PostgrestError } from '@supabase/supabase-js';

export type BusinessSettings = {
	id: number;
	updated_at: string;
	usd_rate: number | null;
	address: string | null;
	number_phone: string | null;
};

export type BusinessSettingsInput = Partial<Omit<BusinessSettings, 'id' | 'updated_at'>>;

const TABLE = 'business_settings';

export async function getBusinessSettings(): Promise<{
	data: BusinessSettings | null;
	error: PostgrestError | null;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').maybeSingle();
	return { data, error };
}

export async function updateBusinessSettings(
	changes: BusinessSettingsInput
): Promise<{ data: BusinessSettings | null; error: PostgrestError | null }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({ ...changes, updated_at: new Date().toISOString() })
		.neq('id', 0)
		.select()
		.single();
	return { data, error };
}
