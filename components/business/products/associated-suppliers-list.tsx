'use client';

import { Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProductBarcodeWithSupplier } from '@/lib/products/barcodes/products-barcodes';
import type { Supplier } from '@/lib/suppliers/suppliers';
import { formatCurrency, formatCurrencyUSD } from '@/utils/formats-money';

interface AssociatedSuppliersListProps {
	barcodes: ProductBarcodeWithSupplier[];
	suppliers: Supplier[];
}

export function AssociatedSuppliersList({ barcodes, suppliers }: AssociatedSuppliersListProps) {
	const groups = Array.from(
		barcodes.reduce((map, code) => {
			if (code.supplier_id == null) return map;
			if (!map.has(code.supplier_id)) {
				map.set(code.supplier_id, {
					supplier: suppliers.find((s) => s.id === code.supplier_id),
					codes: [],
				});
			}
			map.get(code.supplier_id)!.codes.push(code);
			return map;
		}, new Map<number, { supplier: Supplier | undefined; codes: ProductBarcodeWithSupplier[] }>())
	).map(([, group]) => group);

	return (
		<div>
			<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700">
				<Truck className="h-4 w-4" />
				Proveedores asociados
			</h3>

			{groups.length === 0 ? (
				<p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm leading-relaxed text-neutral-500">
					Todavía no hay proveedores asociados a este producto. Agregá un código de barra con
					proveedor para vincularlo.
				</p>
			) : (
				<ul className="space-y-2">
					{groups.map(({ supplier, codes }) => {
						const costUsd = codes.find((c) => c.cost_price_usd != null)?.cost_price_usd;
						const costArs = codes.find((c) => c.cost_price_ars != null)?.cost_price_ars;

						return (
							<li
								key={supplier?.id ?? codes[0]?.supplier_id}
								className="rounded-lg border border-neutral-200 p-3 sm:flex sm:items-center sm:justify-between"
							>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate text-sm font-medium text-neutral-900">
											{supplier?.name ?? `Proveedor #${codes[0]?.supplier_id}`}
										</span>

										<Badge variant="secondary" className="shrink-0">
											{codes.length} {codes.length === 1 ? 'código' : 'códigos'}
										</Badge>
									</div>

									{(costUsd != null || costArs != null) && (
										<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
											{costUsd != null && (
												<span>
													Costo USD:{' '}
													<span className="font-medium text-neutral-700">
														{formatCurrencyUSD(costUsd)}
													</span>
												</span>
											)}

											{costArs != null && (
												<span>
													Costo ARS:{' '}
													<span className="font-medium text-neutral-700">
														{formatCurrency(costArs)}
													</span>
												</span>
											)}
										</div>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
