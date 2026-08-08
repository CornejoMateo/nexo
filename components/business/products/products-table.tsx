'use client';

import { useState } from 'react';
import { Columns3, Search } from 'lucide-react';
import { Product } from '@/lib/products/products/products';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import {
	productTableColumns,
	stockFilterOptions,
	currencyFilterOptions,
	type CurrencyFilter,
	type ProductColumnId,
	type StockFilter,
} from '@/constants/products/products';
import { formatCurrency } from '@/utils/formats-money';

interface ProductsTableProps {
	products: Product[];
	totalCount: number;
	page: number;
	pageSize: number;
	searchTerm: string;
	stockFilter: StockFilter;
	currencyFilter: CurrencyFilter;
	onSearchChange: (value: string) => void;
	onStockFilterChange: (value: StockFilter) => void;
	onCurrencyFilterChange: (value: CurrencyFilter) => void;
	onPageChange: (page: number) => void;
	onEdit: (product: Product) => void;
	onDelete: (product: Product) => void;
	onView: (product: Product) => void;
	deletingId: number | null;
}

const toggleableColumnIds = productTableColumns
	.filter((column) => column.id !== 'name')
	.map((column) => column.id);

export function ProductsTable({
	products,
	totalCount,
	page,
	pageSize,
	searchTerm,
	stockFilter,
	currencyFilter,
	onSearchChange,
	onStockFilterChange,
	onCurrencyFilterChange,
	onPageChange,
	onEdit,
	onDelete,
	onView,
	deletingId,
}: ProductsTableProps) {
	const [visibleColumns, setVisibleColumns] = useState<Set<ProductColumnId>>(
		() => new Set(productTableColumns.map((column) => column.id))
	);

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const currentPage = Math.min(page, totalPages - 1);
	const rangeStart = currentPage * pageSize + 1;
	const rangeEnd = Math.min((currentPage + 1) * pageSize, totalCount);

	const toggleColumn = (columnId: ProductColumnId) => {
		setVisibleColumns((prev) => {
			const next = new Set(prev);
			if (next.has(columnId)) {
				next.delete(columnId);
			} else {
				next.add(columnId);
			}
			return next;
		});
	};

	const isColumnVisible = (columnId: ProductColumnId) => visibleColumns.has(columnId);

	return (
		<>
			<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full sm:max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
					<Input
						type="text"
						placeholder="Buscar por nombre, marca o categoría..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						aria-label="Buscar productos"
						className="w-full pl-10"
					/>
				</div>

				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
					<Select
						value={stockFilter}
						onValueChange={(value) => onStockFilterChange(value as StockFilter)}
					>
						<SelectTrigger aria-label="Filtrar por stock" className="w-full sm:w-[150px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{stockFilterOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={currencyFilter}
						onValueChange={(value) => onCurrencyFilterChange(value as CurrencyFilter)}
					>
						<SelectTrigger aria-label="Filtrar por moneda" className="w-full sm:w-[130px]">
							<SelectValue>
								{currencyFilter === 'all'
									? 'Moneda'
									: currencyFilterOptions.find((option) => option.value === currencyFilter)?.label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{currencyFilterOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
								<Columns3 className="h-4 w-4" />
								Columnas
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{toggleableColumnIds.map((columnId) => {
								const column = productTableColumns.find((c) => c.id === columnId)!;
								return (
									<DropdownMenuCheckboxItem
										key={columnId}
										checked={isColumnVisible(columnId)}
										onSelect={(event) => event.preventDefault()}
										onCheckedChange={() => toggleColumn(columnId)}
									>
										{column.label}
									</DropdownMenuCheckboxItem>
								);
							})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{products.length === 0 ? (
				<p className="text-sm text-neutral-500">No se encontraron productos para la búsqueda.</p>
			) : (
				<div className="overflow-x-auto rounded-lg border border-neutral-200">
					<Table>
						<TableHeader className="bg-slate-800">
							<TableRow className="border-b-0 bg-neutral-500 hover:bg-slate-800">
								{isColumnVisible('name') && (
									<TableHead className="text-center font-semibold text-white">Nombre</TableHead>
								)}
								{isColumnVisible('retail_usd') && (
									<TableHead className="text-center font-semibold text-white">
										Minorista USD
									</TableHead>
								)}
								{isColumnVisible('retail_ars') && (
									<TableHead className="text-center font-semibold text-white">
										Minorista ARS
									</TableHead>
								)}
								{isColumnVisible('wholesale_usd') && (
									<TableHead className="text-center font-semibold text-white">
										Mayorista USD
									</TableHead>
								)}
								{isColumnVisible('wholesale_ars') && (
									<TableHead className="text-center font-semibold text-white">
										Mayorista ARS
									</TableHead>
								)}
								{isColumnVisible('brand') && (
									<TableHead className="text-center font-semibold text-white">Marca</TableHead>
								)}
								{isColumnVisible('category') && (
									<TableHead className="text-center font-semibold text-white">Categoría</TableHead>
								)}
								{isColumnVisible('available') && (
									<TableHead className="text-center font-semibold text-white">Disponible</TableHead>
								)}
								{isColumnVisible('stock_min') && (
									<TableHead className="text-center font-semibold text-white">Stock mín.</TableHead>
								)}
								{isColumnVisible('stock_current') && (
									<TableHead className="text-center font-semibold text-white">
										Stock actual
									</TableHead>
								)}
								<TableHead className="w-40 text-center font-semibold text-white">
									Acciones
								</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{products.map((product) => (
								<TableRow
									key={product.id}
									className={
										product.stock_min !== null &&
										product.stock_current !== null &&
										product.stock_min >= product.stock_current
											? 'bg-red-100 hover:bg-red-200'
											: ''
									}
								>
									{isColumnVisible('name') && (
										<TableCell className="text-center font-medium">
											<button
												type="button"
												onClick={() => onView(product)}
												className="text-center font-medium text-neutral-900 underline-offset-2 hover:underline"
											>
												{product.name}
											</button>
										</TableCell>
									)}

									{isColumnVisible('retail_usd') && (
										<TableCell className="text-center text-muted-foreground">
											{formatCurrency(product.retail_price_usd)}
										</TableCell>
									)}

									{isColumnVisible('retail_ars') && (
										<TableCell className="text-center text-muted-foreground">
											{formatCurrency(product.retail_price_ars)}
										</TableCell>
									)}

									{isColumnVisible('wholesale_usd') && (
										<TableCell className="text-center text-muted-foreground">
											{formatCurrency(product.wholesale_price_usd)}
										</TableCell>
									)}

									{isColumnVisible('wholesale_ars') && (
										<TableCell className="text-center text-muted-foreground">
											{formatCurrency(product.wholesale_price_ars)}
										</TableCell>
									)}

									{isColumnVisible('brand') && (
										<TableCell className="text-center text-muted-foreground">
											{product.brands?.name || '—'}
										</TableCell>
									)}

									{isColumnVisible('category') && (
										<TableCell className="text-center text-muted-foreground">
											{product.categories?.name || '—'}
										</TableCell>
									)}

									{isColumnVisible('available') && (
										<TableCell className="text-center text-muted-foreground">
											{product.is_available_for_sale ? 'Sí' : 'No'}
										</TableCell>
									)}

									{isColumnVisible('stock_min') && (
										<TableCell className="text-center text-muted-foreground">
											{product.stock_min !== null ? product.stock_min : '—'}
										</TableCell>
									)}

									{isColumnVisible('stock_current') && (
										<TableCell className="text-center text-muted-foreground">
											{product.stock_current !== null ? product.stock_current : '—'}
										</TableCell>
									)}

									<TableCell>
										<div className="flex items-center justify-center gap-2">
											<button
												onClick={() => onView(product)}
												disabled={deletingId === product.id}
												className="rounded-md bg-blue-600 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
											>
												Ver
											</button>
											<button
												onClick={() => onEdit(product)}
												disabled={deletingId === product.id}
												className="rounded-md bg-neutral-400 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
											>
												Editar
											</button>
											<button
												onClick={() => onDelete(product)}
												className="rounded-md bg-red-600 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
												disabled={deletingId === product.id}
											>
												{deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
											</button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{products.length > 0 && (
				<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
					<p className="text-sm text-neutral-500">
						Mostrando {rangeStart}–{rangeEnd} de {totalCount}
					</p>
					<Pagination className="!mx-0 !w-auto !ml-auto !justify-end">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										onPageChange(Math.max(0, currentPage - 1));
									}}
									className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
								/>
							</PaginationItem>
							{Array.from({ length: totalPages }, (_, index) => (
								<PaginationItem key={index}>
									<PaginationLink
										href="#"
										onClick={(e) => {
											e.preventDefault();
											onPageChange(index);
										}}
										isActive={index === currentPage}
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
										onPageChange(Math.min(totalPages - 1, currentPage + 1));
									}}
									className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</>
	);
}
