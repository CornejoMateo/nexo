'use client';

import { useMemo, useState } from 'react';
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	FileDown,
	FileSpreadsheet,
	FileText,
	MinusCircle,
} from 'lucide-react';
import { listAllInternalConsumptions } from '@/lib/internal-consumptions/internal-consumptions';
import type { InternalConsumption } from '@/lib/internal-consumptions/internal-consumptions';
import { useInternalConsumptions } from '@/hooks/internal-consumptions/use-internal-consumptions';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { listAllProducts, type Product } from '@/lib/products/products/products';
import { translateError } from '@/lib/error-translator';
import { InfoBanner } from '@/components/ui/infoBanner';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { exportTableToPdf } from '@/utils/pdf-export';
import { exportTableToCsv } from '@/utils/csv-export';
import {
	internalConsumptionColumns,
	formatConsumptionDate,
	formatConsumptionUser,
	type InternalConsumptionSortColumn,
} from '@/constants/internal-consumptions/internal-consumptions';
import { InternalConsumptionDialog } from './internal-consumption-dialog';
import { toast } from '@/components/ui/use-toast';

const PAGE_SIZE = 50;

type SortDirection = 'asc' | 'desc';

function getConsumptionSortValue(
	consumption: InternalConsumption,
	column: InternalConsumptionSortColumn
): string | number {
	switch (column) {
		case 'created_at':
			return new Date(consumption.created_at).getTime();
		case 'product':
			return consumption.products?.name ?? '';
		case 'quantity':
			return consumption.quantity ?? Number.NEGATIVE_INFINITY;
		case 'user':
			return formatConsumptionUser(consumption.users);
		case 'description':
			return consumption.description ?? '';
	}
}

