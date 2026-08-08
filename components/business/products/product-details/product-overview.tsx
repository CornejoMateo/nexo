'use client';

import type { ReactNode } from 'react';
import type { Product } from '@/lib/products/products/products';
import { formatCurrency, formatCurrencyUSD } from '@/utils/formats-money';
import { cn } from '@/lib/utils';

interface ProductOverviewProps {
	product: Product;
}

function InfoCard({
	label,
	className,
	children,
}: {
	label: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className={cn('rounded-lg border border-neutral-200 p-3', className)}>
			<p className="text-xs text-neutral-500">{label}</p>
			{children}
		</div>
	);
}

function PriceCard({ label, value }: { label: string; value: string }) {
	return (
		<InfoCard label={label}>
			<p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
		</InfoCard>
	);
}

export function ProductOverview({ product }: ProductOverviewProps) {
	const lowStock =
		product.stock_min != null &&
		product.stock_current != null &&
		product.stock_min >= product.stock_current;

	const prices = [
		{ label: 'Minorista USD', value: formatCurrencyUSD(product.retail_price_usd) || '—' },
		{ label: 'Minorista ARS', value: formatCurrency(product.retail_price_ars) },
		{ label: 'Mayorista USD', value: formatCurrencyUSD(product.wholesale_price_usd) || '—' },
		{ label: 'Mayorista ARS', value: formatCurrency(product.wholesale_price_ars) },
	];

	return (
		<>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<InfoCard label="Marca">
					<p className="mt-1 text-sm font-medium text-neutral-900">{product.brands?.name || '—'}</p>
				</InfoCard>
				<InfoCard label="Categoría">
					<p className="mt-1 text-sm font-medium text-neutral-900">
						{product.categories?.name || '—'}
					</p>
				</InfoCard>
				<InfoCard label="Disponible">
					<p className="mt-1 text-sm font-medium text-neutral-900">
						{product.is_available_for_sale ? 'Sí' : 'No'}
					</p>
				</InfoCard>
				<InfoCard label="Stock" className={lowStock ? 'border-red-300 bg-red-50' : undefined}>
					<p className="mt-1 text-sm font-medium text-neutral-900">
						{product.stock_current ?? '—'}
						{product.stock_min != null && (
							<span className="text-xs font-normal text-neutral-500">
								{' '}
								/ mín {product.stock_min}
							</span>
						)}
					</p>
					{lowStock && <p className="mt-1 text-xs font-medium text-red-600">Stock bajo</p>}
				</InfoCard>
			</div>

			<div>
				<h3 className="mb-2 text-sm font-semibold text-neutral-700">Precios de venta</h3>
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{prices.map((price) => (
						<PriceCard key={price.label} label={price.label} value={price.value} />
					))}
				</div>
			</div>
		</>
	);
}
