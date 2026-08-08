'use client';

import { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { createInternalConsumption } from '@/lib/internal-consumptions/internal-consumptions';
import { useAuth } from '@/components/provider/auth-provider';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';
import { formatNumber, parseArsToNumber } from '@/utils/formats-money';
import type { Product } from '@/lib/products/products/products';

const fieldClass =
	'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500';
const labelClass = 'mb-1 block text-sm text-neutral-700';

interface InternalConsumptionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	products: Product[];
}

export function InternalConsumptionDialog({
	open,
	onOpenChange,
	products,
}: InternalConsumptionDialogProps) {
	const { user } = useAuth();
	const [selectedProductId, setSelectedProductId] = useState('');
	const [quantity, setQuantity] = useState('');
	const [description, setDescription] = useState('');
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
			setDescription('');
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
			const { error } = await createInternalConsumption(
				{
					product_id: selectedProduct.id,
					quantity: parsedQuantity,
					description,
				},
				user?.uid ?? ''
			);
			if (error) throw error;

			toast({
				title: 'Consumo registrado',
				description: `Se descontaron ${formatNumber(String(parsedQuantity))} unidades de "${selectedProduct.name}".`,
			});
			onOpenChange(false);
		} catch (error: any) {
			toast({
				title: 'Error al registrar consumo',
				description: translateError(error) || 'No se pudo registrar el consumo. Intentá de nuevo.',
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
					<DialogTitle>Nuevo consumo interno</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="consumption-product" className={labelClass}>
								Producto
							</label>
							<select
								id="consumption-product"
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

						<div className="space-y-2">
							<label htmlFor="consumption-quantity" className={labelClass}>
								Cantidad a descontar
							</label>
							<input
								id="consumption-quantity"
								type="text"
								inputMode="numeric"
								value={quantity}
								onChange={(e) => setQuantity(formatNumber(e.target.value))}
								className={fieldClass}
								placeholder="Ej: 5"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="consumption-description" className={labelClass}>
								Descripción <span className="text-neutral-400">(opcional)</span>
							</label>
							<input
								id="consumption-description"
								type="text"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className={fieldClass}
								placeholder="Ej: Uso interno del local"
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
							{saving ? 'Descontando…' : 'Registrar consumo'}
						</button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