export function InternalConsumptions() {
	const { consumptions, totalCount, loading, error, page, totalPages, changePage } =
		useInternalConsumptions(PAGE_SIZE);

	const { data: products } = useOptimizedRealtime<Product>(
		'products',
		async () => {
			const { data, error } = await listAllProducts();
			if (error) throw error;
			return data ?? [];
		},
		'products_cache'
	);

	const [sortColumn, setSortColumn] = useState<InternalConsumptionSortColumn>('created_at');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const sortedConsumptions = useMemo(() => {
		const sorted = [...consumptions];
		sorted.sort((a, b) => {
			const aValue = getConsumptionSortValue(a, sortColumn);
			const bValue = getConsumptionSortValue(b, sortColumn);
			const comparison =
				typeof aValue === 'string' && typeof bValue === 'string'
					? aValue.localeCompare(bValue)
					: aValue < bValue
						? -1
						: aValue > bValue
							? 1
							: 0;
			return sortDirection === 'asc' ? comparison : -comparison;
		});
		return sorted;
	}, [consumptions, sortColumn, sortDirection]);

	const toggleSort = (column: InternalConsumptionSortColumn) => {
		if (sortColumn === column) {
			setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	const getSortIcon = (column: InternalConsumptionSortColumn) => {
		if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
		return sortDirection === 'asc' ? (
			<ArrowUp className="h-4 w-4" />
		) : (
			<ArrowDown className="h-4 w-4" />
		);
	};

	const sortableHead = (column: InternalConsumptionSortColumn, label: string) => (
		<TableHead
			className="cursor-pointer text-center font-semibold text-white"
			onClick={() => toggleSort(column)}
		>
			<div className="flex items-center justify-center gap-1">
				{label}
				{getSortIcon(column)}
			</div>
		</TableHead>
	);

	const handleExport = async (format: 'pdf' | 'csv') => {
		try {
			const { data, error: listError } = await listAllInternalConsumptions();
			if (listError) throw listError;
			const allConsumptions = data ?? [];

			if (format === 'pdf') {
				exportTableToPdf<InternalConsumption>({
					fileName: 'Consumos internos',
					columns: internalConsumptionColumns,
					data: allConsumptions,
					title: 'Listado de consumos internos',
					orientation: 'landscape',
				});
			} else {
				exportTableToCsv<InternalConsumption>({
					fileName: 'Consumos internos',
					columns: internalConsumptionColumns,
					data: allConsumptions,
				});
			}
		} catch (err: any) {
			toast({
				title: 'Error al exportar',
				description: translateError(err) || 'No se pudo exportar el listado de consumos.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="mx-auto w-full p-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-neutral-900">Consumos internos</h1>
					<p className="mt-1 text-sm text-neutral-500">
						Registrá el uso interno de productos descontando stock.
						{!loading && (
							<span className="font-medium text-neutral-700">
								{' '}
								({totalCount} {totalCount === 1 ? 'consumo' : 'consumos'})
							</span>
						)}
					</p>
				</div>

				{!loading && (
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
						{totalCount > 0 && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className="inline-flex justify-center items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:scale-[0.98]"
									>
										<FileDown className="h-4 w-4" />
										<span>Exportar</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleExport('pdf')}>
										<FileText className="h-4 w-4" />
										<span>PDF</span>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleExport('csv')}>
										<FileSpreadsheet className="h-4 w-4" />
										<span>CSV</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						<button
							onClick={() => setIsDialogOpen(true)}
							className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 sm:w-auto"
						>
							<MinusCircle className="h-4 w-4" />
							<span>Nuevo consumo</span>
						</button>
					</div>
				)}
			</div>

			{error && (
				<p role="alert" aria-live="polite" className="mb-4 text-sm text-red-600">
					{error}
				</p>
			)}

			{loading ? (
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
				</div>
			) : consumptions.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay consumos internos cargados.</p>
			) : (
				<>
					<div className="overflow-x-auto rounded-lg border border-neutral-200">
						<Table>
							<TableHeader className="bg-slate-800">
								<TableRow className="border-b-0 bg-neutral-500 hover:bg-slate-800">
									{sortableHead('created_at', 'Fecha')}
									{sortableHead('product', 'Producto')}
									{sortableHead('quantity', 'Cantidad')}
									{sortableHead('user', 'Usuario')}
									{sortableHead('description', 'Descripción')}
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedConsumptions.map((consumption) => (
									<TableRow key={consumption.id}>
										<TableCell className="whitespace-nowrap text-center text-muted-foreground">
											{formatConsumptionDate(consumption.created_at)}
										</TableCell>
										<TableCell className="text-center font-medium">
											{consumption.products?.name ?? '—'}
										</TableCell>
										<TableCell className="whitespace-nowrap text-center font-semibold text-red-600">
											{consumption.quantity != null ? consumption.quantity : '—'}
										</TableCell>
										<TableCell className="whitespace-nowrap text-center text-muted-foreground">
											{formatConsumptionUser(consumption.users)}
										</TableCell>
										<TableCell className="max-w-[220px] text-center text-muted-foreground">
											{consumption.description ?? '—'}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{totalCount > 0 && (
						<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
							<p className="text-sm text-neutral-500">
								Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} de{' '}
								{totalCount}
							</p>
							<Pagination className="!mx-0 !w-auto !ml-auto !justify-end">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={(e) => {
												e.preventDefault();
												changePage(Math.max(0, page - 1));
											}}
											className={page === 0 ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>
									{Array.from({ length: totalPages }, (_, index) => (
										<PaginationItem key={index}>
											<PaginationLink
												href="#"
												onClick={(e) => {
													e.preventDefault();
													changePage(index);
												}}
												isActive={index === page}
											>
												{index + 1}
											</PaginationLink>
										</PaginationItem>
									))}
									<PaginationItem>
										<PaginationNext
											href="#"
											onClick={(e) => {
												e.preventDefault();
												changePage(Math.min(totalPages - 1, page + 1));
											}}
											className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</>
			)}

			<InternalConsumptionDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				products={products}
			/>

			<div className="mt-6">
				<InfoBanner
					collapsible
					title="Consumos internos"
					sections={[
						{
							title: 'Utilidad',
							children:
								'En esta sección se registran los consumos internos, es decir, el uso de productos que no implica una venta. Cada consumo descuenta stock del producto y queda registrado como un movimiento de stock negativo.',
						},
						{
							title: 'Paginación',
							children:
								'El listado se muestra de a 50 consumos por página, ordenados de más reciente a más antiguo.',
						},
						{
							title: 'Descargas',
							children:
								'Podés exportar el listado completo de consumos en PDF o CSV usando el botón "Exportar".',
						},
					]}
				/>
			</div>
		</div>
	);
}
