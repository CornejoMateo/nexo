'use client';

import { useState } from 'react';
import { Barcode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { generateEan13 } from '@/lib/products/barcodes/barcode-utils';
import type { Supplier } from '@/lib/suppliers/suppliers';
import { formatNumber, parseArsToNumber } from '@/utils/formats-money';
import type { NewBarcodePayload } from '@/hooks/barcodes/use-product-barcodes';

const fieldClass =
	'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500';
const labelClass = 'mb-1 block text-sm text-neutral-700';

interface AddBarcodeFormProps {
	suppliers: Supplier[];
	saving: boolean;
	onSubmit: (payload: NewBarcodePayload) => Promise<boolean>;
}

export function AddBarcodeForm({ suppliers, saving, onSubmit }: AddBarcodeFormProps) {
	const [supplierId, setSupplierId] = useState('');
	const [barcode, setBarcode] = useState('');
	const [costPriceUsd, setCostPriceUsd] = useState('');
	const [costPriceArs, setCostPriceArs] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const code = barcode.trim();
		if (!code) {
			toast({
				title: 'Código inválido',
				description: 'Ingresá o generá un código de barra para agregarlo.',
				variant: 'destructive',
			});
			return;
		}

		const ok = await onSubmit({
			barcode: code,
			supplier_id: supplierId ? Number(supplierId) : null,
			cost_price_usd: parseArsToNumber(costPriceUsd),
			cost_price_ars: parseArsToNumber(costPriceArs),
		});

		if (ok) {
			setSupplierId('');
			setBarcode('');
			setCostPriceUsd('');
			setCostPriceArs('');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="rounded-lg border border-dashed border-neutral-300 p-4"
		>
			<h3 className="mb-3 text-sm font-semibold text-neutral-700">
				Agregar código de barra o vincular proveedor
			</h3>
			<div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
				<div>
					<label htmlFor="detail-supplier" className={labelClass}>
						Proveedor
					</label>
					<select
						id="detail-supplier"
						value={supplierId}
						onChange={(e) => setSupplierId(e.target.value)}
						className={fieldClass}
					>
						<option value="">Sin proveedor</option>
						{suppliers.map((supplier) => (
							<option key={supplier.id} value={supplier.id}>
								{supplier.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="detail-barcode" className={labelClass}>
						Código de barra
					</label>
					<input
						id="detail-barcode"
						type="text"
						value={barcode}
						onChange={(e) => setBarcode(e.target.value)}
						className={fieldClass}
						placeholder="Ej: 7790000000001"
					/>
					<button
						type="button"
						onClick={() => setBarcode(generateEan13())}
						className="mt-1 block text-sm font-medium text-blue-600 hover:underline"
					>
						Generar código
					</button>
				</div>
				<div>
					<label htmlFor="detail-cost-usd" className={labelClass}>
						Costo (USD)
					</label>
					<input
						id="detail-cost-usd"
						type="text"
						inputMode="decimal"
						value={costPriceUsd}
						onChange={(e) => setCostPriceUsd(formatNumber(e.target.value))}
						className={fieldClass}
					/>
				</div>
				<div>
					<label htmlFor="detail-cost-ars" className={labelClass}>
						Costo (ARS)
					</label>
					<input
						id="detail-cost-ars"
						type="text"
						inputMode="decimal"
						value={costPriceArs}
						onChange={(e) => setCostPriceArs(formatNumber(e.target.value))}
						className={fieldClass}
					/>
				</div>
			</div>
			<div className="mt-4 flex justify-end">
				<Button type="submit" disabled={saving}>
					{saving ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Barcode className="mr-2 h-4 w-4" />
					)}
					{saving ? 'Guardando...' : 'Agregar código'}
				</Button>
			</div>
		</form>
	);
}
