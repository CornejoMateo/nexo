'use client';

import { DialogFooter } from '@/components/ui/dialog';
import { Brand } from '@/lib/products/brands/brands';
import { Category } from '@/lib/products/categories/categories';
import { Supplier } from '@/lib/suppliers/suppliers';
import { formatNumber } from '@/utils/formats-money';
import { SupplierProductForm } from '@/components/business/products/supplier-products/supplier-product-form';

export type PriceCurrency = 'usd' | 'ars' | 'both';

export type ProductForm = {
	name: string;
	price_currency: PriceCurrency;
	retail_price_usd: string;
	retail_price_ars: string;
	wholesale_price_usd: string;
	wholesale_price_ars: string;
	brand_id: string;
	category_id: string;
	is_available_for_sale: boolean;
	stock_min: string;
	stock_current: string;
	supplier_id: string;
	barcode: string;
	cost_price_usd: string;
	cost_price_ars: string;
	usd_rate: string;
	wholesale_margin: string;
	retail_margin: string;
};

export const emptyForm: ProductForm = {
	name: '',
	price_currency: 'both',
	retail_price_usd: '',
	retail_price_ars: '',
	wholesale_price_usd: '',
	wholesale_price_ars: '',
	brand_id: '',
	category_id: '',
	is_available_for_sale: true,
	stock_min: '',
	stock_current: '',
	supplier_id: '',
	barcode: '',
	cost_price_usd: '',
	cost_price_ars: '',
	usd_rate: '',
	wholesale_margin: '',
	retail_margin: '',
};

interface ProductsFormProps {
	form: ProductForm;
	onChange: (field: keyof ProductForm, value: string | boolean) => void;
	saving: boolean;
	formError: string | null;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	brands?: Brand[];
	categories?: Category[];
	suppliers?: Supplier[];
}

const fieldClass =
	'mb-5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500';
const labelClass = 'mb-1 block text-sm text-neutral-700';

export function ProductsForm({
	form,
	onChange,
	saving,
	formError,
	onSubmit,
	onCancel,
	brands = [],
	categories = [],
	suppliers = [],
}: ProductsFormProps) {
	const showUsdPrices = form.price_currency === 'usd' || form.price_currency === 'both';
	const showArsPrices = form.price_currency === 'ars' || form.price_currency === 'both';
	const hasSupplier = form.supplier_id !== '';

	return (
		<form onSubmit={onSubmit}>
			<div className="grid grid-cols-1 gap-x-4 overflow-y-auto md:grid-cols-2">
				<div className="">
					<label htmlFor="product-name" className={labelClass}>
						Nombre
					</label>
					<input
						id="product-name"
						type="text"
						value={form.name}
						onChange={(e) => onChange('name', e.target.value)}
						className={fieldClass}
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="product-currency" className={labelClass}>
						Moneda de precios
					</label>
					<select
						id="product-currency"
						value={form.price_currency}
						onChange={(e) => onChange('price_currency', e.target.value)}
						className={fieldClass}
					>
						<option value="both">Ambos</option>
						<option value="usd">USD</option>
						<option value="ars">ARS</option>
					</select>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-brand" className={labelClass}>
						Marca
					</label>
					<select
						id="product-brand"
						value={form.brand_id}
						onChange={(e) => onChange('brand_id', e.target.value)}
						className={fieldClass}
					>
						<option value="">Sin marca</option>
						{brands.map((brand) => (
							<option key={brand.id} value={brand.id}>
								{brand.name}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-category" className={labelClass}>
						Categoría
					</label>
					<select
						id="product-category"
						value={form.category_id}
						onChange={(e) => onChange('category_id', e.target.value)}
						className={fieldClass}
					>
						<option value="">Sin categoría</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-supplier" className={labelClass}>
						Proveedor
					</label>
					<select
						id="product-supplier"
						value={form.supplier_id}
						onChange={(e) => onChange('supplier_id', e.target.value)}
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
				{hasSupplier && <SupplierProductForm form={form} onChange={onChange} />}
				{showUsdPrices && (
					<>
						<div className="space-y-2">
							<label htmlFor="product-retail-usd" className={labelClass}>
								Precio para minorista (USD)
							</label>
							<input
								id="product-retail-usd"
								type="text"
								value={form.retail_price_usd}
								onChange={(e) => onChange('retail_price_usd', formatNumber(e.target.value))}
								className={fieldClass}
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="product-wholesale-usd" className={labelClass}>
								Precio mayorista (USD)
							</label>
							<input
								id="product-wholesale-usd"
								type="text"
								value={form.wholesale_price_usd}
								onChange={(e) => onChange('wholesale_price_usd', formatNumber(e.target.value))}
								className={fieldClass}
							/>
						</div>
					</>
				)}
				{showArsPrices && (
					<>
						<div className="space-y-2">
							<label htmlFor="product-retail-ars" className={labelClass}>
								Precio para minorista (ARS)
							</label>
							<input
								id="product-retail-ars"
								type="text"
								value={form.retail_price_ars}
								onChange={(e) => onChange('retail_price_ars', formatNumber(e.target.value))}
								className={fieldClass}
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="product-wholesale-ars" className={labelClass}>
								Precio mayorista (ARS)
							</label>
							<input
								id="product-wholesale-ars"
								type="text"
								value={form.wholesale_price_ars}
								onChange={(e) => onChange('wholesale_price_ars', formatNumber(e.target.value))}
								className={fieldClass}
							/>
						</div>
					</>
				)}
				<div className="space-y-2">
					<label htmlFor="product-stock-min" className={labelClass}>
						Stock mínimo
					</label>
					<input
						id="product-stock-min"
						type="text"
						value={form.stock_min}
						onChange={(e) => onChange('stock_min', formatNumber(e.target.value))}
						className={fieldClass}
						placeholder="Ej: 5"
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="product-stock-current" className={labelClass}>
						Stock actual
					</label>
					<input
						id="product-stock-current"
						type="text"
						value={form.stock_current}
						onChange={(e) => onChange('stock_current', formatNumber(e.target.value))}
						className={fieldClass}
						placeholder="Ej: 50"
					/>
				</div>
				<div className="space-y-2 col-span-full">
					<label className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
						<input
							type="checkbox"
							checked={form.is_available_for_sale}
							onChange={(e) => onChange('is_available_for_sale', e.target.checked)}
							className="h-4 w-4"
						/>
						Disponible para la venta
					</label>
				</div>
				{formError && (
					<p id="product-form-error" role="alert" className="mb-2 text-sm text-red-600">
						{formError}
					</p>
				)}
			</div>

			<DialogFooter className="mt-4 gap-2">
				<button
					type="button"
					onClick={onCancel}
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
					{saving ? 'Guardando…' : 'Guardar'}
				</button>
			</DialogFooter>
		</form>
	);
}
