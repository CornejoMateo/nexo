'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import {
	listInternalConsumptions,
	type InternalConsumption,
} from '@/lib/internal-consumptions/internal-consumptions';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const CACHE_KEY = 'internal_consumptions_cache';

interface CacheEntry {
	data: InternalConsumption[];
	totalCount: number;
	page: number;
	timestamp: number;
}

export function useInternalConsumptions(pageSize = 50) {
	const [consumptions, setConsumptions] = useState<InternalConsumption[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(0);

	const supabase = getSupabaseClient();
	const pageRef = useRef(page);
	const pageSizeRef = useRef(pageSize);
	const channelId = useId().replace(/[^a-zA-Z0-9]/g, '');

	useEffect(() => {
		pageRef.current = page;
	}, [page]);

	useEffect(() => {
		pageSizeRef.current = pageSize;
	}, [pageSize]);

	const readCache = useCallback((targetPage: number): CacheEntry | null => {
		try {
			const raw = localStorage.getItem(CACHE_KEY);
			if (!raw) return null;
			const entry: CacheEntry = JSON.parse(raw);
			if (entry.page !== targetPage) return null;
			if (Date.now() - entry.timestamp >= CACHE_DURATION) {
				localStorage.removeItem(CACHE_KEY);
				return null;
			}
			return entry;
		} catch {
			return null;
		}
	}, []);

	const writeCache = useCallback(
		(targetPage: number, data: InternalConsumption[], count: number) => {
			try {
				localStorage.setItem(
					CACHE_KEY,
					JSON.stringify({
						data,
						totalCount: count,
						page: targetPage,
						timestamp: Date.now(),
					})
				);
			} catch {
				// localStorage no disponible: se ignora
			}
		},
		[]
	);

	const fetchPage = useCallback(
		async (targetPage: number, useCache = true) => {
			let showedCache = false;

			if (useCache) {
				const entry = readCache(targetPage);
				if (entry) {
					showedCache = true;
					setConsumptions(entry.data);
					setTotalCount(entry.totalCount);
					setLoading(false);
				}
			}

			if (!showedCache) setLoading(true);
			setError(null);

			try {
				const { data, count, error } = await listInternalConsumptions(
					targetPage,
					pageSizeRef.current
				);
				if (error) throw error;
				const next = data ?? [];
				setConsumptions(next);
				setTotalCount(count);
				writeCache(targetPage, next, count);
			} catch (err: any) {
				const message =
					typeof err?.message === 'string' && err.message.trim().length > 0
						? err.message
						: 'Error al cargar los consumos internos.';
				setError(message);
			} finally {
				setLoading(false);
			}
		},
		[readCache, writeCache]
	);

	// Carga inicial
	useEffect(() => {
		fetchPage(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Realtime: ante cualquier cambio, se refresca la página actual
	useEffect(() => {
		const channel = supabase
			.channel(`internal-consumptions-realtime-${channelId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'stock_movements',
				},
				() => {
					fetchPage(pageRef.current, false);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, channelId, fetchPage]);

	const changePage = useCallback(
		(nextPage: number) => {
			setPage(nextPage);
			fetchPage(nextPage);
		},
		[fetchPage]
	);

	const refresh = useCallback(() => fetchPage(pageRef.current, false), [fetchPage]);

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

	return {
		consumptions,
		totalCount,
		loading,
		error,
		page,
		totalPages,
		changePage,
		refresh,
	};
}
