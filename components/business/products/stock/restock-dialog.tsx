'use client';

import { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { updateProduct, type Product } from '@/lib/products/products/products';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';
import { formatNumber, parseArsToNumber } from '@/utils/formats-money';

const fieldClass =
	'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500';
const labelClass = 'mb-1 block text-sm text-neutral-700';

interface RestockDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	products: Product[];
}

export function RestockDialog({ open, onOpenChange, products }: RestockDialogProps) {
	const [selectedProductId, setSelectedProductId] = useState('');
	const [quantity, setQuantity] = useState('');
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const sortedProducts = [...products].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
	const selectedProduct =
		sortedProducts.find((product) => product.id === Number(selectedProductId)) ?? null;
	const parsedQuantity = parseArsToNumber(quantity);

	useEffect(() => {
		if (open) {
			setSelectedProductId('');
			setQuantity('');
			setFormError(null);
		}
	}, [open]);

	const closeDialog = () => {
		if (saving) return;
		onOpenChange(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedProduct) {
			setFormError('Seleccioná un producto.');
			return;
		}
		if (!parsedQuantity || parsedQuantity <= 0) {
			setFormError('Ingresá una cantidad mayor a cero.');
			return;
		}

		setSaving(true);
		setFormError(null);

		try {
			const newStock = (selectedProduct.stock_current ?? 0) + parsedQuantity;
			const { error } = await updateProduct(selectedProduct.id, { stock_current: newStock });
			if (error) throw error;

			toast({
				title: 'Stock actualizado',
				description: `Se sumaron ${formatNumber(String(parsedQuantity))} unidades a "${selectedProduct.name}".`,
			});
			onOpenChange(false);
		} catch (error: any) {
			toast({
				title: 'Error al actualizar stock',
				description: translateError(error) || 'No se pudo actualizar el stock. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(open) => !open && closeDialog()}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Abastecimiento</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="stock-product" className={labelClass}>
								Producto
							</label>
							<select
								id="stock-product"
								value={selectedProductId}
								onChange={(e) => setSelectedProductId(e.target.value)}
								className={fieldClass}
							>
								<option value="">Seleccioná un producto</option>
								{sortedProducts.map((product) => (
									<option key={product.id} value={product.id}>
										{product.name}
									</option>
								))}
							</select>
						</div>

						{selectedProduct && (
							<div className="rounded-lg border border-neutral-200 p-3 text-sm text-neutral-700">
								<p>
									Stock actual:{' '}
									<span className="font-medium text-neutral-900">
										{selectedProduct.stock_current ?? '—'}
									</span>
								</p>
								{parsedQuantity > 0 && (
									<p>
										Nuevo stock:{' '}
										<span className="font-medium text-neutral-900">
											{(selectedProduct.stock_current ?? 0) + parsedQuantity}
										</span>
									</p>
								)}
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="stock-quantity" className={labelClass}>
								Cantidad a sumar
							</label>
							<input
								id="stock-quantity"
								type="text"
								inputMode="numeric"
								value={quantity}
								onChange={(e) => setQuantity(formatNumber(e.target.value))}
								className={fieldClass}
								placeholder="Ej: 10"
							/>
						</div>

						{formError && (
							<p role="alert" className="text-sm text-red-600">
								{formError}
							</p>
						)}
					</div>

					<DialogFooter className="mt-4 gap-2">
						<button
							type="button"
							onClick={closeDialog}
							disabled={saving}
							className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={saving}
							className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
						>
							{saving ? 'Sumando…' : 'Sumar stock'}
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
