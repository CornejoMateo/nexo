'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { getBusinessSettings, type BusinessSettings } from '@/lib/settings/business-settings';

type SettingsContextValue = {
	settings: BusinessSettings | null;
	loading: boolean;
	error: string | null;
	refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
	const [settings, setSettings] = useState<BusinessSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseClient();

	const refreshSettings = useCallback(async () => {
		try {
			const { data, error: fetchError } = await getBusinessSettings();
			if (fetchError) throw fetchError;
			setSettings(data);
			setError(null);
		} catch (err: any) {
			if (typeof err?.message === 'string' && err.message.trim().length > 0) {
				setError(err.message);
			} else {
				setError('Error al cargar la configuración del negocio');
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshSettings();
	}, [refreshSettings]);

	useEffect(() => {
		const channel = supabase
			.channel('business-settings-realtime')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'business_settings',
				},
				(payload) => {
					if (payload.eventType === 'DELETE') {
						setSettings(null);
						return;
					}
					if (payload.new) {
						setSettings(payload.new as BusinessSettings);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase]);

	const value = useMemo(
		() => ({ settings, loading, error, refreshSettings }),
		[settings, loading, error, refreshSettings]
	);

	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
	const ctx = useContext(SettingsContext);

	if (!ctx) {
		throw new Error('useSettings must be used within a SettingsProvider');
	}

	return ctx;
}
