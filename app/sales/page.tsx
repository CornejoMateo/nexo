'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout';
import { SaleFormDialog, SaleCard, SaleTableRow } from '@/components/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import type { Sale } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Search, ShoppingCart, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function SalesPage() {
	const { sales, exchangeRate } = useStore();
	const [search, setSearch] = useState('');
	const [dateFilter, setDateFilter] = useState('all');
	const [priceTypeFilter, setPriceTypeFilter] = useState('all');
	const [formOpen, setFormOpen] = useState(false);
	const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

	const filteredSales = useMemo(() => {
		let filtered = [...sales];

		// Search filter
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(s) =>
					s.customerName?.toLowerCase().includes(searchLower) ||
					s.products.some((p) => p.productName.toLowerCase().includes(searchLower))
			);
		}

		// Date filter
		const now = new Date();
		if (dateFilter === 'today') {
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			filtered = filtered.filter((s) => new Date(s.createdAt) >= today);
		} else if (dateFilter === 'week') {
			const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			filtered = filtered.filter((s) => new Date(s.createdAt) >= weekAgo);
		} else if (dateFilter === 'month') {
			const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
			filtered = filtered.filter((s) => new Date(s.createdAt) >= monthStart);
		}

		// Price type filter
		if (priceTypeFilter !== 'all') {
			filtered = filtered.filter((s) => s.priceType === priceTypeFilter);
		}

		// Sort by date (newest first)
		filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return filtered;
	}, [sales, search, dateFilter, priceTypeFilter]);

	// Stats
	const totalSalesUSD = filteredSales.reduce((sum, s) => sum + s.totalUSD, 0);
	const avgSaleUSD = filteredSales.length > 0 ? totalSalesUSD / filteredSales.length : 0;
	const totalItems = filteredSales.reduce(
		(sum, s) => sum + s.products.reduce((ps, p) => ps + p.quantity, 0),
		0
	);

	return (
		<AppShell>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold text-foreground md:text-3xl">Ventas</h1>
						<p className="mt-1 text-muted-foreground">Historial y registro de ventas</p>
					</div>
					<Button onClick={() => setFormOpen(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						<span>Nueva Venta</span>
					</Button>
				</div>

				{/* Stats */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Ventas
							</CardTitle>
							<DollarSign className="h-4 w-4 text-accent" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-foreground">
								${totalSalesUSD.toLocaleString()}
							</div>
							<p className="text-xs text-muted-foreground">
								${(totalSalesUSD * exchangeRate.rate).toLocaleString()} ARS
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Transacciones
							</CardTitle>
							<ShoppingCart className="h-4 w-4 text-accent" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-foreground">{filteredSales.length}</div>
							<p className="text-xs text-muted-foreground">{totalItems} productos vendidos</p>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<div className="flex flex-col gap-3 sm:flex-row">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar por cliente o producto..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={dateFilter} onValueChange={setDateFilter}>
						<SelectTrigger className="w-full sm:w-40">
							<SelectValue placeholder="Periodo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todo el tiempo</SelectItem>
							<SelectItem value="today">Hoy</SelectItem>
							<SelectItem value="week">Esta semana</SelectItem>
							<SelectItem value="month">Este mes</SelectItem>
						</SelectContent>
					</Select>
					<Select value={priceTypeFilter} onValueChange={setPriceTypeFilter}>
						<SelectTrigger className="w-full sm:w-40">
							<SelectValue placeholder="Tipo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos</SelectItem>
							<SelectItem value="retail">Minorista</SelectItem>
							<SelectItem value="wholesale">Mayorista</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Sales List - Mobile */}
				<div className="space-y-3 md:hidden">
					{filteredSales.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
							<ShoppingCart className="h-12 w-12 text-muted-foreground" />
							<h3 className="mt-4 text-lg font-medium text-foreground">No se encontraron ventas</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Registra una nueva venta para comenzar
							</p>
						</div>
					) : (
						filteredSales.map((sale) => (
							<SaleCard key={sale.id} sale={sale} onClick={() => setSelectedSale(sale)} />
						))
					)}
				</div>

				{/* Sales Table - Desktop */}
				<div className="hidden overflow-hidden rounded-lg border border-border md:block">
					<table className="w-full">
						<thead className="border-b border-border bg-secondary/30">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
									Cliente
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
									Fecha
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
									Pago
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
									Tipo
								</th>
								<th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
									Items
								</th>
								<th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
									Total
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredSales.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-4 py-16 text-center">
										<ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
										<h3 className="mt-4 text-lg font-medium text-foreground">
											No se encontraron ventas
										</h3>
									</td>
								</tr>
							) : (
								filteredSales.map((sale) => (
									<SaleTableRow key={sale.id} sale={sale} onClick={() => setSelectedSale(sale)} />
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Sale Form Dialog */}
			<SaleFormDialog open={formOpen} onOpenChange={setFormOpen} />

			{/* Sale Detail Dialog */}
			<Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Detalle de Venta</DialogTitle>
					</DialogHeader>
					{selectedSale && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-foreground">
										{selectedSale.customerName || 'Cliente Anonimo'}
									</p>
									<p className="text-sm text-muted-foreground">
										{format(new Date(selectedSale.createdAt), 'PPpp', { locale: es })}
									</p>
								</div>
								<Badge>{selectedSale.priceType === 'retail' ? 'Minorista' : 'Mayorista'}</Badge>
							</div>

							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">Productos</p>
								{selectedSale.products.map((item, i) => (
									<div
										key={i}
										className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
									>
										<div>
											<p className="font-medium text-foreground">{item.productName}</p>
											<p className="text-sm text-muted-foreground">
												${(item.priceUSD / item.quantity).toLocaleString()} x {item.quantity}
											</p>
										</div>
										<p className="font-semibold text-foreground">
											${item.priceUSD.toLocaleString()}
										</p>
									</div>
								))}
							</div>

							<div className="rounded-lg bg-accent/10 p-4">
								<div className="flex items-center justify-between">
									<p className="text-muted-foreground">Total</p>
									<div className="text-right">
										<p className="text-2xl font-bold text-foreground">
											${selectedSale.totalUSD.toLocaleString()} USD
										</p>
										<p className="text-muted-foreground">
											${selectedSale.totalARS.toLocaleString()} ARS
										</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-muted-foreground">Vendedor</p>
									<p className="font-medium text-foreground">{selectedSale.createdBy}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Tipo de Cambio</p>
									<p className="font-medium text-foreground">
										${selectedSale.exchangeRateUsed.toLocaleString()} ARS
									</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</AppShell>
	);
}
