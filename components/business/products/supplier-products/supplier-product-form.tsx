'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '@/components/provider/settings-provider';
import { formatCurrencyWithoutSymbol, formatNumber, parseArsToNumber } from '@/utils/formats-money';
import { generateEan13 } from '@/lib/products/barcodes/barcode-utils';
import { BarcodeGenerator } from '@/components/business/products/barcode-generator';
import type { ProductForm } from '@/components/business/products/products-form';

interface SupplierProductFormProps {
	form: ProductForm;
	onChange: (field: keyof ProductForm, value: string | boolean) => void;
}

const fieldClass =
	'mb-5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500';
const labelClass = 'mb-1 block text-sm text-neutral-700';

type SupplierFormField =
	'cost_price_usd' | 'cost_price_ars' | 'usd_rate' | 'wholesale_margin' | 'retail_margin';

export function SupplierProductForm({ form, onChange }: SupplierProductFormProps) {
	const { settings } = useSettings();
	const hasPrefilledRate = useRef(false);

	useEffect(() => {
		const costUsd = parseArsToNumber(form.cost_price_usd);
		const rate = parseArsToNumber(form.usd_rate);

		if (!costUsd || !rate) {
			onChange('cost_price_ars', '');
			if (form.price_currency === 'ars' || form.price_currency === 'both') {
				onChange('wholesale_price_ars', '');
				onChange('retail_price_ars', '');
			}
			if (form.price_currency === 'usd' || form.price_currency === 'both') {
				onChange('wholesale_price_usd', '');
				onChange('retail_price_usd', '');
			}
			return;
		}

		const costArs = costUsd * rate;
		const wholesaleMargin = parseArsToNumber(form.wholesale_margin) / 100;
		const retailMargin = parseArsToNumber(form.retail_margin) / 100;

		const wholesaleArs = costArs * (1 + wholesaleMargin);
		const retailArs = costArs * (1 + retailMargin);

		onChange('cost_price_ars', formatNumber(String(costArs)));

		if (form.price_currency === 'ars' || form.price_currency === 'both') {
			onChange('wholesale_price_ars', formatCurrencyWithoutSymbol(wholesaleArs));
			onChange('retail_price_ars', formatCurrencyWithoutSymbol(retailArs));
		}

		if (form.price_currency === 'usd' || form.price_currency === 'both') {
			onChange('wholesale_price_usd', formatCurrencyWithoutSymbol(wholesaleArs / rate));
			onChange('retail_price_usd', formatCurrencyWithoutSymbol(retailArs / rate));
		}
	}, [
		form.cost_price_usd,
		form.usd_rate,
		form.wholesale_margin,
		form.retail_margin,
		form.price_currency,
	]);

	useEffect(() => {
		if (!hasPrefilledRate.current && form.usd_rate === '' && settings?.usd_rate != null) {
			hasPrefilledRate.current = true;
			onChange('usd_rate', formatNumber(String(settings.usd_rate)));
		}
	}, [settings?.usd_rate, form.usd_rate, onChange]);

	const handleChange = (field: SupplierFormField, value: string) => {
		const formatedValue = formatNumber(value);
		onChange(field, formatedValue);
	};

	return (
		<div className="col-span-full rounded-md border border-dashed border-neutral-300 p-4 mb-5">
			<div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
				<div className="col-span-full mb-1">
					<p className="text-sm font-medium text-neutral-700">Datos del proveedor</p>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-barcode" className={labelClass}>
						Código de barra
					</label>
					<input
						id="product-barcode"
						type="text"
						value={form.barcode}
						onChange={(e) => onChange('barcode', e.target.value)}
						className={fieldClass}
						placeholder="Ej: 7790000000001"
					/>
					<button
						type="button"
						onClick={() => onChange('barcode', generateEan13())}
						className="-mt-3 block text-sm font-medium text-blue-600 hover:underline mb-5"
					>
						Generar código
					</button>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-cost-usd" className={labelClass}>
						Precio de costo (USD)
					</label>
					<input
						id="product-cost-usd"
						type="text"
						value={form.cost_price_usd}
						onChange={(e) => handleChange('cost_price_usd', e.target.value)}
						className={fieldClass}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-usd-rate" className={labelClass}>
						Cotización del USD
					</label>
					<input
						id="product-usd-rate"
						type="text"
						value={form.usd_rate}
						onChange={(e) => handleChange('usd_rate', e.target.value)}
						className={fieldClass}
						placeholder="Ej: 1000"
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-cost-ars" className={labelClass}>
						Precio de costo (ARS)
					</label>
					<input
						id="product-cost-ars"
						type="text"
						value={form.cost_price_ars}
						onChange={(e) => handleChange('cost_price_ars', e.target.value)}
						className={fieldClass}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-retail-margin" className={labelClass}>
						% Ganancia minorista
					</label>
					<input
						id="product-retail-margin"
						type="text"
						value={form.retail_margin}
						onChange={(e) => handleChange('retail_margin', e.target.value)}
						className={fieldClass}
						placeholder="Ej: 50"
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-wholesale-margin" className={labelClass}>
						% Ganancia mayorista
					</label>
					<input
						id="product-wholesale-margin"
						type="text"
						value={form.wholesale_margin}
						onChange={(e) => handleChange('wholesale_margin', e.target.value)}
						className={fieldClass}
						placeholder="Ej: 20"
					/>
				</div>
			</div>
			{form.barcode && (
				<div className="mt-2 flex flex-col items-center border-t border-neutral-200 pt-4">
					<p className="mb-2 text-sm font-medium text-neutral-700">Código de barra</p>
					<BarcodeGenerator value={form.barcode} format="CODE128" height={80} />
				</div>
			)}
		</div>
	);
}
