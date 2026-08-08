'use client';

import { useCallback, useState } from 'react';
import {
	createProductBarcode,
	deleteProductBarcodeById,
	listProductBarcodesByProduct,
	type ProductBarcodeWithSupplier,
} from '@/lib/products/barcodes/products-barcodes';
import type { Product } from '@/lib/products/products/products';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';

export interface NewBarcodePayload {
	barcode: string;
	supplier_id: number | null;
	cost_price_usd: number;
	cost_price_ars: number;
}

export function useProductBarcodes(product: Product | null) {
	const [barcodes, setBarcodes] = useState<ProductBarcodeWithSupplier[]>([]);
	const [loadingBarcodes, setLoadingBarcodes] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const loadBarcodes = useCallback(async () => {
		if (!product) return;
		setLoadingBarcodes(true);
		try {
			const { data, error } = await listProductBarcodesByProduct(product.id);
			if (error) throw error;
			setBarcodes(data ?? []);
		} catch (error: any) {
			toast({
				title: 'Error al cargar códigos',
				description: translateError(error) || 'No se pudieron cargar los códigos de barra.',
				variant: 'destructive',
			});
		} finally {
			setLoadingBarcodes(false);
		}
	}, [product]);

	const addBarcode = useCallback(
		async (payload: NewBarcodePayload): Promise<boolean> => {
			if (!product) return false;
			setSaving(true);
			try {
				const { error } = await createProductBarcode({
					product_id: product.id,
					barcode: payload.barcode,
					supplier_id: payload.supplier_id,
					cost_price_usd: payload.cost_price_usd,
					cost_price_ars: payload.cost_price_ars,
				});
				if (error) throw error;
				toast({
					title: 'Código agregado',
					description: 'El código de barra se agregó correctamente.',
				});
				await loadBarcodes();
				return true;
			} catch (error: any) {
				toast({
					title: 'Error al agregar código',
					description: translateError(error) || 'No se pudo agregar el código de barra.',
					variant: 'destructive',
				});
				return false;
			} finally {
				setSaving(false);
			}
		},
		[product, loadBarcodes]
	);

	const deleteBarcode = useCallback(
		async (id: number) => {
			setDeletingId(id);
			try {
				const { error } = await deleteProductBarcodeById(id);
				if (error) throw error;
				toast({
					title: 'Código eliminado',
					description: 'El código de barra se eliminó correctamente.',
				});
				await loadBarcodes();
			} catch (error: any) {
				toast({
					title: 'Error al eliminar código',
					description: translateError(error) || 'No se pudo eliminar el código de barra.',
					variant: 'destructive',
				});
			} finally {
				setDeletingId(null);
			}
		},
		[loadBarcodes]
	);

	return {
		barcodes,
		loadingBarcodes,
		saving,
		deletingId,
		loadBarcodes,
		addBarcode,
		deleteBarcode,
	};
}
