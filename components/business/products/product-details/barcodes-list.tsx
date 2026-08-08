'use client';

import { Barcode, Loader2, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductBarcodeWithSupplier } from '@/lib/products/barcodes/products-barcodes';
import type { Product } from '@/lib/products/products/products';
import {
	formatCurrency,
	formatCurrencyUSD,
	formatCurrencyWithoutSymbol,
} from '@/utils/formats-money';
import { BarcodeGenerator } from '@/components/business/products/barcode-generator';

interface BarcodesListProps {
	barcodes: ProductBarcodeWithSupplier[];
	loading: boolean;
	deletingId: number | null;
	product: Product;
	onPrint: (code: ProductBarcodeWithSupplier) => void;
	onDelete: (id: number) => void;
}

function profitPercent(
	product: Product,
	costUsd: number | null | undefined,
	costArs: number | null | undefined
): number | null {
	if (costUsd != null && product.retail_price_usd != null && product.retail_price_usd > 0) {
		return ((product.retail_price_usd - costUsd) / costUsd) * 100;
	}
	if (costArs != null && product.retail_price_ars != null && product.retail_price_ars > 0) {
		return ((product.retail_price_ars - costArs) / costArs) * 100;
	}
	return null;
}

export function BarcodesList({
	barcodes,
	loading,
	deletingId,
	product,
	onPrint,
	onDelete,
}: BarcodesListProps) {
	return (
		<div>
			<h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
				<Barcode className="h-4 w-4" />
				Códigos de barra
			</h3>
			{loading ? (
				<div className="flex items-center justify-center py-4">
					<Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
				</div>
			) : barcodes.length === 0 ? (
				<p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
					Este producto no tiene códigos de barra cargados.
				</p>
			) : (
				<ul className="space-y-3">
					{barcodes.map((code) => {
						const costUsd = code.cost_price_usd;
						const costArs = code.cost_price_ars;
						const profit = profitPercent(product, costUsd, costArs);
						return (
							<li
								key={code.id}
								className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 sm:flex-row sm:items-center"
							>
								<div className="flex flex-col items-center rounded border border-neutral-100 bg-white p-2">
									<BarcodeGenerator value={code.barcode} format="CODE128" height={60} />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-mono text-sm text-neutral-900">{code.barcode}</p>
									<p className="text-xs text-neutral-500">
										{code.suppliers?.name ? `Proveedor: ${code.suppliers.name}` : 'Sin proveedor'}
									</p>
									<div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
										{code.cost_price_usd != null && (
											<span>Costo USD: {formatCurrencyUSD(code.cost_price_usd)}</span>
										)}
										{code.cost_price_ars != null && (
											<span>Costo ARS: {formatCurrency(code.cost_price_ars)}</span>
										)}
									</div>
									<div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
										{profit != null && (
											<span className={profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
												Ganancia: {formatCurrencyWithoutSymbol(profit)}%
											</span>
										)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" onClick={() => onPrint(code)}>
										<Printer className="mr-1 h-4 w-4" />
										Imprimir
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label={`Eliminar código ${code.barcode}`}
										onClick={() => onDelete(code.id)}
										disabled={deletingId === code.id}
										className="text-red-600 hover:text-red-700"
									>
										{deletingId === code.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
